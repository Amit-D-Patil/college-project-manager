const { put } = require('@vercel/blob');
const Task = require('../models/Task');
const Group = require('../models/Group');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Assign Task to Group
exports.assignTask = async (req, res, next) => {
  const { groupId, title, description, deadline, priority } = req.body;

  try {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.guideId.equals(faculty._id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to assign tasks to this group' });
    }

    const taskData = {
      groupId,
      assignedById: faculty._id,
      title,
      description,
      deadline: new Date(deadline),
      priority,
      status: 'pending',
    };

    if (req.file) {
      const blob = await put(req.file.originalname, req.file.buffer, { access: 'public', contentType: req.file.mimetype });
      taskData.deliverableUrl = blob.url;
      taskData.deliverableName = req.file.originalname;
    }

    const task = await Task.create(taskData);

    // Notify group members
    const students = await Student.find({ groupId });
    for (let student of students) {
      await Notification.create({
        recipientId: student.userId,
        title: 'New Task Assigned',
        message: `Prof. ${faculty.name} assigned a new task: "${title}". Deadline: ${new Date(deadline).toLocaleDateString()}`,
        type: 'info',
      });
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Get Tasks by Group
exports.getGroupTasks = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    const tasks = await Task.find({ groupId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// Update Task Progress (Student)
exports.updateTaskProgress = async (req, res, next) => {
  const { id } = req.params;
  const { progressPercentage, comment } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (progressPercentage !== undefined) {
      task.progressPercentage = Number(progressPercentage);
      if (task.progressPercentage === 100) {
        task.status = 'under_review';
      } else if (task.progressPercentage > 0) {
        task.status = 'in_progress';
      }
    }

    if (req.file) {
      const blob = await put(req.file.originalname, req.file.buffer, { access: 'public', contentType: req.file.mimetype });
      task.deliverableUrl = blob.url;
      task.deliverableName = req.file.originalname;
      task.status = 'under_review';
      task.progressPercentage = 100;
    }

    if (comment) {
      const student = await Student.findOne({ userId: req.user._id });
      task.comments.push({
        authorId: req.user._id,
        authorName: student ? student.name : 'Student',
        text: comment,
      });
    }

    await task.save();

    // Notify Guide
    const faculty = await Faculty.findById(task.assignedById);
    if (faculty && task.status === 'under_review') {
      await Notification.create({
        recipientId: faculty.userId,
        title: 'Task Deliverable Submitted',
        message: `Group has submitted a deliverable for task: "${task.title}".`,
        type: 'info',
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Review Task (Guide)
exports.reviewTask = async (req, res, next) => {
  const { id } = req.params;
  const { status, comment } = req.body; // 'approved', 'revision_requested', 'completed'

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const faculty = await Faculty.findOne({ userId: req.user._id });
    if (!task.assignedById.equals(faculty._id)) {
      return res.status(403).json({ success: false, message: 'You are not the assigner of this task' });
    }

    task.status = status;
    if (status === 'approved' || status === 'completed') {
      task.progressPercentage = 100;
    } else if (status === 'revision_requested') {
      task.progressPercentage = 50;
    }

    if (comment) {
      task.comments.push({
        authorId: req.user._id,
        authorName: faculty.name,
        text: comment,
      });
    }

    await task.save();

    // Notify students
    const students = await Student.find({ groupId: task.groupId });
    for (let student of students) {
      await Notification.create({
        recipientId: student.userId,
        title: status === 'approved' ? 'Task Approved' : 'Revision Requested on Task',
        message: `Prof. ${faculty.name} marked task "${task.title}" as: ${status}. Remarks: ${comment || 'None'}`,
        type: status === 'approved' ? 'success' : 'warning',
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
