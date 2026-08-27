const mongoose = require('mongoose');

const loanReviewSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['Started Review', 'Recommended', 'Returned for Correction', 'Requested Additional Docs', 'Resubmitted after Correction', 'Approved', 'Rejected'],
    required: true,
  },
  remarks: {
    type: String,
    required: true,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

loanReviewSchema.index({ organizationId: 1, loanId: 1 });

module.exports = mongoose.model('LoanReview', loanReviewSchema);
