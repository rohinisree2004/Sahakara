const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Savings & Passbook',
        'Loan & EMI Discrepancy',
        'KYC & Member Profile',
        'Group & Thrift Assembly',
        'Staff Misconduct / Branch Service',
        'Technical & Portal Issue',
        'Account Service',
        'Other'
      ],
      default: 'Account Service',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'In Progress',
        'Transferred to Branch Manager',
        'Transferred to Org Admin',
        'Escalated to Super Admin',
        'Resolved',
        'Closed',
        'Rejected'
      ],
      default: 'Submitted',
    },
    targetAuthority: {
      type: String,
      enum: ['Group President', 'Branch Manager', 'Organization Admin', 'Super Admin'],
      default: 'Group President',
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    transferredTo: {
      type: String,
      enum: ['Branch Manager', 'Organization Admin', 'Super Admin'],
    },
    transferredToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    transferredAt: {
      type: Date,
    },
    transferRemarks: {
      type: String,
      trim: true,
    },
    transferHistory: [
      {
        fromAuthority: { type: String },
        toAuthority: { type: String },
        transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        transferDate: { type: Date, default: Date.now },
        remarks: { type: String },
      },
    ],
    escalationLevel: {
      type: String,
      enum: ['Group', 'Branch / Society', 'Super Admin'],
      default: 'Group',
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    escalatedAt: {
      type: Date,
    },
    escalationReason: {
      type: String,
      trim: true,
    },
    raisedByType: {
      type: String,
      enum: ['Member', 'Branch Manager', 'Employee', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'User', 'Super Admin'],
      default: 'Member',
    },
    raisedByName: {
      type: String,
      trim: true,
    },
    resolutionRemarks: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    internalNotes: [
      {
        note: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String },
        authorRole: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ComplaintSchema.index({ organizationId: 1, status: 1 });
ComplaintSchema.index({ branchId: 1 });
ComplaintSchema.index({ targetAuthority: 1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
