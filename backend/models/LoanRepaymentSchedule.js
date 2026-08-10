const mongoose = require('mongoose');

const loanRepaymentScheduleSchema = new mongoose.Schema({
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
  emiNumber: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  principalAmount: {
    type: Number,
    required: true,
  },
  interestAmount: {
    type: Number,
    required: true,
  },
  emiAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Due', 'Partially Paid', 'Paid', 'Overdue', 'Waived'],
    default: 'Upcoming',
  },
  paidDate: {
    type: Date,
  },
}, { timestamps: true });

// Strict isolation index
loanRepaymentScheduleSchema.index({ organizationId: 1, branchId: 1, loanId: 1, emiNumber: 1 });
loanRepaymentScheduleSchema.index({ memberId: 1 });

module.exports = mongoose.model('LoanRepaymentSchedule', loanRepaymentScheduleSchema);
