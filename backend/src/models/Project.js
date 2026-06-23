const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    objectives: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
      enum: [
        'Artificial Intelligence',
        'Machine Learning',
        'Data Science',
        'IoT',
        'Cyber Security',
        'Blockchain',
        'Cloud Computing',
        'Mobile Development',
        'Web Technologies',
        'Computer Vision',
        'Robotics',
        'AR/VR',
      ],
    },
    technologies: {
      type: [String],
      required: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    expectedOutcome: {
      type: String,
      required: true,
    },
    preferences: {
      type: [String],
      validate: [val => val.length <= 5, 'Preferences cannot exceed 5 items'],
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected', 'revision_requested'],
      default: 'submitted',
    },
    comment: {
      type: String,
      default: '',
    },
    finalSubmission: {
      reportUrl: String,
      reportName: String,
      sourceCodeUrl: String,
      sourceCodeName: String,
      githubLink: String,
      gitlabLink: String,
      liveUrl: String,
      videoUrl: String,
      researchPaperUrl: String,
      researchPaperName: String,
      presentationUrl: String,
      presentationName: String,
      submittedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      guideApproval: {
        type: Boolean,
        default: false,
      },
      coordinatorApproval: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
