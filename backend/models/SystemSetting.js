const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: 'SAHAKARA ERP',
    },
    tagline: {
      type: String,
      default: 'A Multi-Organization Cooperative Society ERP System',
    },
    supportEmail: {
      type: String,
      default: 'support@sahakaraerp.org',
    },
    supportPhone: {
      type: String,
      default: '+91 (080) 2345-6789',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowNewRegistrations: {
      type: Boolean,
      default: true,
    },
    organizationTypes: {
      type: [String],
      default: [
        'Credit Cooperative',
        'Agricultural Cooperative',
        'Housing Cooperative',
        'Multi-Purpose Cooperative',
        'Other',
      ],
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 60,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSetting', SystemSettingSchema);
