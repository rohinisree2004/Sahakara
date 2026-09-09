const User = require('../models/User');
const RoleAssignment = require('../models/RoleAssignment');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const Group = require('../models/Group');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const { getActiveContext } = require('../utils/contextHelper');

// Helper to resolve orgId from request context
const getOrgId = (req) => {
  const { organizationId } = getActiveContext(req);
  return organizationId;
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

// Helper to attach role assignments to user objects
const attachRolesToUsers = async (users, filterOrgId = null) => {
  if (!users || users.length === 0) return [];
  const userIds = users.map(u => u._id);
  
  const roleQuery = { userId: { $in: userIds }, status: 'Active' };
  if (filterOrgId) roleQuery.organizationId = filterOrgId;

  const assignments = await RoleAssignment.find(roleQuery)
    .populate('organizationId', 'name code')
    .populate('branchId', 'branchName branchCode')
    .populate('groupId', 'groupName');

  const roleHierarchy = ['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee', 'President', 'Secretary', 'Treasurer', 'Member'];

  return users.map(user => {
    const userObj = user.toObject ? user.toObject() : { ...user };
    const myAssignments = assignments.filter(a => a.userId.toString() === user._id.toString());
    
    // Determine highest role
    let highestRole = 'Member';
    let highestIndex = roleHierarchy.length;
    let primaryAssignment = myAssignments[0] || null;

    myAssignments.forEach(ra => {
      const idx = roleHierarchy.indexOf(ra.role);
      if (idx !== -1 && idx < highestIndex) {
        highestIndex = idx;
        highestRole = ra.role;
        primaryAssignment = ra;
      }
    });

    userObj.role = highestRole;
    userObj.roleAssignments = myAssignments;
    userObj.organizationId = primaryAssignment?.organizationId || null;
    userObj.branchId = primaryAssignment?.branchId || null;
    userObj.groupId = primaryAssignment?.groupId || null;

    return userObj;
  });
};

// @desc    Get User Dashboard Metrics
// @route   GET /api/v1/users/dashboard
// @access  Private (Org Admin, Super Admin, Execs)
exports.getUserDashboard = async (req, res, next) => {
  try {
    const orgId = getOrgId(req);

    const baseQuery = { isDeleted: false };
    
    // If organization is specified, filter by users who have role assignments in that organization
    let userIdsInOrg = null;
    if (orgId) {
      const assignmentsInOrg = await RoleAssignment.find({ organizationId: orgId, status: 'Active' });
      userIdsInOrg = assignmentsInOrg.map(a => a.userId);
      baseQuery._id = { $in: userIdsInOrg };
    }

    const totalUsers = await User.countDocuments(baseQuery);
    const activeUsers = await User.countDocuments({ ...baseQuery, isActive: true });
    const inactiveUsers = await User.countDocuments({ ...baseQuery, isActive: false });

    const recentRawUsers = await User.find(baseQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await attachRolesToUsers(recentRawUsers, orgId);

    // Aggregate roles across RoleAssignments
    const roleQuery = { status: 'Active' };
    if (orgId) roleQuery.organizationId = orgId;

    const roleAggr = await RoleAssignment.aggregate([
      { $match: roleQuery },
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
    const { organizationId: contextOrgId, branchId: contextBranchId } = getActiveContext(req);
    const { search, role, branchId: queryBranchId, organizationId: queryOrgId, status } = req.query;
    const cleanQueryOrgId = queryOrgId && queryOrgId !== 'All' ? queryOrgId : null;
    const cleanQueryBranchId = queryBranchId && queryBranchId !== 'All' ? queryBranchId : null;

    const targetOrgId = cleanQueryOrgId || (contextOrgId && contextOrgId !== 'All' ? contextOrgId : null);
    const targetBranchId = cleanQueryBranchId || (contextBranchId && contextBranchId !== 'All' ? contextBranchId : null);

    // If role, branch, or org filter is applied, query RoleAssignment first
    let userFilter = { isDeleted: false };

    if (targetOrgId || targetBranchId || (role && role !== 'All')) {
      const assignmentFilter = { status: 'Active' };
      if (targetOrgId) assignmentFilter.organizationId = targetOrgId;
      if (targetBranchId) assignmentFilter.branchId = targetBranchId;
      if (role && role !== 'All') assignmentFilter.role = role;

      const matchingAssignments = await RoleAssignment.find(assignmentFilter);
      const matchingUserIds = matchingAssignments.map(a => a.userId);
      userFilter._id = { $in: matchingUserIds };
    }

    if (status && status !== 'All') {
      userFilter.isActive = status === 'Active';
    }

    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const rawUsers = await User.find(userFilter)
      .select('-password')
      .sort({ createdAt: -1 });

    const users = await attachRolesToUsers(rawUsers, targetOrgId);

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
      phone: phone || '',
      gender: gender || 'Male',
      address: address || '',
      createdBy: req.user._id,
      isActive: true,
    });

    // Create the RoleAssignment for this user
    await RoleAssignment.create({
      userId: user._id,
      role: role,
      organizationId: orgId || null,
      branchId: branchId || null,
      status: 'Active',
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
    const rawUser = await User.findById(userId).select('-password');

    if (!rawUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const [user] = await attachRolesToUsers([rawUser]);

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

    const user = await User.findById(userId);
    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (gender) user.gender = gender;
      if (address) user.address = address;
      user.updatedBy = req.user._id;
      await user.save();
    }

    if (role || branchId) {
      let assignment = await RoleAssignment.findOne({ userId, status: 'Active' });
      if (assignment) {
        if (role) assignment.role = role;
        if (branchId) assignment.branchId = branchId;
        await assignment.save();
      } else {
        await RoleAssignment.create({
          userId,
          role: role || 'Member',
          organizationId: orgId || null,
          branchId: branchId || null,
          status: 'Active',
        });
      }
    }

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

    const assignment = await RoleAssignment.findOne({ userId, status: 'Active' });
    if (assignment) {
      assignment.branchId = branchId;
      await assignment.save();
    }

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

    const user = await User.findById(userId);
    if (user) {
      user.password = newPassword; // Pre-save hook hashes with bcrypt
      await user.save();
    }

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
    const user = await User.findById(userId);
    if (user) {
      user.isActive = !user.isActive;
      newStatus = user.isActive;
      await user.save();
    }

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

    const user = await User.findById(userId);
    if (user) {
      user.isDeleted = true;
      await user.save();
    }

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
    const rawUsers = await User.find(userFilter).limit(50);
    const users = await attachRolesToUsers(rawUsers, orgId);

    const activeUsers = users.map((u) => ({
      userId: u._id,
      name: u.name,
      role: u.role,
      branch: u.branchId ? u.branchId.branchName : 'Head Office',
      status: u.isActive ? 'Active' : 'Inactive',
    }));

    const reports = {
      type: reportType || 'ActiveUsers',
      generatedAt: new Date(),
      activeUsers,
      branchWiseUsers: [],
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
    const logQuery = {};
    if (orgId) logQuery.organizationId = orgId;
    const logs = await AuditLog.find(logQuery).sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
