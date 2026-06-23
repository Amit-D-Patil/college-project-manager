const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    present: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    reviewNumber: {
      type: String,
      required: true,
      enum: ['Review 1', 'Review 2', 'Review 3', 'Pre-Final Review', 'Final Review'],
    },
    marks: {
      presentation: { type: Number, default: 0 },
      technicalDepth: { type: Number, default: 0 },
      qaPerformance: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      default: 50,
    },
    remarks: {
      type: String,
      default: '',
    },
    attendance: [attendanceSchema],
    evaluatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total marks
reviewSchema.pre('save', function (next) {
  this.totalMarks =
    (this.marks.presentation || 0) +
    (this.marks.technicalDepth || 0) +
    (this.marks.qaPerformance || 0) +
    (this.marks.documentation || 0);
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
