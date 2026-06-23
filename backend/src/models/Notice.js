const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['general', 'review', 'viva', 'submission', 'emergency'],
      default: 'general',
    },
    attachmentUrl: {
      type: String,
    },
    attachmentName: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    targetAudience: {
      type: String,
      required: true,
      enum: ['all', 'students', 'guides', 'coordinators', 'hods'],
      default: 'all',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
