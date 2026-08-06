const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  loanTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanType',
    required: true,
  },
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  requestedAmount: {
    type: Number,
    required: true,
    min: 1,
  },
  approvedAmount: {
    type: Number,
    default: 0,
  },
  disbursedAmount: {
    type: Number,
    default: 0,
  },
  outstandingAmount: {
    type: Number,
    default: 0,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  tenure: {
    type: Number, // In months
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Under Review', 'Recommended', 'Approved', 'Rejected', 'Disbursed', 'Active', 'Closed'],
    default: 'Pending',
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  approvalDate: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  disbursementDate: {
    type: Date,
  },
  disbursedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  remarks: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
  }
}, { timestamps: true });

// Strict isolation index
loanSchema.index({ organizationId: 1, branchId: 1, memberId: 1 });

module.exports = mongoose.model('Loan', loanSchema);
