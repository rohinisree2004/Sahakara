const mongoose = require('mongoose');

const OrganizationSettingSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Settings must belong to an organization'],
      unique: true,
      index: true,
    },
    financialYear: {
      type: String,
      default: '2024-2025',
    },
    currency: {
      type: String,
      default: 'INR (₹)',
    },
    timeZone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    theme: {
      type: String,
      default: 'Dark Emerald',
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: true,
    },
    autoAuditLogs: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OrganizationSetting', OrganizationSettingSchema);
