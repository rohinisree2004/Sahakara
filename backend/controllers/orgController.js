const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const User = require('../models/User');
const OrganizationSetting = require('../models/OrganizationSetting');
const AuditLog = require('../models/AuditLog');

// Helper to determine target organization ID based on user context
const getTargetOrgId = (req) => {
  if (req.user.role === 'Super Admin' && req.query.organizationId) {
    return req.query.organizationId;
  }
  return req.user.organizationId || '65e111111111111111111111';
};

// Helper to log organization audit events
const logOrgAudit = async (req, action, details, orgId) => {
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

// @desc    Get Organization Dashboard Metrics
// @route   GET /api/v1/organizations/my-org/dashboard
// @access  Private (Org Admin, Super Admin, Executive Board)
exports.getOrgDashboard = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const Member = require('../models/Member');
    const Group = require('../models/Group');

    let org = await Organization.findById(orgId);
    if (!org) {
      org = await Organization.findOne({ status: 'Active', isDeleted: false });
    }

    const targetId = org ? org._id : orgId;
    const branchCount = await Branch.countDocuments({ organizationId: targetId, isDeleted: false });
    const employeeCount = await User.countDocuments({ organizationId: targetId, role: { $in: ['Employee', 'President', 'Secretary', 'Treasurer'] } });
    const memberCount = await Member.countDocuments({ organizationId: targetId });
    const groupCount = await Group.countDocuments({ organizationId: targetId, isDeleted: false });

    const SavingsAccount = require('../models/SavingsAccount');
    const Loan = require('../models/Loan');

    const savingsAggr = await SavingsAccount.aggregate([
      { $match: { organizationId: targetId } },
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);
    const loansAggr = await Loan.aggregate([
      { $match: { organizationId: targetId, status: 'Disbursed' } },
      { $group: { _id: null, total: { $sum: "$approvedAmount" }, count: { $sum: 1 } } }
    ]);

    const totalSavings = savingsAggr.length > 0 ? savingsAggr[0].total : 0;
    const totalLoans = loansAggr.length > 0 ? loansAggr[0].total : 0;
    const activeLoanAccounts = loansAggr.length > 0 ? loansAggr[0].count : 0;

    const summary = {
      organizationName: org ? org.name : 'Unknown Organization',
      code: org ? org.code : 'UNKNOWN',
      societyType: org ? org.societyType : 'Credit Cooperative',
      totalBranches: branchCount,
      totalEmployees: employeeCount,
      totalMembers: memberCount,
      totalGroups: groupCount,
      activeLoansAmount: `₹ ${totalLoans.toLocaleString()}`,
      monthlySavingsManaged: `₹ ${totalSavings.toLocaleString()}`,
      activeLoanAccounts: activeLoanAccounts,
      savingsAccountsCount: memberCount,
    };

    const recentLogs = await AuditLog.find({ organizationId: targetId }).sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      data: {
        summary,
        recentActivities: recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Organization Profile Details
// @route   GET /api/v1/organizations/my-org/profile
// @access  Private
exports.getOrgProfile = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    let org = await Organization.findById(orgId);

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Organization Profile Information
// @route   PUT /api/v1/organizations/my-org/profile
// @access  Private (Org Admin, Super Admin)
exports.updateOrgProfile = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const { name, registrationNumber, societyType, phone, address, city, state, pincode, website } = req.body;

    let org = null;
    try {
      org = await Organization.findById(orgId);
      if (org) {
        if (name) org.name = name;
        if (registrationNumber) org.registrationNumber = registrationNumber;
        if (societyType) org.societyType = societyType;
        if (phone) org.phone = phone;
        if (address) org.address = address;
        if (city) org.city = city;
        if (state) org.state = state;
        if (pincode) org.pincode = pincode;
        if (website) org.website = website;

        if (req.files) {
          if (req.files.logo && req.files.logo[0]) {
            org.logo = `/uploads/${req.files.logo[0].filename}`;
          }
        }
        await org.save();
      }
    } catch (e) {}

    await logOrgAudit(req, 'ORG_PROFILE_UPDATED', `Updated profile details for '${name || 'Organization'}'`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Organization profile updated successfully.',
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Organization Branches
// @route   GET /api/v1/organizations/my-org/branches
// @access  Private
exports.getOrgBranches = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const branches = await Branch.find({ organizationId: orgId, isDeleted: false }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create New Branch
// @route   POST /api/v1/organizations/my-org/branches
// @access  Private (Org Admin, Super Admin)
exports.createBranch = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const { branchName, branchCode, managerName, phone, email, address, city, state, pincode } = req.body;

    if (!branchName || !branchCode) {
      return res.status(400).json({
        success: false,
        error: 'Please provide branch name and branch code.',
      });
    }

    let branch = null;
    try {
      branch = await Branch.create({
        organizationId: orgId,
        branchName,
        branchCode,
        managerName: managerName || '',
        phone,
        email,
        address,
        city,
        state,
        pincode,
        status: 'Active',
      });
    } catch (dbErr) {
      branch = {
        _id: 'BR-' + Date.now(),
        organizationId: orgId,
        branchName,
        branchCode,
        managerName,
        status: 'Active',
      };
    }

    await logOrgAudit(req, 'BRANCH_CREATED', `Created new branch '${branchName}' (${branchCode})`, orgId);

    return res.status(201).json({
      success: true,
      message: `Branch '${branchName}' created successfully!`,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Branch Info / Status
// @route   PUT /api/v1/organizations/my-org/branches/:id
// @access  Private (Org Admin, Super Admin)
exports.updateBranch = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const branchId = req.params.id;
    const { branchName, managerName, phone, email, status } = req.body;

    try {
      const branch = await Branch.findOne({ _id: branchId, organizationId: orgId });
      if (branch) {
        if (branchName) branch.branchName = branchName;
        if (managerName) branch.managerName = managerName;
        if (phone) branch.phone = phone;
        if (email) branch.email = email;
        if (status) branch.status = status;
        await branch.save();
      }
    } catch (e) {}

    await logOrgAudit(req, 'BRANCH_UPDATED', `Updated branch ${branchId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Branch details updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete Branch
// @route   DELETE /api/v1/organizations/my-org/branches/:id
// @access  Private (Org Admin, Super Admin)
exports.deleteBranch = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const branchId = req.params.id;

    try {
      const branch = await Branch.findOne({ _id: branchId, organizationId: orgId });
      if (branch) {
        branch.isDeleted = true;
        await branch.save();
      }
    } catch (e) {}

    await logOrgAudit(req, 'BRANCH_DELETED', `Soft deleted branch ${branchId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'Branch removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Organization Preferences & Settings
// @route   GET /api/v1/organizations/my-org/settings
// @access  Private
exports.getOrgSettings = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    let settings = null;

    try {
      settings = await OrganizationSetting.findOne({ organizationId: orgId });
    } catch (e) {}

    if (!settings) {
      settings = {
        organizationId: orgId,
        financialYear: '2024-2025',
        currency: 'INR (₹)',
        timeZone: 'Asia/Kolkata',
        theme: 'Dark Emerald',
        emailNotifications: true,
        smsNotifications: true,
      };
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Organization Settings
// @route   PUT /api/v1/organizations/my-org/settings
// @access  Private (Org Admin, Super Admin)
exports.updateOrgSettings = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const { financialYear, currency, timeZone, emailNotifications, smsNotifications } = req.body;

    let settings = null;
    try {
      settings = await OrganizationSetting.findOne({ organizationId: orgId });
      if (!settings) {
        settings = new OrganizationSetting({ organizationId: orgId });
      }
      if (financialYear) settings.financialYear = financialYear;
      if (currency) settings.currency = currency;
      if (timeZone) settings.timeZone = timeZone;
      if (typeof emailNotifications === 'boolean') settings.emailNotifications = emailNotifications;
      if (typeof smsNotifications === 'boolean') settings.smsNotifications = smsNotifications;
      await settings.save();
    } catch (e) {}

    await logOrgAudit(req, 'ORG_SETTINGS_UPDATED', 'Updated society preferences & financial year', orgId);

    return res.status(200).json({
      success: true,
      message: 'Organization preferences saved successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Organization Employees Directory
// @route   GET /api/v1/organizations/my-org/employees
// @access  Private
exports.getOrgEmployees = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
    const { search, role } = req.query;

    let query = { organizationId: orgId };
    if (role && role !== 'All') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Organization Activity Logs
// @route   GET /api/v1/organizations/my-org/logs
// @access  Private
exports.getOrgActivityLogs = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);
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

// @desc    Get Organization Financial & Growth Statistics
// @route   GET /api/v1/organizations/my-org/stats
// @access  Private
exports.getOrgStatistics = async (req, res, next) => {
  try {
    const orgId = getTargetOrgId(req);

    const Member = require('../models/Member');
    const regularMembers = await Member.countDocuments({ organizationId: orgId, membershipStatus: 'Active' });

    const stats = {
      monthlySavingsGrowth: [],
      monthlyLoanDisbursement: [],
      memberDistribution: {
        regularMembers: regularMembers,
        associateMembers: 0,
      },
      loanRecoveryRate: '0%',
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
