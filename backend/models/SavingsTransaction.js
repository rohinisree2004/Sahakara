const mongoose = require('mongoose');

const SavingsTransactionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Transaction must belong to an organization'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Transaction must belong to a branch'],
      index: true,
    },
    savingsAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsAccount',
      required: [true, 'Transaction must belong to a savings account'],
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Transaction must belong to a member'],
      index: true,
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      index: true,
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['Deposit', 'Withdrawal', 'Adjustment', 'Interest', 'Fee'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'],
      default: 'Cash',
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    balanceAfterTransaction: {
      type: Number,
      required: [true, 'Balance after transaction is required'],
      min: [0, 'Balance cannot be negative'],
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Reverted'],
      default: 'Completed',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries for passbook and history
SavingsTransactionSchema.index({ savingsAccountId: 1, transactionDate: -1 });
SavingsTransactionSchema.index({ organizationId: 1, memberId: 1, transactionDate: -1 });

module.exports = mongoose.model('SavingsTransaction', SavingsTransactionSchema);
