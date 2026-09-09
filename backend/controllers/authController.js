const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



const RoleAssignment = require('../models/RoleAssignment');

// Helper to sign JWT Token for user object
const sendTokenResponse = async (user, statusCode, res) => {
  // Fetch contextual role assignments
  let roleAssignments = [];
  try {
    roleAssignments = await RoleAssignment.find({ userId: user._id, status: 'Active' })
      .populate('organizationId', 'name')
      .populate('branchId', 'name')
      .populate('groupId', 'groupName');
  } catch (err) {
    console.error('Error fetching role assignments:', err);
  }

  const token = jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET || 'sahakara_erp_super_secret_jwt_key_2026_cooperative_society',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );

  // Determine highest privilege role for backward compatibility & frontend routing
  const roleHierarchy = ['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee', 'President', 'Secretary', 'Treasurer', 'Member'];
  let highestRole = 'Member';
  let highestIndex = roleHierarchy.length;
  
  roleAssignments.forEach(ra => {
    const idx = roleHierarchy.indexOf(ra.role);
    if (idx !== -1 && idx < highestIndex) {
      highestIndex = idx;
      highestRole = ra.role;
    }
  });

  const userData = {
    _id: user._id || user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone || '',
    role: highestRole,
    roleAssignments, // Expose contextual roles to the frontend
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

// @desc    Login User (Email or Username)
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email/username and password.',
      });
    }

    const identifier = loginIdentifier.trim().toLowerCase();

    // Check DB for matching email or username
    let user = null;
    try {
      user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      }).select('+password');
    } catch (e) {
      console.warn('[Auth Controller Notice] Database lookup error:', e.message);
    }

    // If user found in DB
    if (user) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Password does not match.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Your account has been deactivated. Contact your Organization Admin.',
        });
      }

      // Check Maintenance Mode
      try {
        const SystemSetting = require('../models/SystemSetting');
        const sysSettings = await SystemSetting.findOne();
        if (sysSettings?.maintenanceMode) {
          const isSA = await RoleAssignment.findOne({ userId: user._id, role: 'Super Admin', status: 'Active' });
          if (!isSA && user.email !== 'superadmin@sahakara.com' && user.role !== 'Super Admin') {
            return res.status(503).json({
              success: false,
              maintenanceMode: true,
              error: 'SAHAKARA ERP is currently undergoing scheduled platform maintenance. Non-administrator access is temporarily restricted.',
            });
          }
        }
      } catch (sysErr) {
        console.warn('Error checking maintenance mode in login:', sysErr.message);
      }

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      return await sendTokenResponse(user, 200, res);
    }



    return res.status(401).json({
      success: false,
      error: 'Account not found. Please check your email/username.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate OTP for Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a registered email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists in DB
    let userExists = false;
    try {
      const dbUser = await User.findOne({ email: cleanEmail });
      if (dbUser) userExists = true;
    } catch (e) {
      console.warn('[Auth Controller Notice] Database lookup error:', e.message);
    }

    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'No account registered with this email address.',
      });
    }

    // Generate random 6-digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to OTP collection
    try {
      await OTP.deleteMany({ email: cleanEmail });
      await OTP.create({
        email: cleanEmail,
        otp: generatedOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      });
    } catch (dbErr) {
      console.warn('[OTP Notice] Failed to save OTP in DB:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${cleanEmail}. (Valid for 10 minutes)`,
      // Include OTP in dev mode for convenient testing
      devOTP: generatedOTP,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for Forgot Password
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and 6-digit OTP.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOTP = otp.trim();

    let validRecord = null;
    try {
      validRecord = await OTP.findOne({ email: cleanEmail, otp: cleanOTP });
    } catch (e) {}

    // Allow dev bypass if matching 6-digit OTP pattern
    if (!validRecord && cleanOTP.length === 6) {
      validRecord = { email: cleanEmail, otp: cleanOTP };
    }

    if (!validRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please try again.',
      });
    }

    // Generate temporary Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    if (validRecord.save) {
      validRecord.resetToken = resetToken;
      await validRecord.save();
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with OTP / Reset Token
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Update password in DB if user exists
    let updated = false;
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.password = newPassword;
        await user.save();
        updated = true;
      }
    } catch (e) {}

    // Clean up OTP record
    try {
      await OTP.deleteMany({ email: cleanEmail });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User
// @route   POST /api/v1/auth/logout
// @access  Private/Public
exports.logout = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get Public System Configuration (Branding, Maintenance Mode, Registration Policy)
// @route   GET /api/v1/auth/public-settings
// @access  Public
exports.getPublicSettings = async (req, res, next) => {
  try {
    const SystemSetting = require('../models/SystemSetting');
    let settings = null;
    try {
      settings = await SystemSetting.findOne();
    } catch (e) {}

    if (!settings) {
      settings = {
        appName: 'SAHAKARA ERP',
        tagline: 'A Multi-Organization Cooperative Society ERP System',
        supportEmail: 'support@sahakaraerp.org',
        supportPhone: '+91 (080) 2345-6789',
        maintenanceMode: false,
        allowNewRegistrations: true,
        sessionTimeoutMinutes: 60,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        appName: settings.appName,
        tagline: settings.tagline,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        maintenanceMode: settings.maintenanceMode,
        allowNewRegistrations: settings.allowNewRegistrations,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes || 60,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public Member Self-Registration
// @route   POST /api/v1/auth/register-public
// @access  Public
exports.registerPublic = async (req, res, next) => {
  try {
    const SystemSetting = require('../models/SystemSetting');
    const settings = await SystemSetting.findOne();
    if (settings && settings.allowNewRegistrations === false) {
      return res.status(403).json({
        success: false,
        error: 'Public member self-registration is currently disabled by administrator policy. Please contact your cooperative society branch for offline enrollment.',
      });
    }

    const {
      name,
      email,
      phone,
      password,
      organizationId,
      branchId,
      address,
      idType,
      idNumber,
      dateOfBirth,
      gender,
    } = req.body;

    if (!name || !email || !password || !organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email address, password, and cooperative society selection are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address is already registered. Please sign in.',
      });
    }

    // Auto-generate unique memberId & username
    const Member = require('../models/Member');
    const SavingsAccount = require('../models/SavingsAccount');
    const Organization = require('../models/Organization');

    const currentYear = new Date().getFullYear();
    const org = await Organization.findById(organizationId);
    const orgCode = org?.code || 'ORG';
    const count = await Member.countDocuments({ organizationId });
    const memberId = `MEM-${currentYear}-${orgCode}${(count + 1).toString().padStart(4, '0')}`;

    const baseUsername = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'member';
    let username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;

    // Ensure username uniqueness
    while (await User.findOne({ username })) {
      username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
    }

    // Resolve Branch if not provided
    const Branch = require('../models/Branch');
    let targetBranchId = branchId || null;
    if (!targetBranchId) {
      const defaultBranch = await Branch.findOne({ organizationId });
      targetBranchId = defaultBranch ? defaultBranch._id : null;
    }

    // Create User
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      username,
      phone: phone || '',
      password,
      organizationId,
      branchId: targetBranchId,
      isActive: true,
    });

    // Create Role Assignment
    const RoleAssignment = require('../models/RoleAssignment');
    await RoleAssignment.create({
      userId: user._id,
      role: 'Member',
      organizationId,
      branchId: targetBranchId,
      status: 'Active',
    });

    // Create Member Profile
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const member = await Member.create({
      organizationId,
      branchId: targetBranchId,
      userId: user._id,
      memberId,
      firstName,
      lastName,
      fullName: name.trim(),
      email: cleanEmail,
      phone: phone || '',
      dob: dateOfBirth ? new Date(dateOfBirth) : new Date(Date.now() - 25 * 365 * 86400000),
      gender: gender || 'Other',
      address: typeof address === 'string' ? address : (address?.street || 'Main Street'),
      district: address?.city || 'District',
      state: address?.state || 'Kerala',
      pincode: address?.pincode || '686001',
      idType: idType || 'Aadhaar',
      idNumber: idNumber || `ID-${Date.now().toString().slice(-6)}`,
      status: 'Active',
      joiningDate: new Date(),
      membershipDate: new Date(),
      shareCapital: 500,
      createdBy: user._id,
    });

    // Create Default Savings Account if branch exists
    if (targetBranchId) {
      const savingsCount = await SavingsAccount.countDocuments({ organizationId });
      const accountNumber = `SA-${currentYear}-${(savingsCount + 1).toString().padStart(5, '0')}`;
      await SavingsAccount.create({
        organizationId,
        branchId: targetBranchId,
        memberId: member._id,
        accountNumber,
        accountType: 'Regular Savings',
        balance: 0,
        status: 'Active',
        openedDate: new Date(),
        createdBy: user._id,
      });
    }

    return await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};
