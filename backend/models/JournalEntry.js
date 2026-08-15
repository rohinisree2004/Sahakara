const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  entryNumber: {
    type: String,
    required: true,
    unique: true,
  },
  entryDate: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  referenceType: {
    type: String,
    enum: ['SavingsDeposit', 'SavingsWithdrawal', 'LoanDisbursement', 'LoanRepayment', 'ManualExpense', 'ManualIncome', 'SystemAdjustment', 'Other'],
    required: true,
  },
  referenceId: {
    type: String, // String to handle diverse reference types or IDs from different collections
  },
  status: {
    type: String,
    enum: ['Posted', 'Reversed'],
    default: 'Posted',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

journalEntrySchema.index({ organizationId: 1, entryNumber: 1 });
journalEntrySchema.index({ organizationId: 1, entryDate: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
