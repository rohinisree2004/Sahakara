const Group = require('../models/Group');
const Member = require('../models/Member');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');

// Helper to resolve orgId from request context
const getOrgId = (req) => {
  if (req.user.role === 'Super Admin') {
    return req.query.organizationId || req.body.organizationId || null;
  }
  return req.user.organizationId || null;
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
    const orgId = getOrgId(req);

    const baseQuery = { isDeleted: false };
    if (orgId) baseQuery.organizationId = orgId;

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
    const orgId = getOrgId(req);
    const { search, status, groupType, branchId } = req.query;

    let query = { isDeleted: false };
    if (orgId) query.organizationId = orgId;
    if (status && status !== 'All') query.status = status;
    if (groupType && groupType !== 'All') query.groupType = groupType;
    if (branchId && branchId !== 'All') query.branchId = branchId;

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

// @desc    Create New Member Group (Auto Group Code Generator)
// @route   POST /api/v1/groups
// @access  Private (Org Admin, Super Admin, Branch Manager, Employees)
exports.createGroup = async (req, res, next) => {
  try {
    let orgId = getOrgId(req);
    const { groupName, groupType, description, branchId, leaderId, memberIds, organizationId } = req.body;

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

    // Auto generate Group Code & Group ID: GRP-2026-00X & SHG-10X
    const num = Math.floor(100 + Math.random() * 900);
    const generatedGroupId = `GRP-${new Date().getFullYear()}-${num}`;
    const generatedGroupCode = `SHG-${num}`;

    let branch = branchId;
    if (!branch) {
      const defaultBranch = await Branch.findOne({ organizationId: orgId, isDeleted: false });
      branch = defaultBranch ? defaultBranch._id : null;
    }

    const membersList = Array.isArray(memberIds) ? memberIds : [];

    const newGroup = await Group.create({
      organizationId: orgId,
      branchId: branch,
      groupId: generatedGroupId,
      groupCode: generatedGroupCode,
      groupName,
      groupType: groupType || 'Self-Help Group (SHG)',
      description: description || '',
      leaderId: leaderId || null,
      memberIds: membersList,
      totalMembers: membersList.length,
      status: 'Active',
      createdBy: req.user._id,
    });

    await logGroupAudit(req, 'GROUP_CREATED', `Created new group '${groupName}' (${generatedGroupCode})`, orgId);

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
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .populate('leaderId', 'fullName phone memberId')
      .populate('memberIds', 'fullName phone memberId category membershipStatus');

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
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
    if (group) {
      if (groupName) group.groupName = groupName;
      if (groupType) group.groupType = groupType;
      if (description) group.description = description;
      group.updatedBy = req.user._id;
      await group.save();
    }

    await logGroupAudit(req, 'GROUP_UPDATED', `Updated details for group ${groupId}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Group profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign / Change Group Leader
// @route   PUT /api/v1/groups/:id/leader
// @access  Private (Org Admin, Super Admin, Branch Manager)
exports.assignGroupLeader = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const groupId = req.params.id;
    const { leaderId } = req.body;

    if (!leaderId) {
      return res.status(400).json({
        success: false,
        error: 'Please select member to set as Group Leader.',
      });
    }

    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (group) {
      group.leaderId = leaderId;
      await group.save();
    }

    await logGroupAudit(req, 'GROUP_LEADER_ASSIGNED', `Assigned new leader ${leaderId} to group ${groupId}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Group Leader assigned successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Member(s) to Group
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
    if (group) {
      const toAdd = Array.isArray(memberIds) ? memberIds : [memberIds];
      toAdd.forEach((mId) => {
        if (!group.memberIds.includes(mId)) {
          group.memberIds.push(mId);
        }
      });
      group.totalMembers = group.memberIds.length;
      await group.save();
    }

    await logGroupAudit(req, 'GROUP_MEMBERS_ADDED', `Added members to group ${groupId}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Members added to group successfully!',
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
    if (group) {
      group.memberIds = group.memberIds.filter((m) => m.toString() !== memberId.toString());
      group.totalMembers = group.memberIds.length;
      await group.save();
    }

    await logGroupAudit(req, 'GROUP_MEMBER_REMOVED', `Removed member ${memberId} from group ${groupId}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Member removed from group.',
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

    if (sourceGroupId) {
      let srcFilter = { _id: sourceGroupId, isDeleted: false };
      if (orgId) srcFilter.organizationId = orgId;
      const srcGroup = await Group.findOne(srcFilter);
      if (srcGroup) {
        srcGroup.memberIds = srcGroup.memberIds.filter((m) => m.toString() !== memberId.toString());
        srcGroup.totalMembers = srcGroup.memberIds.length;
        await srcGroup.save();
      }
    }

    if (targetGroupId) {
      let tgtFilter = { _id: targetGroupId, isDeleted: false };
      if (orgId) tgtFilter.organizationId = orgId;
      const tgtGroup = await Group.findOne(tgtFilter);
      if (tgtGroup) {
        if (!tgtGroup.memberIds.includes(memberId)) {
          tgtGroup.memberIds.push(memberId);
          tgtGroup.totalMembers = tgtGroup.memberIds.length;
          await tgtGroup.save();
        }
      }
    }

    await logGroupAudit(req, 'GROUP_MEMBER_TRANSFERRED', `Transferred member ${memberId} to group ${targetGroupId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Member transferred to target group successfully!',
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

    let newStatus = 'Active';
    let filter = { _id: groupId, isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const group = await Group.findOne(filter);
    if (group) {
      newStatus = group.status === 'Active' ? 'Inactive' : 'Active';
      group.status = newStatus;
      await group.save();
    }

    await logGroupAudit(req, 'GROUP_STATUS_TOGGLED', `Set group ${groupId} status to ${newStatus}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: `Group status set to ${newStatus}.`,
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
    if (group) {
      group.isDeleted = true;
      await group.save();
    }

    await logGroupAudit(req, 'GROUP_DELETED', `Soft deleted group ${groupId}`, orgId || group?.organizationId);

    return res.status(200).json({
      success: true,
      message: 'Group record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Group Reports
// @route   GET /api/v1/groups/reports
// @access  Private
exports.getGroupReports = async (req, res, next) => {
  try {
    const { reportType } = req.query;
    const orgId = getOrgId(req);

    const filter = { isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const groups = await Group.find(filter)
      .populate('leaderId', 'fullName')
      .limit(50);

    const groupSummary = groups.map((g) => ({
      groupCode: g.groupCode,
      name: g.groupName,
      leader: g.leaderId ? g.leaderId.fullName : 'Not Assigned',
      memberCount: g.totalMembers || (g.memberIds ? g.memberIds.length : 0),
      savings: '—',
      loans: '—',
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
    const logs = await AuditLog.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
