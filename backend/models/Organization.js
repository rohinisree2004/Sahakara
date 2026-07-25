const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add organization name'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add organization code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    societyType: {
      type: String,
      enum: [
        'Credit Cooperative',
        'Agricultural Cooperative',
        'Housing Cooperative',
        'Multi-Purpose Cooperative',
        'Other',
      ],
      default: 'Credit Cooperative',
    },
    email: {
      type: String,
      required: [true, 'Please add contact email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add contact phone'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please specify state/province'],
    },
    city: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Suspended', 'Rejected'],
      default: 'Active',
    },
    rejectionRemarks: {
      type: String,
      default: '',
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
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

module.exports = mongoose.model('Organization', OrganizationSchema);
