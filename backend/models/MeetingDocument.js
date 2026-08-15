const mongoose = require('mongoose');

const meetingDocumentSchema = new mongoose.Schema({
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
  documentType: {
    type: String,
    enum: ['Notice', 'Agenda', 'Minutes', 'Resolution', 'Attendance Sheet', 'Supporting Document'],
    default: 'Supporting Document',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

meetingDocumentSchema.index({ organizationId: 1, meetingId: 1 });

module.exports = mongoose.model('MeetingDocument', meetingDocumentSchema);
