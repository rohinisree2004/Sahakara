const mongoose = require('mongoose');

const meetingActionItemSchema = new mongoose.Schema({
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
  task: {
    type: String,
    required: true,
    trim: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedToModel',
  },
  assignedToModel: {
    type: String,
    enum: ['User', 'Member'],
    default: 'User',
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  remarks: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

meetingActionItemSchema.index({ organizationId: 1, meetingId: 1 });

module.exports = mongoose.model('MeetingActionItem', meetingActionItemSchema);
