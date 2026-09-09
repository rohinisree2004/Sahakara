const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Member must belong to an organization'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    groupIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
    memberId: {
      type: String,
      required: [true, 'Member ID is required'],
      trim: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please add full name'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    dob: {
      type: Date,
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
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
    pincode: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['Regular Member', 'Associate Member', 'Nominal Member'],
      default: 'Regular Member',
    },
    nominee: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      sharePercentage: { type: Number, default: 100 },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    familyMembers: [
      {
        name: { type: String },
        relation: { type: String },
        age: { type: Number },
      },
    ],
    kycDocuments: {
      aadhaarNumber: { type: String, default: '' },
      panNumber: { type: String, default: '' },
      aadhaarFile: { type: String, default: '' },
      panFile: { type: String, default: '' },
      addressProofFile: { type: String, default: '' },
      kycVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
    },
    profileImage: {
      type: String,
      default: '',
    },
    membershipStatus: {
      type: String,
      enum: ['Pending', 'Active', 'Suspended', 'Rejected'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      default: '',
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

// Compound unique index: memberId must be unique per organization
MemberSchema.index({ organizationId: 1, memberId: 1 }, { unique: true });

module.exports = mongoose.model('Member', MemberSchema);
