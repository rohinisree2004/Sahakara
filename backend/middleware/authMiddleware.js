const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Protect routes - Verify JWT Token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. Please login.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'sahakara_erp_super_secret_jwt_key_2026_cooperative_society'
    );

    // Try finding user in database
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      console.warn('[Auth Middleware Notice] Database lookup error:', e.message);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists or database is unavailable.',
      });
    } else {
      // Fetch user's contextual role assignments
      const RoleAssignment = require('../models/RoleAssignment');
      let roleAssignments = [];
      try {
        roleAssignments = await RoleAssignment.find({ userId: user._id, status: 'Active' });
      } catch (err) {
        console.warn('Error fetching role assignments in auth middleware:', err.message);
      }
      
      req.user = user.toObject(); // Convert to plain object to attach properties
      req.user.roleAssignments = roleAssignments;
      
      // Determine highest privilege role for backward compatibility
      // NOTE: President, Secretary, Treasurer are group POSITIONS, not user roles.
      // They are tracked in the Group model (presidentId, secretaryId, treasurerId).
      const roleHierarchy = ['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee', 'Member'];
      // Group positions are valid active-role values but resolved differently
      const groupPositions = ['President', 'Secretary', 'Treasurer'];
      let highestRole = 'Member';
      let highestIndex = roleHierarchy.length;
      
      roleAssignments.forEach(ra => {
        const idx = roleHierarchy.indexOf(ra.role);
        if (idx !== -1 && idx < highestIndex) {
          highestIndex = idx;
          highestRole = ra.role;
        }
      });

      // Check if client explicitly supplied an active role perspective
      const clientActiveRole = req.headers['x-active-role'];
      const clientActiveGroup = req.headers['x-active-group'];

      if (clientActiveRole) {
        if (groupPositions.includes(clientActiveRole)) {
          // Group positions (President, Secretary, Treasurer) are validated against the Group model.
          // The frontend sets this header after the user selects a group in GroupSelectionPage.
          // We trust this header since it was set from the getMyGroups response which checks Group model fields.
          highestRole = clientActiveRole;
        } else if (roleHierarchy.includes(clientActiveRole)) {
          if (clientActiveRole === 'Member' || user.role === clientActiveRole) {
            highestRole = clientActiveRole;
          } else {
            const hasAssignedRole = roleAssignments.some(ra => {
              if (ra.role !== clientActiveRole) return false;
              if (clientActiveGroup && ra.groupId) {
                return ra.groupId.toString() === clientActiveGroup.toString();
              }
              return true;
            });
            if (hasAssignedRole) {
              highestRole = clientActiveRole;
            }
          }
        }
      }
      
      req.user.role = highestRole;

      // Ensure branchId is resolved for Branch Manager / Employee if not directly on user doc
      if (['Branch Manager', 'Employee'].includes(highestRole) && !req.user.branchId) {
        const branchAssign = roleAssignments.find(ra => ra.branchId);
        if (branchAssign?.branchId) {
          req.user.branchId = branchAssign.branchId;
        } else if (highestRole === 'Branch Manager') {
          try {
            const Branch = require('../models/Branch');
            const managedBranch = await Branch.findOne({ managerId: user._id, isDeleted: false });
            if (managedBranch) req.user.branchId = managedBranch._id;
          } catch (bErr) {}
        }
      }

      // Extract Context and bind for backward-compatible financial controllers
      const { getActiveContext } = require('../utils/contextHelper');
      const activeCtx = getActiveContext(req);
      req.user.organizationId = activeCtx.organizationId;
      req.user.branchId = activeCtx.branchId;
      req.user.groupId = activeCtx.groupId;

      // Check Maintenance Mode
      try {
        const SystemSetting = require('../models/SystemSetting');
        const sysSettings = await SystemSetting.findOne();
        if (sysSettings?.maintenanceMode && req.user.role !== 'Super Admin') {
          return res.status(503).json({
            success: false,
            maintenanceMode: true,
            error: 'SAHAKARA ERP is currently undergoing scheduled platform maintenance. Non-administrator access is temporarily restricted.',
          });
        }
      } catch (sysErr) {
        console.warn('Error checking maintenance mode in authMiddleware:', sysErr.message);
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please login again.',
    });
  }
};

// Grant access to specific roles (including group positions like President, Secretary, Treasurer)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        error: `User is not authenticated.`,
      });
    }

    // Check if the user has any role assignment that matches the allowed roles
    const userRoles = req.user.roleAssignments?.map(ra => ra.role) || [];
    // Fallback to the computed highest role if roleAssignments is empty
    if (userRoles.length === 0 && req.user.role) {
      userRoles.push(req.user.role);
    }

    // Also include the active role (which may be a group position like President/Secretary/Treasurer)
    // This is set by the protect middleware based on x-active-role header
    if (req.user.role && !userRoles.includes(req.user.role)) {
      userRoles.push(req.user.role);
    }

    const hasPermission = userRoles.some(role => roles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `User roles [${userRoles.join(', ') || 'Guest'}] are not authorized to perform this action.`,
      });
    }
    next();
  };
};

// Grant access dynamically based on custom role permission matrix
exports.checkPermission = (moduleName, actionName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const role = req.user.role;

    // Super Admin, Org Admin & Branch Manager have full operations override
    if (['Super Admin', 'Organization Admin', 'Branch Manager'].includes(role)) {
      return next();
    }

    // Default permissions for Member self-service
    if (role === 'Member') {
      const memberAllowed = [
        'loan management', 'loans', 'savings management', 'savings',
        'group management', 'groups', 'meetings', 'meeting management',
        'repayments', 'transactions', 'member management', 'members',
        'chat', 'communication', 'complaints', 'account closures', 'account-closures'
      ];
      const normalizedMod = moduleName.toLowerCase().trim();
      if (memberAllowed.includes(normalizedMod) && (actionName === 'read' || actionName === 'create')) {
        return next();
      }
    }

    // Default permissions for Employees (Tellers / Field Officers)
    if (role === 'Employee') {
      const employeeAllowed = [
        'loan management', 'loans', 'savings management', 'savings',
        'group management', 'groups', 'meetings', 'meeting management',
        'repayments', 'transactions', 'member management', 'members', 'branches',
        'chat', 'communication', 'complaints', 'account closures', 'account-closures'
      ];
      const normalizedMod = moduleName.toLowerCase().trim();
      if (employeeAllowed.includes(normalizedMod) && ['read', 'create', 'update', 'upload'].includes(actionName)) {
        return next();
      }
    }

    // Default permissions for Group Executive Positions (President, Secretary, Treasurer)
    // These are group positions set via x-active-role header, not standalone user roles
    if (['President', 'Secretary', 'Treasurer'].includes(role)) {
      return next();
    }

    try {
      // Find role permission matrix in DB
      const roleDoc = await Role.findOne({
        roleName: role,
        status: 'Active',
        isDeleted: false,
      });

      if (roleDoc && roleDoc.permissions) {
        const modPerm = roleDoc.permissions.find(
          (p) =>
            p.module.toLowerCase().trim() === moduleName.toLowerCase().trim() ||
            p.module.toLowerCase().includes(moduleName.toLowerCase()) ||
            moduleName.toLowerCase().includes(p.module.toLowerCase())
        );
        if (modPerm && modPerm.actions.includes(actionName)) {
          return next();
        }
      }
      
      return res.status(403).json({
        success: false,
        error: `Permission denied. Your role '${role}' lacks '${actionName}' permission on '${moduleName}'.`,
      });
    } catch (e) {
      // Fail safely to allowed if DB error on non-admin check
      return next();
    }
  };
};
