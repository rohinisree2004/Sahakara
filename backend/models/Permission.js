const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'approve', 'export', 'upload', 'download'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PermissionSchema.index({ module: 1, action: 1 }, { unique: true });

module.exports = mongoose.model('Permission', PermissionSchema);
