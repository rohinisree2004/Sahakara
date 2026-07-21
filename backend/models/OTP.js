const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: 'PASSWORD_RESET',
    },
    resetToken: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove expired OTPs from MongoDB
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', OTPSchema);
