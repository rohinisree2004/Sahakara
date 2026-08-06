const mongoose = require('mongoose');

const loanDocumentSchema = new mongoose.Schema({
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
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  documentType: {
    type: String,
    required: true, // e.g. Identity Proof, Address Proof, Income Proof
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

loanDocumentSchema.index({ organizationId: 1, loanId: 1, memberId: 1 });

module.exports = mongoose.model('LoanDocument', loanDocumentSchema);
