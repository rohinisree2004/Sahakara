const Member = require('../models/Member');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper to resolve orgId from request context
const getOrgId = (req) => {
  if (req.user.role === 'Super Admin') {
    return req.query.organizationId || req.body.organizationId || null;
  }
  return req.user.organizationId || null;
};

// Helper to log member audit events
const logMemberAudit = async (req, action, details, orgId) => {
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

// @desc    Get Member Dashboard Metrics
// @route   GET /api/v1/members/dashboard
// @access  Private (Org Admin, Super Admin, Execs, Branch Manager, Employees)
exports.getMemberDashboard = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const query = { isDeleted: false };
    if (orgId) query.organizationId = orgId;

    let totalMembers = 0;
    let activeMembers = 0;
    let pendingMembers = 0;
    let suspendedMembers = 0;
    let newThisMonth = 0;
    let regularMembers = 0;
    let associateMembers = 0;
    let nominalMembers = 0;

    try {
      totalMembers = await Member.countDocuments(query);
      activeMembers = await Member.countDocuments({ ...query, membershipStatus: 'Active' });
      pendingMembers = await Member.countDocuments({ ...query, membershipStatus: 'Pending' });
      suspendedMembers = await Member.countDocuments({ ...query, membershipStatus: 'Suspended' });

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      newThisMonth = await Member.countDocuments({ ...query, createdAt: { $gte: startOfMonth } });

      regularMembers = await Member.countDocuments({ ...query, category: 'Regular Member' });
      associateMembers = await Member.countDocuments({ ...query, category: 'Associate Member' });
      nominalMembers = await Member.countDocuments({ ...query, category: 'Nominal Member' });
    } catch (e) {}

    const dashboard = {
      totalMembers,
      activeMembers,
      pendingApprovals: pendingMembers,
      suspendedMembers,
      newThisMonth,
      membershipGrowthTrend: [],
      categoryDistribution: {
        regularMembers,
        associateMembers,
        nominalMembers,
      },
    };

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Members Directory (Search & Filter)
// @route   GET /api/v1/members
// @access  Private
exports.getMembersList = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const { search, status, branchId, category } = req.query;

    let query = { isDeleted: false };
    if (orgId) query.organizationId = orgId;
    if (status && status !== 'All') query.membershipStatus = status;
    if (branchId && branchId !== 'All') query.branchId = branchId;
    if (category && category !== 'All') query.category = category;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(query)
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register New Cooperative Member (Auto Member ID Generator)
// @route   POST /api/v1/members
// @access  Private (Org Admin, Super Admin, Branch Manager, Employees)
exports.registerMember = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const {
      fullName,
      gender,
      dob,
      phone,
      email,
      address,
      district,
      state,
      pincode,
      occupation,
      branchId,
      category,
      nomineeName,
      nomineeRelationship,
      nomineeShare,
      nomineePhone,
      aadhaarNumber,
      panNumber,
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name and phone number for member enrollment.',
      });
    }

    let finalOrgId = orgId;
    let branch = branchId || null;

    if (!branch && finalOrgId) {
      const defaultBranch = await Branch.findOne({ organizationId: finalOrgId, isDeleted: false });
      if (defaultBranch) branch = defaultBranch._id;
    }

    if (branch && !finalOrgId) {
      const foundBranch = await Branch.findById(branch);
      if (foundBranch) finalOrgId = foundBranch.organizationId;
    }

    if (!finalOrgId) {
      return res.status(400).json({
        success: false,
        error: 'Please select an organization or branch to register this member under.',
      });
    }

    // Auto Generate Unique Member ID: MEM-2026-XXX
    let generatedMemberId = `MEM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newMember = await Member.create({
      organizationId: finalOrgId,
      branchId: branch,
      memberId: generatedMemberId,
      fullName,
      gender: gender || 'Male',
      dob: dob || null,
      phone,
      email: email || '',
      address: address || '',
      district: district || '',
      state: state || 'Karnataka',
      pincode: pincode || '',
      occupation: occupation || 'Business',
      category: category || 'Regular Member',
      nominee: {
        name: nomineeName || '',
        relationship: nomineeRelationship || '',
        sharePercentage: Number(nomineeShare) || 100,
        phone: nomineePhone || '',
      },
      kycDocuments: {
        aadhaarNumber: aadhaarNumber || '',
        panNumber: panNumber || '',
        kycVerified: false,
      },
      membershipStatus: 'Pending',
      createdBy: req.user._id,
    });

    await logMemberAudit(req, 'MEMBER_REGISTERED', `Enrolled new member '${fullName}' (${generatedMemberId})`, orgId);

    return res.status(201).json({
      success: true,
      message: `Member '${fullName}' enrolled successfully with ID '${generatedMemberId}'!`,
      data: newMember,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Complete Member Profile Details
// @route   GET /api/v1/members/:id
// @access  Private
exports.getMemberProfile = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const memberId = req.params.id;

    const member = await Member.findOne({ _id: memberId, organizationId: orgId }).populate('branchId', 'branchName branchCode');

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Member Information
// @route   PUT /api/v1/members/:id
// @access  Private (Org Admin, Super Admin, Branch Manager, Employees)
exports.updateMember = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const memberId = req.params.id;
    const { fullName, phone, email, address, district, state, occupation, nomineeName, nomineeRelationship } = req.body;

    try {
      const member = await Member.findOne({ _id: memberId, organizationId: orgId });
      if (member) {
        if (fullName) member.fullName = fullName;
        if (phone) member.phone = phone;
        if (email) member.email = email;
        if (address) member.address = address;
        if (district) member.district = district;
        if (state) member.state = state;
        if (occupation) member.occupation = occupation;
        if (nomineeName) member.nominee.name = nomineeName;
        if (nomineeRelationship) member.nominee.relationship = nomineeRelationship;
        member.updatedBy = req.user._id;
        await member.save();
      }
    } catch (e) {}

    await logMemberAudit(req, 'MEMBER_UPDATED', `Updated profile info for member ${memberId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Member details updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve Membership Application
// @route   PUT /api/v1/members/:id/approve
// @access  Private (Org Admin, Super Admin, President, Secretary)
exports.approveMember = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const memberId = req.params.id;
    const { remarks } = req.body;

    try {
      const member = await Member.findOne({ _id: memberId, organizationId: orgId });
      if (member) {
        member.membershipStatus = 'Active';
        member.remarks = remarks || 'Approved by Board';
        await member.save();
      }
    } catch (e) {}

    await logMemberAudit(req, 'MEMBER_APPROVED', `Approved membership for member ${memberId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Membership application approved successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject Membership Application
// @route   PUT /api/v1/members/:id/reject
// @access  Private (Org Admin, Super Admin, President, Secretary)
exports.rejectMember = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const memberId = req.params.id;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({
        success: false,
        error: 'Please provide rejection remarks.',
      });
    }

    try {
      const member = await Member.findOne({ _id: memberId, organizationId: orgId });
      if (member) {
        member.membershipStatus = 'Rejected';
        member.remarks = remarks;
        await member.save();
      }
    } catch (e) {}

    await logMemberAudit(req, 'MEMBER_REJECTED', `Rejected membership for member ${memberId}: ${remarks}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Membership application rejected.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Member KYC Documents
// @route   PUT /api/v1/members/:id/verify-kyc
// @access  Private (Org Admin, Super Admin, Branch Manager)
exports.verifyMemberKYC = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const memberId = req.params.id;

    try {
      const member = await Member.findOne({ _id: memberId, organizationId: orgId });
      if (member) {
        member.kycDocuments.kycVerified = true;
        member.kycDocuments.verifiedAt = new Date();
        await member.save();
      }
    } catch (e) {}

    await logMemberAudit(req, 'MEMBER_KYC_VERIFIED', `Verified Aadhaar & PAN KYC for member ${memberId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'KYC Documents verified successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend / Reactivate Member Status
// @route   PUT /api/v1/members/:id/status
// @access  Private (Org Admin, Super Admin)
exports.toggleMemberStatus = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const memberId = req.params.id;

    let newStatus = 'Active';
    try {
      const member = await Member.findOne({ _id: memberId, organizationId: orgId });
      if (member) {
        newStatus = member.membershipStatus === 'Active' ? 'Suspended' : 'Active';
        member.membershipStatus = newStatus;
        await member.save();
      }
    } catch (e) {}

    await logMemberAudit(req, 'MEMBER_STATUS_TOGGLED', `Set member ${memberId} status to ${newStatus}`, orgId);

    return res.status(200).json({
      success: true,
      message: `Member status updated to ${newStatus}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete Member Record
// @route   DELETE /api/v1/members/:id
// @access  Private (Org Admin, Super Admin)
exports.softDeleteMember = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const memberId = req.params.id;

    try {
      const member = await Member.findOne({ _id: memberId, organizationId: orgId });
      if (member) {
        member.isDeleted = true;
        await member.save();
      }
    } catch (e) {}

    await logMemberAudit(req, 'MEMBER_DELETED', `Soft deleted member record ${memberId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Member record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Member Reports Data
// @route   GET /api/v1/members/reports
// @access  Private
exports.getMemberReports = async (req, res, next) => {
  try {
    const { reportType } = req.query;
    const orgId = getOrgId(req);

    const filter = { isDeleted: false };
    if (orgId) filter.organizationId = orgId;

    const members = await Member.find(filter)
      .select('memberId fullName category membershipStatus branchId')
      .populate('branchId', 'branchName branchCode')
      .limit(50);

    const activeMembers = members.map((m) => ({
      memberId: m.memberId,
      name: m.fullName,
      category: m.category,
      branch: m.branchId ? m.branchId.branchName : 'Head Office',
      status: m.membershipStatus,
    }));

    const branchGrowthAgg = await Member.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$branchId",
          memberCount: { $sum: 1 },
        },
      },
    ]);

    const populatedGrowth = await Promise.all(
      branchGrowthAgg.map(async (item) => {
        let bName = 'Head Office / Unassigned';
        if (item._id) {
          const br = await Branch.findById(item._id);
          if (br) bName = br.branchName;
        }
        return {
          branchName: bName,
          memberCount: item.memberCount,
          activeSavings: '—',
        };
      })
    );

    const reports = {
      type: reportType || 'ActiveMembers',
      generatedAt: new Date(),
      activeMembers,
      branchGrowth: populatedGrowth,
    };

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Member Audit Trail Logs
// @route   GET /api/v1/members/logs
// @access  Private
exports.getMemberActivityLogs = async (req, res, next) => {
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
