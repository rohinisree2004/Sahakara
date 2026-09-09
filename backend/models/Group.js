const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Group must belong to an organization'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Group must belong to a branch'],
      index: true,
    },
    groupId: {
      type: String,
      required: [true, 'Group ID is required'],
      trim: true,
      uppercase: true,
    },
    groupCode: {
      type: String,
      required: [true, 'Group Code is required'],
      trim: true,
      uppercase: true,
    },
    groupName: {
      type: String,
      required: [true, 'Please add group name'],
      trim: true,
    },
    groupType: {
      type: String,
      enum: ['Self-Help Group (SHG)', 'Joint Liability Group (JLG)', 'Farmers Group', 'Savings Group', 'Loan Group'],
      default: 'Self-Help Group (SHG)',
    },
    description: {
      type: String,
      trim: true,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    presidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    secretaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    treasurerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    totalMembers: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
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

// Compound unique index: groupCode & groupId must be unique per organization
GroupSchema.index({ organizationId: 1, groupCode: 1 }, { unique: true });

module.exports = mongoose.model('Group', GroupSchema);
