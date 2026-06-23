const Evaluation = require('../models/Evaluation');
const Faculty = require('../models/Faculty');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Record Final Evaluation Scorecard
exports.addEvaluation = async (req, res, next) => {
  const {
    groupId,
    innovation,
    technicalComplexity,
    designQuality,
    implementationQuality,
    documentation,
    presentation,
    vivaPerformance,
    comments,
  } = req.body;

  try {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    let evaluation = await Evaluation.findOne({ groupId });

    if (evaluation) {
      // Update
      evaluation.innovation = innovation;
      evaluation.technicalComplexity = technicalComplexity;
      evaluation.designQuality = designQuality;
      evaluation.implementationQuality = implementationQuality;
      evaluation.documentation = documentation;
      evaluation.presentation = presentation;
      evaluation.vivaPerformance = vivaPerformance;
      evaluation.comments = comments;
      evaluation.evaluatedById = faculty._id;
      await evaluation.save(); // triggers total calculation
    } else {
      // Create
      evaluation = await Evaluation.create({
        groupId,
        innovation,
        technicalComplexity,
        designQuality,
        implementationQuality,
        documentation,
        presentation,
        vivaPerformance,
        comments,
        evaluatedById: faculty._id,
      });
    }

    // Notify students of final scorecard
    const students = await Student.find({ groupId });
    for (let student of students) {
      await Notification.create({
        recipientId: student.userId,
        title: 'Final Project Grade Recorded',
        message: `Your final project evaluation score has been recorded. Total: ${evaluation.totalScore}/${evaluation.maxScore}.`,
        type: 'success',
      });
    }

    res.status(200).json({ success: true, message: 'Final evaluation saved successfully', data: evaluation });
  } catch (error) {
    next(error);
  }
};

// Get Group Evaluation
exports.getGroupEvaluation = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    const evaluation = await Evaluation.findOne({ groupId })
      .populate('evaluatedById', 'name email designation');
    
    if (!evaluation) {
      return res.status(200).json({ success: true, hasEvaluation: false });
    }

    res.status(200).json({ success: true, hasEvaluation: true, data: evaluation });
  } catch (error) {
    next(error);
  }
};
