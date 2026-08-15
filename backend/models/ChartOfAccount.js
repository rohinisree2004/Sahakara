const mongoose = require('mongoose');

const chartOfAccountSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  accountCode: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'],
    required: true,
  },
  normalBalance: {
    type: String,
    enum: ['Debit', 'Credit'],
    required: true,
  },
  parentAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

// Prevent duplicate account codes per organization
chartOfAccountSchema.index({ organizationId: 1, accountCode: 1 }, { unique: true });

module.exports = mongoose.model('ChartOfAccount', chartOfAccountSchema);
