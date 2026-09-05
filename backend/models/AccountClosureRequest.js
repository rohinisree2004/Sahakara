const mongoose = require('mongoose');

const AccountClosureRequestSchema = new mongoose.Schema(
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
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    closureType: {
      type: String,
      enum: ['Full Membership Closure', 'Savings Account Closure'],
      default: 'Full Membership Closure',
    },
    reason: {
      type: String,
      required: [true, 'Reason for closure is required'],
      trim: true,
    },
    settlementDetails: {
      paymentMode: {
        type: String,
        enum: ['Bank Transfer', 'Cheque', 'Cash', 'UPI'],
        default: 'Bank Transfer',
      },
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      upiId: { type: String, trim: true },
      referenceNumber: { type: String, trim: true },
    },
    refundableSavingsBalance: {
      type: Number,
      default: 0,
    },
    shareCapitalRefund: {
      type: Number,
      default: 0,
    },
    outstandingLoanBalance: {
      type: Number,
      default: 0,
    },
    netSettlementAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved & Settled', 'Rejected'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AccountClosureRequestSchema.index({ organizationId: 1, status: 1 });
AccountClosureRequestSchema.index({ branchId: 1 });
AccountClosureRequestSchema.index({ memberId: 1 });

module.exports = mongoose.model('AccountClosureRequest', AccountClosureRequestSchema);
