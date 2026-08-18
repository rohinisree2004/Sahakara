const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    societyName: {
      type: String,
      required: [true, 'Please provide the society name'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    contactPerson: {
      type: String,
      required: [true, 'Please provide the contact person name'],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: 'President / Secretary',
    },
    email: {
      type: String,
      required: [true, 'Please provide an official email address'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a valid phone number'],
      trim: true,
    },
    estimatedMembers: {
      type: String,
      default: '101-500',
    },
    societyType: {
      type: String,
      default: 'Primary Agricultural Credit Society (PACS)',
    },
    state: {
      type: String,
      required: [true, 'Please provide state name'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', InquirySchema);
