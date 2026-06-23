const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create Notice
exports.createNotice = async (req, res, next) => {
  const { title, content, type, targetAudience, expiryDate } = req.body;

  try {
    const noticeData = {
      title,
      content,
      type,
      targetAudience,
      authorId: req.user._id,
    };

    if (expiryDate) {
      noticeData.expiryDate = new Date(expiryDate);
    }

    if (req.file) {
      noticeData.attachmentUrl = `/uploads/${req.file.filename}`;
      noticeData.attachmentName = req.file.originalname;
    }

    const notice = await Notice.create(noticeData);

    // Create system notification for target audience
    let query = {};
    if (targetAudience !== 'all') {
      query.roles = targetAudience.slice(0, -1); // 'students' -> 'student', etc.
    }

    const users = await User.find(query);
    for (let u of users) {
      await Notification.create({
        recipientId: u._id,
        title: `New Notice: ${title}`,
        message: `A new notice has been published by the administration under category '${type}'.`,
        type: type === 'emergency' ? 'alert' : 'info',
      });
    }

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

// Get Notices (Filtered based on role of requesting user)
exports.getNotices = async (req, res, next) => {
  try {
    const role = req.user.currentRole;
    let targetFilter = ['all'];

    if (role === 'student') {
      targetFilter.push('students');
    } else if (role === 'guide') {
      targetFilter.push('guides');
    } else if (role === 'coordinator') {
      targetFilter.push('coordinators', 'guides');
    } else if (role === 'hod') {
      targetFilter.push('hods', 'coordinators', 'guides');
    }

    const notices = await Notice.find({
      targetAudience: { $in: targetFilter },
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null }
      ]
    }).populate('authorId', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
};

// Update Notice
exports.updateNotice = async (req, res, next) => {
  const { id } = req.params;
  const { title, content, type, targetAudience, expiryDate } = req.body;

  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.type = type || notice.type;
    notice.targetAudience = targetAudience || notice.targetAudience;
    
    if (expiryDate) {
      notice.expiryDate = new Date(expiryDate);
    }

    if (req.file) {
      notice.attachmentUrl = `/uploads/${req.file.filename}`;
      notice.attachmentName = req.file.originalname;
    }

    await notice.save();
    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

// Delete Notice
exports.deleteNotice = async (req, res, next) => {
  const { id } = req.params;

  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
