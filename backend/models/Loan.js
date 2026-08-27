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
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    index: true,
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
    min: 1,
  },
  principalAmount: {
    type: Number,
    default: 0,
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
  },
  tenureMonths: {
    type: Number,
  },
  eligibilityDetails: {
    type: mongoose.Schema.Types.Mixed,
  },
  purpose: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Under Review', 'Recommended', 'Approved', 'Rejected', 'Returned', 'Disbursed', 'Active', 'Closed'],
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
  returnReason: {
    type: String,
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  returnedDate: {
    type: Date,
  },
  resubmissionCount: {
    type: Number,
    default: 0,
  },
  lastResubmittedAt: {
    type: Date,
  },
  cibilScore: {
    type: Number,
  },
  cibilReport: {
    type: mongoose.Schema.Types.Mixed,
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
  closureDate: {
    type: Date,
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  closureRemarks: {
    type: String,
  },
  rejectionReason: {
    type: String,
  }
}, { timestamps: true });

loanSchema.pre('validate', function (next) {
  if (!this.requestedAmount && this.principalAmount) {
    this.requestedAmount = this.principalAmount;
  } else if (!this.principalAmount && this.requestedAmount) {
    this.principalAmount = this.requestedAmount;
  }

  if (!this.tenure && this.tenureMonths) {
    this.tenure = this.tenureMonths;
  } else if (!this.tenureMonths && this.tenure) {
    this.tenureMonths = this.tenure;
  }
  next();
});

// Strict isolation index
loanSchema.index({ organizationId: 1, branchId: 1, memberId: 1 });

module.exports = mongoose.model('Loan', loanSchema);
