const mongoose = require('mongoose');

const meetingAgendaSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  order: {
    type: Number,
    default: 1,
  },
  responsiblePersonId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'responsiblePersonModel',
  },
  responsiblePersonModel: {
    type: String,
    enum: ['User', 'Member'],
    default: 'User',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Discussion', 'Resolved', 'Deferred'],
    default: 'Pending',
  }
}, { timestamps: true });

meetingAgendaSchema.index({ organizationId: 1, meetingId: 1, order: 1 });

module.exports = mongoose.model('MeetingAgenda', meetingAgendaSchema);
