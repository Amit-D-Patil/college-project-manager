const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    innovation: { type: Number, required: true, default: 0, min: 0, max: 10 },
    technicalComplexity: { type: Number, required: true, default: 0, min: 0, max: 15 },
    designQuality: { type: Number, required: true, default: 0, min: 0, max: 15 },
    implementationQuality: { type: Number, required: true, default: 0, min: 0, max: 20 },
    documentation: { type: Number, required: true, default: 0, min: 0, max: 15 },
    presentation: { type: Number, required: true, default: 0, min: 0, max: 10 },
    vivaPerformance: { type: Number, required: true, default: 0, min: 0, max: 15 },
    totalScore: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    evaluatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    comments: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total score
evaluationSchema.pre('save', function (next) {
  this.totalScore =
    (this.innovation || 0) +
    (this.technicalComplexity || 0) +
    (this.designQuality || 0) +
    (this.implementationQuality || 0) +
    (this.documentation || 0) +
    (this.presentation || 0) +
    (this.vivaPerformance || 0);
  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
