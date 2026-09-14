const mongoose = require('mongoose');

const RoleAssignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: [
        'Super Admin',
        'Organization Admin',
        'Branch Manager',
        'Employee',
        'Member',
      ],
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      // Nullable for Super Admin
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      // Nullable for Super Admin, Org Admin
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      // Nullable for non-group roles
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
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

// Optional: compound index to prevent duplicate identical role assignments
RoleAssignmentSchema.index(
  { userId: 1, role: 1, organizationId: 1, branchId: 1, groupId: 1 },
  { unique: true }
);

module.exports = mongoose.model('RoleAssignment', RoleAssignmentSchema);
