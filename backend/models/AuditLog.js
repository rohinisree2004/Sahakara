const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    performerName: {
      type: String,
      default: 'System User',
    },
    performerRole: {
      type: String,
      default: 'Staff',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
    },
    details: {
      type: String,
    },
    description: {
      type: String,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-fill fallback fields before validation
AuditLogSchema.pre('validate', function (next) {
  if (!this.details && this.description) {
    this.details = this.description;
  } else if (!this.details) {
    this.details = this.action || 'Audit event';
  }
  if (!this.performedBy && this.userId) {
    this.performedBy = this.userId;
  }
  if (!this.performerName) {
    this.performerName = 'System User';
  }
  if (!this.performerRole) {
    this.performerRole = 'Staff';
  }
  next();
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
