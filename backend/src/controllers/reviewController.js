const Review = require('../models/Review');
const Faculty = require('../models/Faculty');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Record Review Marks and Attendance
exports.addReview = async (req, res, next) => {
  const { groupId, reviewNumber, marks, remarks, attendance } = req.body; 
  // attendance: [{ studentId, present: true/false }]
  // marks: { presentation, technicalDepth, qaPerformance, documentation }

  try {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if review already recorded
    let review = await Review.findOne({ groupId, reviewNumber });

    if (review) {
      // Update existing
      review.marks = marks;
      review.remarks = remarks;
      review.attendance = attendance;
      review.evaluatedById = faculty._id;
      await review.save(); // calculates totalMarks in pre-save hook
    } else {
      // Create new
      review = await Review.create({
        groupId,
        reviewNumber,
        marks,
        remarks,
        attendance,
        evaluatedById: faculty._id,
      });
    }

    // Notify students
    const students = await Student.find({ groupId });
    for (let student of students) {
      // Find matching attendance
      const attendanceRecord = attendance.find((att) => att.studentId === String(student._id));
      const presentText = attendanceRecord ? (attendanceRecord.present ? 'Present' : 'Absent') : 'Present';

      await Notification.create({
        recipientId: student.userId,
        title: `Marks Recorded: ${reviewNumber}`,
        message: `Evaluation marks for ${reviewNumber} have been posted by Prof. ${faculty.name}. Score: ${review.totalMarks}/${review.maxMarks}. Attendance: ${presentText}`,
        type: 'success',
      });
    }

    res.status(200).json({ success: true, message: 'Review data saved successfully', data: review });
  } catch (error) {
    next(error);
  }
};

// Get Review History for Group
exports.getGroupReviews = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    const reviews = await Review.find({ groupId })
      .populate('evaluatedById', 'name email designation')
      .populate('attendance.studentId', 'name rollNumber')
      .sort({ date: 1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
