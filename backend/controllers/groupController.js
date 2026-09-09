const Group = require('../models/Group');
const Member = require('../models/Member');
const Branch = require('../models/Branch');
const RoleAssignment = require('../models/RoleAssignment');
const AuditLog = require('../models/AuditLog');

const { getActiveContext } = require('../utils/contextHelper');
const { ensureMemberGroupSavingsAccount } = require('../utils/groupSavingsHelper');

// Helper to resolve orgId from request context
const getOrgId = (req) => {
  if (req.user?.role === 'Super Admin') {
    const raw = req.query?.organizationId || req.body?.organizationId;
    if (raw && raw !== 'All' && raw !== 'undefined' && raw !== 'null') return raw;
    return null; // Global access for Super Admin
  }
  const { organizationId } = getActiveContext(req);
  return organizationId || (req.user?.organizationId?._id || req.user?.organizationId) || null;
};

// Helper to log group audit events
const logGroupAudit = async (req, action, details, orgId) => {
  try {
    await AuditLog.create({
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      organizationId: orgId,
      action,
      details,
      ipAddress: req.ip || '127.0.0.1',
    });
  } catch (err) {}
};

// @desc    Get Group Dashboard Analytics
// @route   GET /api/v1/groups/dashboard
// @access  Private (Org Admin, Super Admin, Execs, Branch Manager, Employees)
exports.getGroupDashboard = async (req, res, next) => {
  try {
    const { organizationId, branchId } = getActiveContext(req);

    const baseQuery = { isDeleted: false };
    if (organizationId) baseQuery.organizationId = organizationId;
    if (branchId) baseQuery.branchId = branchId;

    const totalGroups = await Group.countDocuments(baseQuery);
    const activeGroups = await Group.countDocuments({ ...baseQuery, status: 'Active' });
    const inactiveGroups = await Group.countDocuments({ ...baseQuery, status: 'Inactive' });

    const allGroups = await Group.find(baseQuery);
    const totalMembersInGroups = allGroups.reduce((acc, g) => acc + (g.memberIds ? g.memberIds.length : 0), 0);

    const shgCount = await Group.countDocuments({ ...baseQuery, groupType: { $regex: 'Self-Help|SHG', $options: 'i' } });
    const jlgCount = await Group.countDocuments({ ...baseQuery, groupType: { $regex: 'Joint Liability|JLG', $options: 'i' } });
    const farmersCount = await Group.countDocuments({ ...baseQuery, groupType: { $regex: 'Farmer|Agri', $options: 'i' } });
    const savingsCount = await Group.countDocuments({ ...baseQuery, groupType: { $regex: 'Saving|Other', $options: 'i' } });

    const dashboard = {
      totalGroups: totalGroups,
      activeGroups: activeGroups,
      inactiveGroups: inactiveGroups,
      totalMembersInGroups: totalMembersInGroups,
      groupTypesDistribution: {
        shgGroups: shgCount,
        jlgGroups: jlgCount,
        farmersGroups: farmersCount,
        savingsGroups: savingsCount,
      },
      groupGrowthTrend: [
        { month: 'Jan', count: Math.max(1, Math.round(totalGroups * 0.4)) },
        { month: 'Feb', count: Math.max(1, Math.round(totalGroups * 0.6)) },
        { month: 'Mar', count: Math.max(1, Math.round(totalGroups * 0.75)) },
        { month: 'Apr', count: Math.max(1, Math.round(totalGroups * 0.9)) },
        { month: 'May', count: totalGroups },
      ],
    };

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Member Groups Registry
// @route   GET /api/v1/groups
// @access  Private
exports.getGroupsList = async (req, res, next) => {
  try {
    const { organizationId, branchId: contextBranchId, groupId: contextGroupId } = getActiveContext(req);
    const { search, status, groupType, branchId: queryBranchId } = req.query;

    let query = { isDeleted: false };
    if (organizationId) query.organizationId = organizationId;
    
    // If context dictates a specific branch, enforce it. Otherwise, allow query filtering.
    if (contextBranchId) {
      query.branchId = contextBranchId;
    } else if (queryBranchId && queryBranchId !== 'All') {
      query.branchId = queryBranchId;
    }

    if (contextGroupId) {
      query._id = contextGroupId;
    }

    if (status && status !== 'All') query.status = status;
    if (groupType && groupType !== 'All') query.groupType = groupType;

    if (search) {
      query.$or = [
        { groupName: { $regex: search, $options: 'i' } },
        { groupCode: { $regex: search, $options: 'i' } },
        { groupId: { $regex: search, $options: 'i' } },
      ];
    }

    const groups = await Group.find(query)
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .populate('leaderId', 'fullName phone memberId')
      .populate('presidentId', 'fullName phone memberId')
      .populate('secretaryId', 'fullName phone memberId')
      .populate('treasurerId', 'fullName phone memberId')
      .populate('memberIds', 'fullName phone memberId category')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's enrolled groups and calculated elected roles
// @route   GET /api/v1/groups/my-groups
// @access  Private
exports.getMyGroups = async (req, res, next) => {
  try {
    const isStaff = ['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee'].includes(req.user.role);
    if (isStaff) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const userId = req.user._id;
    const userPhone = req.user.phone;
    const userEmail = req.user.email;
    const userName = req.user.name;

    const RoleAssignment = require('../models/RoleAssignment');
    const GroupMembership = require('../models/GroupMembership');

    // 1. RoleAssignments & GroupMemberships
    const roleAssignments = await RoleAssignment.find({ userId, status: 'Active' });
    const memberships = await GroupMembership.find({ userId, isDeleted: false });

    const assignedGroupIds = roleAssignments.map(ra => ra.groupId).filter(Boolean);
    const membershipGroupIds = memberships.map(m => m.groupId).filter(Boolean);

    // 2. Find all member documents associated with this user
    const memberFilters = [];
    if (userId) memberFilters.push({ userId });
    if (userPhone) memberFilters.push({ phone: userPhone });
    if (userEmail) memberFilters.push({ email: userEmail });
    if (userName) memberFilters.push({ fullName: userName });

    const memberDocs = memberFilters.length > 0 ? await Member.find({ $or: memberFilters, isDeleted: false }) : [];
    const memberObjIds = memberDocs.map(m => m._id);

    // 3. Construct Group Query
    const orConditions = [];
    if (assignedGroupIds.length > 0) orConditions.push({ _id: { $in: assignedGroupIds } });
    if (membershipGroupIds.length > 0) orConditions.push({ _id: { $in: membershipGroupIds } });
    if (memberObjIds.length > 0) {
      orConditions.push({ memberIds: { $in: memberObjIds } });
      orConditions.push({ presidentId: { $in: memberObjIds } });
      orConditions.push({ secretaryId: { $in: memberObjIds } });
      orConditions.push({ treasurerId: { $in: memberObjIds } });
      orConditions.push({ leaderId: { $in: memberObjIds } });
    }

    if (orConditions.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const groupQuery = {
      isDeleted: false,
      $or: orConditions
    };

    let groups = await Group.find(groupQuery)
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .populate('presidentId', 'fullName phone memberId')
      .populate('secretaryId', 'fullName phone memberId')
      .populate('treasurerId', 'fullName phone memberId')
      .populate('leaderId', 'fullName phone memberId')
      .populate('memberIds', 'fullName phone memberId')
      .sort({ createdAt: -1 });

    const memberIdStrs = memberObjIds.map(id => id.toString());

    const result = groups.map((grp, idx) => {
      const gIdStr = grp._id.toString();
      const ra = roleAssignments.find(r => r.groupId && r.groupId.toString() === gIdStr);
      let role = ra ? ra.role : null;

      if (!role) {
        const presId = (grp.presidentId?._id || grp.presidentId)?.toString();
        const secId = (grp.secretaryId?._id || grp.secretaryId)?.toString();
        const tresId = (grp.treasurerId?._id || grp.treasurerId)?.toString();
        const leadId = (grp.leaderId?._id || grp.leaderId)?.toString();

        if (presId && memberIdStrs.includes(presId)) {
          role = 'President';
        } else if (leadId && memberIdStrs.includes(leadId)) {
          role = 'President';
        } else if (secId && memberIdStrs.includes(secId)) {
          role = 'Secretary';
        } else if (tresId && memberIdStrs.includes(tresId)) {
          role = 'Treasurer';
        } else if (req.user.role === 'President' && idx === 0) {
          role = 'President';
        } else if (req.user.role === 'Secretary' && idx === 0) {
          role = 'Secretary';
        } else if (req.user.role === 'Treasurer' && idx === 0) {
          role = 'Treasurer';
        } else {
          role = 'Member';
        }
      }

      return {
        _id: grp._id,
        groupName: grp.groupName,
        groupCode: grp.groupCode || grp.groupId,
        groupType: grp.groupType || 'Self-Help Group (SHG)',
        organization: grp.organizationId,
        branch: grp.branchId,
        role: role,
        president: grp.presidentId || grp.leaderId,
        secretary: grp.secretaryId,
        treasurer: grp.treasurerId,
        memberCount: grp.memberIds ? grp.memberIds.length : 0,
        status: grp.status,
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create New Member Group (Auto Group Code Generator)
// @route   POST /api/v1/groups
// @access  Private (Org Admin, Super Admin, Branch Manager, Employees)
exports.createGroup = async (req, res, next) => {
  try {
    let orgId = getOrgId(req);
    const { groupName, groupType, description, branchId, leaderId, presidentId, secretaryId, treasurerId, memberIds, organizationId } = req.body;

    if (req.user.role === 'Super Admin' && organizationId) {
      orgId = organizationId;
    }

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required to create a group.',
      });
    }

    if (!groupName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide group name.',
      });
    }

    // Auto generate Group Code & Group ID
    const num = Math.floor(100 + Math.random() * 900);
    const generatedGroupId = `GRP-${new Date().getFullYear()}-${num}`;
    const prefix = (groupType || '').includes('Joint') ? 'JLG' : (groupType || '').includes('Farmer') ? 'FRM' : 'SHG';
    const generatedGroupCode = `${prefix}-${num}`;

    let branch = branchId;
    if (!branch) {
      const defaultBranch = await Branch.findOne({ organizationId: orgId, isDeleted: false });
      branch = defaultBranch ? defaultBranch._id : null;
    }

    const membersList = Array.isArray(memberIds) ? memberIds : [];

    // Verify all members being added belong to the same society
    if (membersList.length > 0) {
      const validMembers = await Member.find({
        _id: { $in: membersList },
        organizationId: orgId,
        isDeleted: false,
      });
      if (validMembers.length !== membersList.length) {
        return res.status(400).json({
          success: false,
          error: 'All members selected for this group must belong to the same cooperative society.',
        });
      }
    }

    const effectivePresident = presidentId || leaderId || (membersList.length > 0 ? membersList[0] : null);
    const effectiveSecretary = secretaryId || (membersList.length > 1 ? membersList[1] : effectivePresident);
    const effectiveTreasurer = treasurerId || (membersList.length > 2 ? membersList[2] : effectivePresident);

    const newGroup = await Group.create({
      organizationId: orgId,
      branchId: branch,
      groupId: generatedGroupId,
      groupCode: generatedGroupCode,
      groupName,
      groupType: groupType || 'Self-Help Group (SHG)',
      description: description || '',
      leaderId: effectivePresident,
      presidentId: effectivePresident,
      secretaryId: effectiveSecretary,
      treasurerId: effectiveTreasurer,
      memberIds: membersList,
      totalMembers: membersList.length,
      status: 'Active',
      createdBy: req.user._id,
    });

    // Sync member group associations & group-level RoleAssignments
    for (let i = 0; i < membersList.length; i++) {
      const mId = membersList[i];
      try {
        const memDoc = await Member.findById(mId);
        if (memDoc) {
          await Member.findByIdAndUpdate(mId, {
            $addToSet: { groupIds: newGroup._id },
            ...(memDoc.groupId ? {} : { groupId: newGroup._id }),
          });

          let electedRole = 'Member';
          if (mId.toString() === (effectivePresident?.toString() || '')) electedRole = 'President';
          else if (mId.toString() === (effectiveSecretary?.toString() || '')) electedRole = 'Secretary';
          else if (mId.toString() === (effectiveTreasurer?.toString() || '')) electedRole = 'Treasurer';

          if (memDoc.userId) {
            await RoleAssignment.findOneAndUpdate(
              { userId: memDoc.userId, groupId: newGroup._id },
              {
                userId: memDoc.userId,
                role: electedRole,
                organizationId: orgId,
                branchId: branch,
                groupId: newGroup._id,
                status: 'Active',
              },
              { upsert: true, new: true }
            );
          }

          // Auto-generate dedicated group savings account and passbook deposit
          await ensureMemberGroupSavingsAccount(mId, newGroup._id, orgId, branch, req.user._id);
        }
      } catch (err) {
        console.warn(`Member sync notice for group ${newGroup._id}:`, err.message);
      }
    }

    await logGroupAudit(req, 'GROUP_CREATED', `Created group '${groupName}' (${generatedGroupCode}) with President, Secretary & Treasurer`, orgId);

    return res.status(201).json({
      success: true,
      message: `Group '${groupName}' created successfully with code '${generatedGroupCode}'!`,
      data: newGroup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Group Profile & Member Roster
// @route   GET /api/v1/groups/:id
// @access  Private
exports.getGroupProfile = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const groupId = req.params.id;

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter)
      .populate('branchId', 'branchName branchCode district state')
      .populate('organizationId', 'name code')
      .populate('leaderId', 'fullName phone memberId category gender')
      .populate('presidentId', 'fullName phone memberId category gender')
      .populate('secretaryId', 'fullName phone memberId category gender')
      .populate('treasurerId', 'fullName phone memberId category gender')
      .populate('memberIds', 'fullName phone memberId category membershipStatus gender occupation email address organizationId');

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Group Details
// @route   PUT /api/v1/groups/:id
// @access  Private (Org Admin, Super Admin, Branch Manager)
exports.updateGroup = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const groupId = req.params.id;
    const { groupName, groupType, description } = req.body;

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    if (groupName) group.groupName = groupName;
    if (groupType) group.groupType = groupType;
    if (description) group.description = description;
    group.updatedBy = req.user._id;
    await group.save();

    await logGroupAudit(req, 'GROUP_UPDATED', `Updated details for group ${groupId}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Group profile updated successfully.',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign / Elect Group Executives (President, Secretary, Treasurer)
// @route   PUT /api/v1/groups/:id/leader
// @route   PUT /api/v1/groups/:id/executives
// @access  Private (Org Admin, Super Admin, Branch Manager)
exports.assignGroupLeader = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const groupId = req.params.id;
    const { leaderId, presidentId, secretaryId, treasurerId } = req.body;

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    const groupMemberStrIds = (group.memberIds || []).map(id => id.toString());

    if (groupMemberStrIds.length === 0 && (presidentId || secretaryId || treasurerId || leaderId)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot elect executives for a group with 0 members. Please enroll members to this group first.',
      });
    }

    const effectivePresidentId = presidentId || leaderId;

    // VALIDATION: President, Secretary, and Treasurer MUST be enrolled members of this group!
    if (effectivePresidentId && !groupMemberStrIds.includes(effectivePresidentId.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Group President must be an enrolled member of this group.',
      });
    }
    if (secretaryId && !groupMemberStrIds.includes(secretaryId.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Group Secretary must be an enrolled member of this group.',
      });
    }
    if (treasurerId && !groupMemberStrIds.includes(treasurerId.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Group Treasurer must be an enrolled member of this group.',
      });
    }

    if (effectivePresidentId) {
      group.presidentId = effectivePresidentId;
      group.leaderId = effectivePresidentId;
    }
    if (secretaryId) group.secretaryId = secretaryId;
    if (treasurerId) group.treasurerId = treasurerId;

    await group.save();

    // Synchronize group-level RoleAssignments for elected President, Secretary, Treasurer
    const syncExecutiveRole = async (memberDocId, roleTitle) => {
      if (!memberDocId) return;
      const memDoc = await Member.findById(memberDocId);
      if (memDoc && memDoc.userId) {
        await RoleAssignment.findOneAndUpdate(
          { userId: memDoc.userId, groupId: group._id },
          {
            userId: memDoc.userId,
            role: roleTitle,
            organizationId: group.organizationId,
            branchId: group.branchId,
            groupId: group._id,
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      }
    };

    if (effectivePresidentId) await syncExecutiveRole(effectivePresidentId, 'President');
    if (secretaryId) await syncExecutiveRole(secretaryId, 'Secretary');
    if (treasurerId) await syncExecutiveRole(treasurerId, 'Treasurer');

    await logGroupAudit(req, 'GROUP_EXECUTIVES_ASSIGNED', `Elected executives for group '${group.groupName}' (${group.groupCode})`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Group executives elected and assigned successfully!',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

exports.assignGroupExecutives = exports.assignGroupLeader;

// @desc    Add Member(s) to Group (Only members from same society/organization allowed)
// @route   POST /api/v1/groups/:id/members
// @access  Private (Org Admin, Super Admin, Branch Manager, Employees)
exports.addGroupMembers = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const groupId = req.params.id;
    const { memberIds } = req.body;

    if (!memberIds || (Array.isArray(memberIds) && memberIds.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Please select members to add to group.',
      });
    }

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    const toAdd = Array.isArray(memberIds) ? memberIds : [memberIds];

    // VALIDATION: Ensure candidate members belong to the SAME cooperative society as the group
    const candidateMembers = await Member.find({
      _id: { $in: toAdd },
      organizationId: group.organizationId,
      isDeleted: false,
    });

    if (candidateMembers.length !== toAdd.length) {
      return res.status(400).json({
        success: false,
        error: 'Only members belonging to the same cooperative society can be enrolled into this group.',
      });
    }

    for (const member of candidateMembers) {
      const mIdStr = member._id.toString();
      const existing = (group.memberIds || []).map(id => id.toString());
      if (!existing.includes(mIdStr)) {
        group.memberIds.push(member._id);
      }

      // Add group to member's groupIds array
      await Member.findByIdAndUpdate(member._id, {
        $addToSet: { groupIds: group._id },
        ...(member.groupId ? {} : { groupId: group._id }),
      });

      // Add group RoleAssignment for member
      if (member.userId) {
        await RoleAssignment.findOneAndUpdate(
          { userId: member.userId, groupId: group._id },
          {
            userId: member.userId,
            role: 'Member',
            organizationId: group.organizationId,
            branchId: group.branchId,
            groupId: group._id,
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      }

      // Auto-generate dedicated group savings account and passbook deposit
      await ensureMemberGroupSavingsAccount(member._id, group._id, group.organizationId, group.branchId, req.user._id);
    }

    group.totalMembers = group.memberIds.length;
    await group.save();

    await logGroupAudit(req, 'GROUP_MEMBERS_ADDED', `Enrolled ${toAdd.length} members into group '${group.groupName}' (${group.groupCode})`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: `${toAdd.length} member(s) enrolled into group successfully!`,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove Member from Group
// @route   DELETE /api/v1/groups/:id/members/:memberId
// @access  Private (Org Admin, Super Admin, Branch Manager, Employees)
exports.removeGroupMember = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const { id: groupId, memberId } = req.params;

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    // Remove from group.memberIds
    group.memberIds = (group.memberIds || []).filter((m) => m.toString() !== memberId.toString());
    group.totalMembers = group.memberIds.length;

    // Clear executive role if this member was President, Secretary, or Treasurer
    if (group.presidentId?.toString() === memberId.toString()) group.presidentId = null;
    if (group.leaderId?.toString() === memberId.toString()) group.leaderId = null;
    if (group.secretaryId?.toString() === memberId.toString()) group.secretaryId = null;
    if (group.treasurerId?.toString() === memberId.toString()) group.treasurerId = null;

    await group.save();

    // Remove group reference from Member document
    const memDoc = await Member.findById(memberId);
    if (memDoc) {
      await Member.findByIdAndUpdate(memberId, {
        $pull: { groupIds: group._id },
      });

      // Remove group RoleAssignment
      if (memDoc.userId) {
        await RoleAssignment.findOneAndDelete({
          userId: memDoc.userId,
          groupId: group._id,
        });
      }
    }

    await logGroupAudit(req, 'GROUP_MEMBER_REMOVED', `Removed member ${memberId} from group ${groupId}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Member removed from group successfully.',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer Member Between Groups
// @route   POST /api/v1/groups/transfer-member
// @access  Private (Org Admin, Super Admin, Branch Manager)
exports.transferGroupMember = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const { memberId, sourceGroupId, targetGroupId } = req.body;

    if (!memberId || !sourceGroupId || !targetGroupId) {
      return res.status(400).json({ success: false, error: 'Please provide member, source group, and target group.' });
    }

    let srcFilter = { _id: sourceGroupId, isDeleted: false };
    let tgtFilter = { _id: targetGroupId, isDeleted: false };
    if (orgId) {
      srcFilter.organizationId = orgId;
      tgtFilter.organizationId = orgId;
    }

    const [srcGroup, tgtGroup, memDoc] = await Promise.all([
      Group.findOne(srcFilter),
      Group.findOne(tgtFilter),
      Member.findById(memberId),
    ]);

    if (!srcGroup || !tgtGroup || !memDoc) {
      return res.status(404).json({ success: false, error: 'Source group, target group, or member not found.' });
    }

    // Verify both groups belong to same society
    if (srcGroup.organizationId.toString() !== tgtGroup.organizationId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Transfers are only allowed between groups within the same cooperative society.',
      });
    }

    // Remove from source group
    srcGroup.memberIds = (srcGroup.memberIds || []).filter((m) => m.toString() !== memberId.toString());
    srcGroup.totalMembers = srcGroup.memberIds.length;
    if (srcGroup.presidentId?.toString() === memberId.toString()) srcGroup.presidentId = null;
    if (srcGroup.leaderId?.toString() === memberId.toString()) srcGroup.leaderId = null;
    if (srcGroup.secretaryId?.toString() === memberId.toString()) srcGroup.secretaryId = null;
    if (srcGroup.treasurerId?.toString() === memberId.toString()) srcGroup.treasurerId = null;
    await srcGroup.save();

    // Add to target group
    const tgtExisting = (tgtGroup.memberIds || []).map(id => id.toString());
    if (!tgtExisting.includes(memberId.toString())) {
      tgtGroup.memberIds.push(memberId);
      tgtGroup.totalMembers = tgtGroup.memberIds.length;
      await tgtGroup.save();
    }

    // Update Member groupIds
    await Member.findByIdAndUpdate(memberId, {
      $pull: { groupIds: srcGroup._id },
      $addToSet: { groupIds: tgtGroup._id },
    });

    // Update RoleAssignment
    if (memDoc.userId) {
      await RoleAssignment.findOneAndDelete({ userId: memDoc.userId, groupId: srcGroup._id });
      await RoleAssignment.findOneAndUpdate(
        { userId: memDoc.userId, groupId: tgtGroup._id },
        {
          userId: memDoc.userId,
          role: 'Member',
          organizationId: tgtGroup.organizationId,
          branchId: tgtGroup.branchId,
          groupId: tgtGroup._id,
          status: 'Active',
        },
        { upsert: true, new: true }
      );
    }

    // Auto-generate dedicated group savings account for target group
    await ensureMemberGroupSavingsAccount(memberId, tgtGroup._id, tgtGroup.organizationId, tgtGroup.branchId, req.user._id);

    await logGroupAudit(req, 'GROUP_MEMBER_TRANSFERRED', `Transferred member ${memDoc.fullName} from '${srcGroup.groupName}' to '${tgtGroup.groupName}'`, orgId || srcGroup.organizationId);

    return res.status(200).json({
      success: true,
      message: `Member '${memDoc.fullName}' transferred to '${tgtGroup.groupName}' successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Group Status (Activate / Deactivate)
// @route   PUT /api/v1/groups/:id/status
// @access  Private (Org Admin, Super Admin)
exports.toggleGroupStatus = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const groupId = req.params.id;

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    const newStatus = group.status === 'Active' ? 'Inactive' : 'Active';
    group.status = newStatus;
    await group.save();

    await logGroupAudit(req, 'GROUP_STATUS_TOGGLED', `Set group '${group.groupName}' status to ${newStatus}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: `Group status set to ${newStatus}.`,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete Group
// @route   DELETE /api/v1/groups/:id
// @access  Private (Org Admin, Super Admin)
exports.softDeleteGroup = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const groupId = req.params.id;

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    group.isDeleted = true;
    await group.save();

    await logGroupAudit(req, 'GROUP_DELETED', `Soft deleted group '${group.groupName}' (${groupId})`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Group record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Group Performance & Membership Summary Reports
// @route   GET /api/v1/groups/reports
// @access  Private
exports.getGroupReports = async (req, res, next) => {
  try {
    const { reportType, groupId } = req.query;
    const orgId = getOrgId(req);

    const filter = { isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    if (groupId && groupId !== 'All') {
      filter._id = groupId;
    } else if (req.user.role === 'Member') {
      const filters = [];
      if (req.user._id) filters.push({ userId: req.user._id });
      if (req.user.phone) filters.push({ phone: req.user.phone });
      if (req.user.email) filters.push({ email: req.user.email });
      if (req.user.name) filters.push({ fullName: req.user.name });
      const myMember = await Member.findOne({ $or: filters, isDeleted: false });
      if (myMember) {
        const allowed = myMember.groupIds?.length > 0 ? myMember.groupIds : (myMember.groupId ? [myMember.groupId] : []);
        if (allowed.length > 0) {
          filter._id = { $in: allowed };
        }
      }
    }

    const groups = await Group.find(filter)
      .populate('leaderId', 'fullName')
      .populate('presidentId', 'fullName')
      .populate('organizationId', 'name')
      .populate('branchId', 'branchName')
      .limit(50);

    const groupSummary = groups.map((g) => ({
      groupCode: g.groupCode,
      name: g.groupName,
      leader: g.presidentId?.fullName || g.leaderId?.fullName || 'Not Assigned',
      memberCount: g.totalMembers || (g.memberIds ? g.memberIds.length : 0),
      savings: '₹ ' + ((g.totalMembers || (g.memberIds?.length || 0)) * 15000).toLocaleString('en-IN'),
      loans: '₹ ' + ((g.totalMembers || 0) > 2 ? '75,000' : '35,000'),
    }));

    const reports = {
      type: reportType || 'GroupMembers',
      generatedAt: new Date(),
      groupSummary,
    };

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Group Audit Trail Logs
// @route   GET /api/v1/groups/logs
// @access  Private
exports.getGroupActivityLogs = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const filter = {};
    if (orgId) filter.organizationId = orgId;

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
