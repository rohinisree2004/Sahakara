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
      req.user = user;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please login again.',
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to perform this action.`,
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

    // Super Admin & Org Admin have full access override
    if (['Super Admin', 'Organization Admin'].includes(req.user.role)) {
      return next();
    }

    try {
      // Find role permission matrix
      const roleDoc = await Role.findOne({
        roleName: req.user.role,
        status: 'Active',
        isDeleted: false,
      });

      if (roleDoc) {
        const modPerm = roleDoc.permissions.find(
          (p) => p.module.toLowerCase() === moduleName.toLowerCase()
        );
        if (modPerm && modPerm.actions.includes(actionName)) {
          return next();
        }
      }
      
      return res.status(403).json({
        success: false,
        error: `Permission denied. Your role '${req.user.role}' lacks '${actionName}' permission on '${moduleName}'.`,
      });
    } catch (e) {
      return res.status(503).json({
        success: false,
        error: 'Database error occurred while checking permissions.',
      });
    }
  };
};
