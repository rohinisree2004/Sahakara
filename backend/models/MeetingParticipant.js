const mongoose = require('mongoose');

const meetingParticipantSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
  },
  participantType: {
    type: String,
    enum: ['User', 'Member'],
    required: true,
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'participantType',
    required: true,
  },
  invitationStatus: {
    type: String,
    enum: ['Invited', 'Confirmed', 'Declined', 'Tentative'],
    default: 'Invited',
  }
}, { timestamps: true });

meetingParticipantSchema.index({ organizationId: 1, meetingId: 1, participantId: 1 }, { unique: true });

module.exports = mongoose.model('MeetingParticipant', meetingParticipantSchema);
