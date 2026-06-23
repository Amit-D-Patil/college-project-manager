const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Group = require('../models/Group');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Review = require('../models/Review');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const Department = require('../models/Department');

// Get Role-Based Dashboard Analytics
exports.getDashboardAnalytics = async (req, res, next) => {
  const role = req.user.currentRole;

  try {
    let analyticsData = {};

    if (role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const inGroup = !!student.groupId;
      let groupDetails = null;
      let tasksOverview = { completed: 0, pending: 0, total: 0 };
      let reviewsRecorded = [];

      if (inGroup) {
        groupDetails = await Group.findById(student.groupId)
          .populate('guideId', 'name designation email mobile')
          .populate('projectId');

        const tasks = await Task.find({ groupId: student.groupId });
        tasksOverview.total = tasks.length;
        tasksOverview.completed = tasks.filter((t) => t.status === 'approved' || t.status === 'completed').length;
        tasksOverview.pending = tasks.length - tasksOverview.completed;

        reviewsRecorded = await Review.find({ groupId: student.groupId }).select('reviewNumber totalMarks maxMarks remarks date');
      }

      // Fetch unread notifications
      const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });

      // Fetch active notices
      const activeNotices = await Notice.find({
        targetAudience: { $in: ['all', 'students'] },
        $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
      }).sort({ createdAt: -1 }).limit(5);

      analyticsData = {
        studentDetails: student,
        inGroup,
        groupDetails,
        tasksOverview,
        reviewsRecorded,
        unreadCount,
        activeNotices,
      };
    } else if (role === 'guide') {
      const faculty = await Faculty.findOne({ userId: req.user._id });
      if (!faculty) {
        return res.status(404).json({ success: false, message: 'Faculty profile not found' });
      }

      // Fetch groups assigned
      const assignedGroups = await Group.find({ guideId: faculty._id })
        .populate('members', 'name rollNumber')
        .populate('projectId');

      const groupAnalytics = await Promise.all(
        assignedGroups.map(async (g) => {
          const totalTasks = await Task.countDocuments({ groupId: g._id });
          const completedTasks = await Task.countDocuments({ groupId: g._id, status: 'approved' });
          const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const reviews = await Review.countDocuments({ groupId: g._id });

          return {
            groupId: g._id,
            groupCode: g.groupCode,
            projectTitle: g.projectId ? g.projectId.title : 'Not Registered',
            membersCount: g.members.length,
            progressPercentage,
            reviewsCount: reviews,
          };
        })
      );

      // Workload summary
      const workload = {
        active: assignedGroups.length,
        max: faculty.maxLoad,
      };

      analyticsData = {
        facultyDetails: faculty,
        workload,
        assignedGroupsCount: assignedGroups.length,
        groupAnalytics,
      };
    } else if (role === 'coordinator' || role === 'hod' || role === 'principal') {
      // High-level aggregates (department filter applies for Coordinator & HOD)
      let deptQuery = {};
      let facultyProfile = null;

      if (role !== 'principal') {
        facultyProfile = await Faculty.findOne({ userId: req.user._id });
        if (facultyProfile) {
          deptQuery.departmentId = facultyProfile.departmentId;
        }
      }

      // Totals
      const totalStudents = await Student.countDocuments(deptQuery);
      const totalGroups = await Group.countDocuments(deptQuery);
      const totalProjects = await Project.countDocuments(
        role === 'principal' ? {} : { groupId: { $in: await Group.find(deptQuery).distinct('_id') } }
      );

      // Project states
      const projectStates = await Project.aggregate([
        {
          $match: role === 'principal' ? {} : { groupId: { $in: await Group.find(deptQuery).distinct('_id') } },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      // Domain distribution
      const domainDistribution = await Project.aggregate([
        {
          $match: role === 'principal' ? {} : { groupId: { $in: await Group.find(deptQuery).distinct('_id') } },
        },
        {
          $group: {
            _id: '$domain',
            count: { $sum: 1 },
          },
        },
      ]);

      // Guide Workload distribution
      const guideFilter = role === 'principal' ? { roles: 'guide' } : { roles: 'guide', departmentId: deptQuery.departmentId };
      const guides = await Faculty.find(guideFilter).select('name allocatedGroupsCount maxLoad');

      // Pending allocations
      const pendingAllocations = await Group.countDocuments({ ...deptQuery, guideId: null });

      // Overdue tasks count
      const groupsInDept = await Group.find(deptQuery).distinct('_id');
      const overdueTasks = await Task.countDocuments({
        groupId: { $in: groupsInDept },
        deadline: { $lt: new Date() },
        status: { $nin: ['approved', 'completed'] },
      });

      // Review progress (average count of reviews per group)
      const reviewsCount = await Review.countDocuments({ groupId: { $in: groupsInDept } });
      const avgReviewsPerGroup = totalGroups > 0 ? (reviewsCount / totalGroups).toFixed(1) : 0;

      analyticsData = {
        totalStudents,
        totalGroups,
        totalProjects,
        projectStates,
        domainDistribution,
        guideDistribution: guides,
        pendingAllocations,
        overdueTasks,
        avgReviewsPerGroup,
        departmentName: facultyProfile && facultyProfile.departmentId ? (await Department.findById(facultyProfile.departmentId)).name : 'All Departments',
      };
    }

    res.status(200).json({
      success: true,
      role,
      analytics: analyticsData,
    });
  } catch (error) {
    next(error);
  }
};

// Fetch dynamic notification tray
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Mark notifications as read
exports.markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
