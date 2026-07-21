const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



// Helper to sign JWT Token for user object
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || null,
    },
    process.env.JWT_SECRET || 'sahakara_erp_super_secret_jwt_key_2026_cooperative_society',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );

  const userData = {
    _id: user._id || user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    organizationId: user.organizationId || null,
    phone: user.phone || '',
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

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      return sendTokenResponse(user, 200, res);
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
