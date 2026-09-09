const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
  logout,
  getPublicSettings,
  registerPublic,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public-settings', getPublicSettings);
router.post('/register-public', registerPublic);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

module.exports = router;
