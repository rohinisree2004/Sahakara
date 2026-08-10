const mongoose = require('mongoose');

const loanRepaymentTransactionSchema = new mongoose.Schema({
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
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  emiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanRepaymentSchedule',
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'],
    required: true,
  },
  referenceNumber: {
    type: String,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  balanceAfterTransaction: {
    type: Number,
    required: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  remarks: {
    type: String,
  },
}, { timestamps: true });

// Strict isolation index
loanRepaymentTransactionSchema.index({ organizationId: 1, branchId: 1, loanId: 1 });
loanRepaymentTransactionSchema.index({ memberId: 1 });
loanRepaymentTransactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('LoanRepaymentTransaction', loanRepaymentTransactionSchema);
