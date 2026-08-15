const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  sourceModule: {
    type: String,
    enum: ['Savings', 'Loan', 'Repayment', 'Income', 'Expense', 'ManualJournal'],
    required: true,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId, // ID of the underlying transaction (e.g. SavingsTransaction ID)
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  },
  journalEntryId: {
    type: mongoose.Schema.Types.ObjectId, // Link to the double-entry record created
    ref: 'JournalEntry',
  },
  transactionType: {
    type: String,
    enum: ['Inflow', 'Outflow', 'Adjustment'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'System', 'Other'],
    default: 'Cash',
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Reversed', 'Cancelled'],
    default: 'Completed',
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Reversal Tracking
  reversalOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialTransaction',
  },
  reversalReason: {
    type: String,
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reversedAt: {
    type: Date,
  }
}, { timestamps: true });

financialTransactionSchema.index({ organizationId: 1, transactionDate: -1 });
financialTransactionSchema.index({ sourceId: 1 });

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema);
