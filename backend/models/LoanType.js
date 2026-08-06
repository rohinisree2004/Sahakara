const mongoose = require('mongoose');

const loanTypeSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  maximumAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  maximumTenure: {
    type: Number, // In months
    required: true,
    min: 1,
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

// Ensure unique loan type name per organization
loanTypeSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('LoanType', loanTypeSchema);
