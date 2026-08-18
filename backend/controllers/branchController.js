const Branch = require('../models/Branch');
const Organization = require('../models/Organization');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper to resolve orgId & branchId from context
const resolveScope = (req) => {
  let orgId = req.user.organizationId || null;
  if (req.user.role === 'Super Admin') {
    orgId = req.query.organizationId || req.body.organizationId || null;
  }
  const branchId = req.query.branchId || req.params.id || null;
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
    const { orgId, branchId } = resolveScope(req);
    const Member = require('../models/Member');
    const Group = require('../models/Group');

    let branch = null;
    let branchFilter = { isDeleted: false };
    if (orgId) branchFilter.organizationId = orgId;
    if (branchId) branchFilter._id = branchId;

    branch = await Branch.findOne(branchFilter);

    const queryBranchId = branch ? branch._id : branchId;
    const countFilter = { isDeleted: false };
    if (orgId) countFilter.organizationId = orgId;
    if (queryBranchId) countFilter.branchId = queryBranchId;

    const employeeCount = await User.countDocuments({ ...countFilter, role: 'Employee' });
    const memberCount = await Member.countDocuments(queryBranchId ? { ...(orgId && { organizationId: orgId }), branchId: queryBranchId } : (orgId ? { organizationId: orgId } : {}));
    const groupCount = await Group.countDocuments(countFilter);

    const SavingsAccount = require('../models/SavingsAccount');
    const Loan = require('../models/Loan');

    const savingsMatch = {};
    if (orgId) savingsMatch.organizationId = orgId;
    if (queryBranchId) savingsMatch.branchId = queryBranchId;

    const loansMatch = { status: 'Disbursed' };
    if (orgId) loansMatch.organizationId = orgId;
    if (queryBranchId) loansMatch.branchId = queryBranchId;

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

    const dashboard = {
      branchName: branch ? branch.branchName : (req.user.role === 'Super Admin' ? 'Platform All Branches' : 'Main Branch'),
      branchCode: branch ? branch.branchCode : (req.user.role === 'Super Admin' ? 'GLOBAL' : 'MAIN'),
      managerName: branch?.managerName || (req.user.role === 'Super Admin' ? req.user.name : ''),
      totalMembers: memberCount,
      activeMembers: memberCount,
      totalEmployees: employeeCount,
      totalGroups: groupCount,
      activeLoansCount: activeLoanAccounts,
      activeLoansAmount: `₹ ${totalLoans.toLocaleString()}`,
      monthlySavingsManaged: `₹ ${totalSavings.toLocaleString()}`,
      recentTransactions: [],
      upcomingMeetings: [],
    };

    return res.status(200).json({
      success: true,
      data: dashboard,
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
    const { orgId } = resolveScope(req);
    const { search, status } = req.query;

    let query = { isDeleted: false };
    if (orgId) {
      query.organizationId = orgId;
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

    try {
      const branch = await Branch.findOne({ _id: branchId, organizationId: orgId });
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
    } catch (e) {}

    await logBranchAudit(req, 'BRANCH_UPDATED', `Updated branch details for ${branchId}`, orgId, branchId);

    return res.status(200).json({
      success: true,
      message: 'Branch details updated successfully.',
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

    try {
      const branch = await Branch.findOne({ _id: branchId, organizationId: orgId });
      if (branch) {
        branch.managerId = managerId || null;
        branch.managerName = managerName;
        await branch.save();
      }
    } catch (e) {}

    await logBranchAudit(req, 'MANAGER_ASSIGNED', `Assigned '${managerName}' as Manager for branch ${branchId}`, orgId, branchId);

    return res.status(200).json({
      success: true,
      message: `Branch Manager '${managerName}' assigned successfully!`,
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
    const branchId = req.params.id;

    const employees = await User.find({ organizationId: orgId, branchId, role: 'Employee' }).select('-password');

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Branch Members Overview
// @route   GET /api/v1/branches/:id/members
// @access  Private
exports.getBranchMembers = async (req, res, next) => {
  try {
    const { orgId } = resolveScope(req);
    const branchId = req.params.id;

    const members = await User.find({ organizationId: orgId, branchId, role: 'Member' }).select('-password');

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
    const branchId = req.params.id;

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
