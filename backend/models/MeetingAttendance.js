const mongoose = require('mongoose');

const meetingAttendanceSchema = new mongoose.Schema({
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
  attendanceStatus: {
    type: String,
    enum: ['Present', 'Absent', 'Excused', 'Late'],
    default: 'Absent',
    required: true,
  },
  checkInTime: {
    type: Date,
  },
  remarks: {
    type: String,
    trim: true,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

meetingAttendanceSchema.index({ organizationId: 1, meetingId: 1, participantId: 1 }, { unique: true });

module.exports = mongoose.model('MeetingAttendance', meetingAttendanceSchema);
