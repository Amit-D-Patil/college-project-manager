const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentUrl: {
      type: String,
    },
    attachmentName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
