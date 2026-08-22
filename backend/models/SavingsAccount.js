const mongoose = require('mongoose');

const SavingsAccountSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Savings Account must belong to an organization'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Savings Account must belong to a branch'],
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Savings Account must belong to a member'],
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
      unique: true,
      index: true,
    },
    accountType: {
      type: String,
      required: [true, 'Account type is required'],
      enum: ['Regular Savings', 'Recurring Deposit', 'Fixed Deposit', 'Pigmy Account'],
      default: 'Regular Savings',
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Opening balance cannot be negative'],
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Current balance cannot be negative'],
    },
    minimumBalance: {
      type: Number,
      default: 0,
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Closed', 'Frozen'],
      default: 'Active',
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    lastTransactionDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
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
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimization and data isolation
SavingsAccountSchema.index({ organizationId: 1, memberId: 1, groupId: 1 });

module.exports = mongoose.model('SavingsAccount', SavingsAccountSchema);
