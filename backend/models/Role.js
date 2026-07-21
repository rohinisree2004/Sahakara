const mongoose = require('mongoose');

const PermissionActionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      enum: [
        'Organizations',
        'Branches',
        'Users',
        'Members',
        'Groups',
        'Savings',
        'Loans',
        'Accounting',
        'Meetings',
        'Documents',
        'Reports',
        'Notifications',
        'Settings',
      ],
    },
    actions: [
      {
        type: String,
        enum: ['create', 'read', 'update', 'delete', 'approve', 'export', 'upload', 'download'],
      },
    ],
  },
  { _id: false }
);

const RoleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    roleName: {
      type: String,
      required: [true, 'Please add role name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    permissions: [PermissionActionSchema],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
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

module.exports = mongoose.model('Role', RoleSchema);
