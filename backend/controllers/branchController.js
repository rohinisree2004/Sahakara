const Branch = require('../models/Branch');
const Organization = require('../models/Organization');
const User = require('../models/User');
const RoleAssignment = require('../models/RoleAssignment');
const AuditLog = require('../models/AuditLog');

// Helper to resolve orgId & branchId from context
const resolveScope = (req) => {
  let orgId = req.user?.organizationId || null;
  if (req.user?.role === 'Super Admin') {
    const raw = req.query?.organizationId || req.body?.organizationId || null;
    orgId = raw && raw !== 'All' && raw !== 'undefined' && raw !== 'null' ? raw : null;
  }
  const rawBranch = req.query?.branchId || req.params?.id || req.body?.branchId || null;
  const branchId = rawBranch && rawBranch !== 'All' && rawBranch !== 'undefined' && rawBranch !== 'null' ? rawBranch : null;
  return { orgId, branchId };
};

// Helper to log branch audit events
const logBranchAudit = async (req, action, details, orgId, branchId) => {
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

// @desc    Get Branch Dashboard Analytics
// @route   GET /api/v1/branches/dashboard
// @access  Private (Branch Manager, Org Admin, Super Admin, Execs, Employees)
exports.getBranchDashboard = async (req, res, next) => {
  try {
    let { orgId, branchId } = resolveScope(req);
    const Member = require('../models/Member');
    const Group = require('../models/Group');
    const SavingsAccount = require('../models/SavingsAccount');
    const Loan = require('../models/Loan');
    const Meeting = require('../models/Meeting');

    // If user is Branch Manager, resolve his exact assigned branch
    if (req.user.role === 'Branch Manager') {
      if (!branchId && req.user.branchId) {
        branchId = req.user.branchId;
      }
      if (!branchId) {
        const managed = await Branch.findOne({ managerId: req.user._id, isDeleted: false });
        if (managed) branchId = managed._id;
      }
      if (!branchId) {
        const ra = await RoleAssignment.findOne({ userId: req.user._id, role: 'Branch Manager', status: 'Active' });
        if (ra?.branchId) branchId = ra.branchId;
      }
      if (!branchId && orgId) {
        const defaultBranch = await Branch.findOne({ organizationId: orgId, isDeleted: false });
        if (defaultBranch) branchId = defaultBranch._id;
      }
    }

    let branch = null;
    let organization = null;
    if (branchId) {
      branch = await Branch.findById(branchId);
      if (branch && !orgId) orgId = branch.organizationId;
    }
    if (orgId) {
      organization = await Organization.findById(orgId);
    }

    const isScopedToSingleBranch = !!branch;
    const queryBranchId = branch ? branch._id : null;

    const totalBranchesCount = await Branch.countDocuments(orgId ? { organizationId: orgId, isDeleted: false } : { isDeleted: false });

    const memberFilter = { isDeleted: false };
    if (orgId) memberFilter.organizationId = orgId;
    if (queryBranchId) memberFilter.branchId = queryBranchId;

    const employeeFilter = { isActive: true };
    if (orgId) employeeFilter.organizationId = orgId;
    if (queryBranchId) employeeFilter.branchId = queryBranchId;
    employeeFilter.role = { $in: ['Employee', 'Branch Manager'] };

    const groupFilter = { isDeleted: false };
    if (orgId) groupFilter.organizationId = orgId;
    if (queryBranchId) groupFilter.branchId = queryBranchId;

    const employeeCount = await User.countDocuments(employeeFilter);
    const memberCount = await Member.countDocuments(memberFilter);
    const groupCount = await Group.countDocuments(groupFilter);

    const mongoose = require('mongoose');
    const savingsMatch = {};
    if (orgId) savingsMatch.organizationId = new mongoose.Types.ObjectId(orgId);
    if (queryBranchId) savingsMatch.branchId = new mongoose.Types.ObjectId(queryBranchId);

    const loansMatch = { status: 'Disbursed' };
    if (orgId) loansMatch.organizationId = new mongoose.Types.ObjectId(orgId);
    if (queryBranchId) loansMatch.branchId = new mongoose.Types.ObjectId(queryBranchId);

    const savingsAggr = await SavingsAccount.aggregate([
      ...(Object.keys(savingsMatch).length > 0 ? [{ $match: savingsMatch }] : []),
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);
    const loansAggr = await Loan.aggregate([
      { $match: loansMatch },
      { $group: { _id: null, total: { $sum: "$approvedAmount" }, count: { $sum: 1 } } }
    ]);

    const totalSavings = savingsAggr.length > 0 ? savingsAggr[0].total : 0;
    const totalLoans = loansAggr.length > 0 ? loansAggr[0].total : 0;
    const activeLoanAccounts = loansAggr.length > 0 ? loansAggr[0].count : 0;

    const pendingLoansCount = await Loan.countDocuments({
      ...(orgId && { organizationId: orgId }),
      ...(queryBranchId && { branchId: queryBranchId }),
      status: { $in: ['Applied', 'Under Review'] }
    });

    const pendingMembersKYC = await Member.countDocuments({
      ...(orgId && { organizationId: orgId }),
      ...(queryBranchId && { branchId: queryBranchId }),
      status: 'Pending'
    });

    const branchGroups = await Group.find(groupFilter)
      .populate('presidentId', 'fullName name')
      .limit(6)
      .lean();

    let displayTitle = 'All Branch Operations';
    let displayCode = 'GLOBAL';
    if (branch) {
      displayTitle = branch.branchName;
      displayCode = branch.branchCode;
    } else if (organization) {
      displayTitle = `${organization.name} Branches`;
      displayCode = organization.code || 'ORG';
    }

    const dashboard = {
      isSingleBranch: isScopedToSingleBranch,
      branchId: branch ? branch._id : null,
      branchName: displayTitle,
      branchCode: displayCode,
      organizationName: organization ? organization.name : 'Cooperative Society Network',
      organizationCode: organization ? organization.code : 'ORG',
      managerName: branch?.managerName || (branch?.managerId ? req.user.name : 'Branch Manager'),
      phone: branch?.phone || organization?.phone || '+91 98470 00000',
      email: branch?.email || organization?.email || 'branch@sahakara.org',
      address: branch?.address || (branch?.city ? `${branch.city}, ${branch.state}` : 'Main Town'),
      totalBranches: totalBranchesCount,
      totalMembers: memberCount,
      activeMembers: memberCount,
      totalEmployees: employeeCount,
      totalGroups: groupCount,
      activeLoansCount: activeLoanAccounts,
      pendingLoansCount: pendingLoansCount,
      pendingMembersKYC: pendingMembersKYC,
      totalPendingApprovals: pendingLoansCount + pendingMembersKYC,
      activeLoansAmount: `₹ ${totalLoans.toLocaleString('en-IN')}`,
      monthlySavingsManaged: `₹ ${totalSavings.toLocaleString('en-IN')}`,
      groups: branchGroups,
      recentTransactions: [],
      upcomingMeetings: [],
    };

    const recentLogs = await AuditLog.find(orgId ? { organizationId: orgId } : {})
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      data: dashboard,
      recentActivities: recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Branches List (Search & Filter)
// @route   GET /api/v1/branches
// @access  Private
exports.getBranchesList = async (req, res, next) => {
  try {
    const { orgId, branchId } = resolveScope(req);
    const { search, status } = req.query;

    let query = { isDeleted: false };
    if (orgId) {
      query.organizationId = orgId;
    }

    // Strict Branch Isolation for Branch Manager & Employee
    if (['Branch Manager', 'Employee'].includes(req.user.role)) {
      const userBranchId = req.user.branchId || branchId;
      if (userBranchId) {
        query._id = userBranchId;
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { branchName: { $regex: search, $options: 'i' } },
        { branchCode: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }

    const branches = await Branch.find(query).populate('organizationId', 'name code').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create New Branch (Unique Code Check)
// @route   POST /api/v1/branches
// @access  Private (Org Admin, Super Admin)
exports.createBranch = async (req, res, next) => {
  try {
    let { orgId } = resolveScope(req);
    const { branchCode, branchName, address, district, state, phone, email, workingHours, managerId, managerName, organizationId } = req.body;

    if (req.user.role === 'Super Admin' && organizationId) {
      orgId = organizationId;
    }

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required to create a branch.',
      });
    }

    if (!branchCode || !branchName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide branch code and branch name.',
      });
    }

    const cleanCode = branchCode.trim().toUpperCase();

    // Check unique code within organization
    const existing = await Branch.findOne({ organizationId: orgId, branchCode: cleanCode, isDeleted: false });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Branch code '${cleanCode}' already exists in this organization. Please use a unique code.`,
      });
    }

    const branch = await Branch.create({
      organizationId: orgId,
      branchCode: cleanCode,
      branchName,
      address,
      district,
      state: state || 'Karnataka',
      phone,
      email,
      workingHours: workingHours || '9:00 AM - 5:00 PM (Mon-Sat)',
      managerId: managerId || null,
      managerName: managerName || '',
      createdBy: req.user._id,
      status: 'Active',
    });

    await logBranchAudit(req, 'BRANCH_CREATED', `Created branch '${branchName}' (${cleanCode})`, orgId, branch._id);

    return res.status(201).json({
      success: true,
      message: `Branch '${branchName}' (${cleanCode}) created successfully!`,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Branch Profile Details
// @route   GET /api/v1/branches/:id
// @access  Private
exports.getBranchProfile = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    const branchId = req.params.id;

    let branch = null;
    try {
      const filter = { _id: branchId, isDeleted: false };
      if (orgId) filter.organizationId = orgId;
      branch = await Branch.findOne(filter);
    } catch (e) {}

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Branch Details
// @route   PUT /api/v1/branches/:id
// @access  Private (Org Admin, Super Admin)
exports.updateBranchProfile = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    const branchId = req.params.id;
    const { branchName, address, district, state, phone, email, workingHours, status } = req.body;

    const branchFilter = { _id: branchId, isDeleted: false };
    if (orgId) branchFilter.organizationId = orgId;

    const branch = await Branch.findOne(branchFilter);
    if (branch) {
      if (branchName) branch.branchName = branchName;
      if (address) branch.address = address;
      if (district) branch.district = district;
      if (state) branch.state = state;
      if (phone) branch.phone = phone;
      if (email) branch.email = email;
      if (workingHours) branch.workingHours = workingHours;
      if (status) branch.status = status;
      await branch.save();
    }

    await logBranchAudit(req, 'BRANCH_UPDATED', `Updated branch details for ${branch?.branchName || branchId}`, branch?.organizationId || orgId, branchId);

    return res.status(200).json({
      success: true,
      message: 'Branch details updated successfully.',
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign / Change Branch Manager
// @route   PUT /api/v1/branches/:id/manager
// @access  Private (Org Admin, Super Admin)
exports.assignBranchManager = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    const branchId = req.params.id;
    const { managerId, managerName } = req.body;

    if (!managerName) {
      return res.status(400).json({
        success: false,
        error: 'Please specify the Branch Manager name.',
      });
    }

    const branchFilter = { _id: branchId, isDeleted: false };
    if (orgId) branchFilter.organizationId = orgId;

    const branch = await Branch.findOne(branchFilter);
    if (branch) {
      branch.managerId = managerId || null;
      branch.managerName = managerName;
      await branch.save();
    }

    await logBranchAudit(req, 'MANAGER_ASSIGNED', `Assigned '${managerName}' as Manager for branch ${branch?.branchName || branchId}`, branch?.organizationId || orgId, branchId);

    return res.status(200).json({
      success: true,
      message: `Branch Manager '${managerName}' assigned successfully!`,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Branch Employees Directory
// @route   GET /api/v1/branches/:id/employees
// @access  Private
exports.getBranchEmployees = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    const rawBranchId = req.params.id || req.query.branchId;
    const branchId = rawBranchId && rawBranchId !== 'All' && rawBranchId !== 'undefined' ? rawBranchId : null;

    const staffRoles = ['Employee', 'Branch Manager', 'Organization Admin'];

    const query = { isDeleted: false };
    if (branchId) query.branchId = branchId;
    if (orgId) query.organizationId = orgId;
    query.role = { $in: staffRoles };

    const assignments = await RoleAssignment.find(query)
      .populate('userId', '-password')
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode');

    let employees = [];
    const seenUserIds = new Set();

    for (const a of assignments) {
      if (!a.userId || a.userId.isDeleted) continue;
      const uid = a.userId._id.toString();
      if (!seenUserIds.has(uid)) {
        seenUserIds.add(uid);
        const u = a.userId.toObject ? a.userId.toObject() : a.userId;
        u.role = a.role;
        u.roleAssignmentId = a._id;
        u.organizationId = a.organizationId;
        u.branchId = a.branchId;
        u.assignmentStatus = a.status;
        employees.push(u);
      }
    }

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Branch Members Overview (Stationed via Branch Groups)
// @route   GET /api/v1/branches/:id/members
// @access  Private
exports.getBranchMembers = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    let rawBranchId = req.params.id || req.query.branchId;
    if (['Branch Manager', 'Employee'].includes(req.user.role)) {
      rawBranchId = req.user.branchId || rawBranchId;
    }
    const branchId = rawBranchId && rawBranchId !== 'All' && rawBranchId !== 'undefined' ? rawBranchId : null;

    let memberQuery = { isDeleted: false };
    if (orgId) memberQuery.organizationId = orgId;

    if (branchId) {
      // Find all groups stationed under this branch
      const branchGroups = await Group.find({ branchId, isDeleted: false }).select('_id');
      const branchGroupIds = branchGroups.map(g => g._id);

      memberQuery.$or = [
        { groupIds: { $in: branchGroupIds } },
        { groupId: { $in: branchGroupIds } },
        { branchId: branchId },
      ];
    }

    const members = await Member.find(memberQuery)
      .populate('groupIds', 'groupName groupCode groupType')
      .populate('groupId', 'groupName groupCode')
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .populate('userId', 'username email')
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

// @desc    Get Branch Reports Data (Member, Savings, Loan, Transaction, Attendance)
// @route   GET /api/v1/branches/:id/reports
// @access  Private
exports.getBranchReports = async (req, res, next) => {
  try {
    const { type } = req.query;
    const { orgId } = resolveScope(req);
    let branchId = req.params.id;

    if (['Branch Manager', 'Employee'].includes(req.user.role)) {
      branchId = req.user.branchId || branchId;
    }

    const Member = require('../models/Member');
    const SavingsAccount = require('../models/SavingsAccount');
    const Loan = require('../models/Loan');

    const memberFilter = { isDeleted: false };
    if (orgId) memberFilter.organizationId = orgId;
    if (branchId) memberFilter.branchId = branchId;

    const members = await Member.find(memberFilter).limit(50);
    const memberReport = members.map((m) => ({
      memberId: m.memberId,
      name: m.fullName,
      accountType: m.category,
      savingsBalance: '—',
      loanStatus: '—',
    }));

    const savingsAccounts = await SavingsAccount.find(memberFilter).populate('memberId', 'fullName').limit(50);
    const savingsReport = savingsAccounts.map((s) => ({
      accountNo: s.accountNumber,
      memberName: s.memberId ? s.memberId.fullName : '—',
      scheme: s.accountType || 'Savings',
      balance: `₹ ${s.balance?.toLocaleString() || 0}`,
      lastDeposit: s.updatedAt ? new Date(s.updatedAt).toISOString().split('T')[0] : '—',
    }));

    const loans = await Loan.find(memberFilter).populate('memberId', 'fullName').limit(50);
    const loanReport = loans.map((l) => ({
      loanId: l.loanId || l._id,
      borrower: l.memberId ? l.memberId.fullName : '—',
      loanType: l.loanType || 'Micro Loan',
      Principal: `₹ ${l.approvedAmount?.toLocaleString() || 0}`,
      emiAmount: `₹ ${l.emiAmount?.toLocaleString() || 0}`,
      status: l.status,
    }));

    const reports = {
      type: type || 'Member',
      generatedAt: new Date(),
      memberReport,
      savingsReport,
      loanReport,
    };

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Branch Activity Logs
// @route   GET /api/v1/branches/:id/logs
// @access  Private
exports.getBranchActivityLogs = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    const branchId = req.params.id;

    const logs = await AuditLog.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(50);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete Branch
// @route   DELETE /api/v1/branches/:id
// @access  Private (Org Admin, Super Admin)
exports.deleteBranch = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    const branchId = req.params.id;

    try {
      const branch = await Branch.findOne({ _id: branchId, organizationId: orgId });
      if (branch) {
        branch.isDeleted = true;
        await branch.save();
      }
    } catch (e) {}

    await logBranchAudit(req, 'BRANCH_DELETED', `Soft deleted branch ${branchId}`, orgId, branchId);

    return res.status(200).json({
      success: true,
      message: 'Branch removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
