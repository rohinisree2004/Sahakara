const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    senderRole: {
      type: String,
      trim: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
