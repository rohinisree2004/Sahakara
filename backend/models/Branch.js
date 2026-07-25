const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Branch must belong to an organization'],
      index: true,
    },
    branchCode: {
      type: String,
      required: [true, 'Please add branch code'],
      trim: true,
      uppercase: true,
    },
    branchName: {
      type: String,
      required: [true, 'Please add branch name'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    workingHours: {
      type: String,
      default: '9:00 AM - 5:00 PM (Mon-Sat)',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    managerName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: branchCode must be unique per organization
BranchSchema.index({ organizationId: 1, branchCode: 1 }, { unique: true });

module.exports = mongoose.model('Branch', BranchSchema);
