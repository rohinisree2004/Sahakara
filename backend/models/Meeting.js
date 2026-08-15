const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  meetingId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  meetingType: {
    type: String,
    enum: [
      'General Meeting',
      'Board Meeting',
      'Committee Meeting',
      'Branch Meeting',
      'Group Meeting',
      'Financial Review',
      'Loan Review',
      'Emergency Meeting',
      'Other'
    ],
    default: 'General Meeting',
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // e.g. "10:00 AM" or "10:00"
    required: true,
  },
  endTime: {
    type: String, // e.g. "12:00 PM" or "12:00"
    required: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Scheduled',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

meetingSchema.index({ organizationId: 1, date: -1 });
meetingSchema.index({ branchId: 1 });
meetingSchema.index({ groupId: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
