const User = require('../models/User');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// Helper to resolve orgId from request context
const getOrgId = (req) => {
  if (req.user.role === 'Super Admin') {
    return req.query.organizationId || req.body.organizationId || null;
  }
  return req.user.organizationId || null;
};

// Helper to log user audit events
const logUserAudit = async (req, action, details, orgId) => {
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

// @desc    Get User Dashboard Metrics
// @route   GET /api/v1/users/dashboard
// @access  Private (Org Admin, Super Admin, Execs)
exports.getUserDashboard = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);

    const baseQuery = { isDeleted: false };
    if (orgId) baseQuery.organizationId = orgId;

    const totalUsers = await User.countDocuments(baseQuery);
    const activeUsers = await User.countDocuments({ ...baseQuery, isActive: true });
    const inactiveUsers = await User.countDocuments({ ...baseQuery, isActive: false });

    const recentUsers = await User.find(baseQuery)
      .select('-password')
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .sort({ createdAt: -1 })
      .limit(5);

    const roleAggr = await User.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    let roleDistribution = {
      adminCount: 0,
      executiveCount: 0,
      employeeCount: 0,
      memberCount: 0,
    };

    roleAggr.forEach(r => {
      if (r._id === 'Organization Admin' || r._id === 'Super Admin') roleDistribution.adminCount += r.count;
      else if (['President', 'Secretary', 'Treasurer'].includes(r._id)) roleDistribution.executiveCount += r.count;
      else if (['Branch Manager', 'Employee'].includes(r._id)) roleDistribution.employeeCount += r.count;
      else if (r._id === 'Member') roleDistribution.memberCount += r.count;
    });

    const dashboard = {
      totalUsers: totalUsers,
      activeUsers: activeUsers,
      inactiveUsers: inactiveUsers,
      recentlyAdded: recentUsers,
      roleDistribution: roleDistribution,
    };

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Users Directory (Search & Filter)
// @route   GET /api/v1/users
// @access  Private
exports.getUsersList = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const { search, role, branchId, status } = req.query;

    let query = { isDeleted: false };
    if (orgId) query.organizationId = orgId;
    if (role && role !== 'All') query.role = role;
    if (branchId && branchId !== 'All') query.branchId = branchId;
    if (status && status !== 'All') query.isActive = status === 'Active';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create New User (bcrypt hashed password)
// @route   POST /api/v1/users
// @access  Private (Org Admin, Super Admin)
exports.createUser = async (req, res, next) => {
  try {
    let orgId = getOrgId(req);
    const { name, email, username, password, role, branchId, phone, gender, address, organizationId } = req.body;

    if (req.user.role === 'Super Admin' && organizationId) {
      orgId = organizationId;
    }

    if (!orgId && role !== 'Super Admin') {
      return res.status(400).json({
        success: false,
        error: 'Organization is required for user account creation.',
      });
    }

    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Name, Email, Username, Password, Role).',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check unique email and username
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists in the system.',
      });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      username: cleanUsername,
      password,
      role,
      organizationId: orgId,
      branchId: branchId || null,
      phone: phone || '',
      gender: gender || 'Male',
      address: address || '',
      createdBy: req.user._id,
      isActive: true,
    });

    await logUserAudit(req, 'USER_CREATED', `Created new user account '${name}' (${role})`, orgId);

    return res.status(201).json({
      success: true,
      message: `User '${name}' onboarded successfully!`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single User Profile Details
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUserDetails = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let user = null;

    try {
      user = await User.findById(userId).select('-password').populate('branchId', 'branchName branchCode');
    } catch (e) {}

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User Information & Role
// @route   PUT /api/v1/users/:id
// @access  Private (Org Admin, Super Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.params.id;
    const { name, phone, gender, address, role, branchId } = req.body;

    try {
      const user = await User.findById(userId);
      if (user) {
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (gender) user.gender = gender;
        if (address) user.address = address;
        if (role) user.role = role;
        if (branchId) user.branchId = branchId;
        user.updatedBy = req.user._id;
        await user.save();
      }
    } catch (e) {}

    await logUserAudit(req, 'USER_UPDATED', `Updated user details for ${userId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer User Between Branches
// @route   PUT /api/v1/users/:id/transfer-branch
// @access  Private (Org Admin, Super Admin)
exports.transferUserBranch = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.params.id;
    const { branchId, branchName } = req.body;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        error: 'Please select a target branch for transfer.',
      });
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        user.branchId = branchId;
        await user.save();
      }
    } catch (e) {}

    await logUserAudit(req, 'USER_BRANCH_TRANSFERRED', `Transferred user ${userId} to branch '${branchName || branchId}'`, orgId);

    return res.status(200).json({
      success: true,
      message: `User transferred to '${branchName || 'new branch'}' successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Reset User Password (bcrypt hashed)
// @route   PUT /api/v1/users/:id/reset-password
// @access  Private (Org Admin, Super Admin)
exports.resetUserPasswordByAdmin = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        user.password = newPassword; // Pre-save hook hashes with bcrypt
        await user.save();
      }
    } catch (e) {}

    await logUserAudit(req, 'PASSWORD_RESET_ADMIN', `Admin reset password for user ${userId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'User password reset successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate / Deactivate User Status
// @route   PUT /api/v1/users/:id/status
// @access  Private (Org Admin, Super Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.params.id;

    let newStatus = true;
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isActive = !user.isActive;
        newStatus = user.isActive;
        await user.save();
      }
    } catch (e) {}

    await logUserAudit(req, 'USER_STATUS_TOGGLED', `User ${userId} set to ${newStatus ? 'Active' : 'Inactive'}`, orgId);

    return res.status(200).json({
      success: true,
      message: `User account set to ${newStatus ? 'Active' : 'Inactive'}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete User Account
// @route   DELETE /api/v1/users/:id
// @access  Private (Org Admin, Super Admin)
exports.softDeleteUser = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);
    const userId = req.params.id;

    try {
      const user = await User.findById(userId);
      if (user) {
        user.isDeleted = true;
        await user.save();
      }
    } catch (e) {}

    await logUserAudit(req, 'USER_DELETED', `Soft deleted user ${userId}`, orgId);

    return res.status(200).json({
      success: true,
      message: 'User account removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get User Reports Data
// @route   GET /api/v1/users/reports
// @access  Private
exports.getUserReports = async (req, res, next) => {
  try {
    const { reportType } = req.query;
    const orgId = getOrgId(req);

    const userFilter = { isDeleted: false };
    if (orgId) userFilter.organizationId = orgId;

    const users = await User.find(userFilter)
      .select('name role status isActive branchId')
      .populate('branchId', 'branchName branchCode')
      .limit(50);

    const activeUsers = users.map((u) => ({
      userId: u._id,
      name: u.name,
      role: u.role,
      branch: u.branchId ? u.branchId.branchName : 'Head Office',
      status: u.isActive ? 'Active' : 'Inactive',
    }));

    const branchWiseAgg = await User.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: "$branchId",
          staffCount: {
            $sum: {
              $cond: [{ $in: ["$role", ["Employee", "Branch Manager", "Treasurer", "Secretary", "President"]] }, 1, 0]
            }
          },
          memberCount: {
            $sum: {
              $cond: [{ $eq: ["$role", "Member"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const populatedBranchWise = await Promise.all(
      branchWiseAgg.map(async (item) => {
        let bName = 'Head Office / Unassigned';
        if (item._id) {
          const br = await Branch.findById(item._id);
          if (br) bName = `${br.branchName} (${br.branchCode})`;
        }
        return {
          branchName: bName,
          staffCount: item.staffCount,
          memberCount: item.memberCount,
        };
      })
    );

    const reports = {
      type: reportType || 'ActiveUsers',
      generatedAt: new Date(),
      activeUsers,
      branchWiseUsers: populatedBranchWise,
    };

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get User Activity Logs
// @route   GET /api/v1/users/logs
// @access  Private
exports.getUserActivityLogs = async (req, res, next) => {
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
