const mongoose = require('mongoose');

const meetingMinuteSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    unique: true,
  },
  summary: {
    type: String,
    required: true,
    trim: true,
  },
  discussions: {
    type: String,
    trim: true,
  },
  decisions: {
    type: String,
    trim: true,
  },
  resolutions: {
    type: String,
    trim: true,
  },
  finalized: {
    type: Boolean,
    default: false,
  },
  finalizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  finalizedAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

meetingMinuteSchema.index({ organizationId: 1, meetingId: 1 });

module.exports = mongoose.model('MeetingMinute', meetingMinuteSchema);
