const Message = require('../models/Message');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Group = require('../models/Group');

// Send Message
exports.sendMessage = async (req, res, next) => {
  const { recipientId, groupId, content } = req.body;

  try {
    if (!content && !req.file) {
      return res.status(400).json({ success: false, message: 'Message content or attachment is required' });
    }

    const msgData = {
      senderId: req.user._id,
      content: content || '',
    };

    if (recipientId) msgData.recipientId = recipientId;
    if (groupId) msgData.groupId = groupId;

    if (req.file) {
      msgData.attachmentUrl = `/uploads/${req.file.filename}`;
      msgData.attachmentName = req.file.originalname;
    }

    const message = await Message.create(msgData);
    
    // Populate sender details for chat response
    const populated = await Message.findById(message._id).populate('senderId', 'email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Get Conversation Messages
exports.getMessages = async (req, res, next) => {
  const { recipientId, groupId } = req.query;

  try {
    let query = {};

    if (groupId) {
      // Group Chat
      query = { groupId };
    } else if (recipientId) {
      // Direct Message (either sender is req.user & receiver is recipientId OR sender is recipientId & receiver is req.user)
      query = {
        $or: [
          { senderId: req.user._id, recipientId: recipientId },
          { senderId: recipientId, recipientId: req.user._id },
        ],
      };
    } else {
      return res.status(400).json({ success: false, message: 'Please specify recipientId or groupId' });
    }

    const messages = await Message.find(query)
      .populate('senderId', 'email')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// Get List of Active Conversations
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all users this user has messaged or received messages from
    const sent = await Message.distinct('recipientId', { senderId: userId, recipientId: { $ne: null } });
    const received = await Message.distinct('senderId', { recipientId: userId });
    
    const uniqueIds = Array.from(new Set([...sent, ...received]));

    // Fetch details of those users
    const users = await User.find({ _id: { $in: uniqueIds } }).select('email roles currentRole')
      .populate('studentProfile', 'name rollNumber')
      .populate('facultyProfile', 'name designation');

    // Also fetch Group details if user is in a group
    let activeGroup = null;
    if (req.user.currentRole === 'student') {
      const student = await Student.findOne({ userId });
      if (student && student.groupId) {
        activeGroup = await Group.findById(student.groupId).populate('members', 'name email');
      }
    } else {
      // Faculty might be assigned to multiple groups
      const faculty = await Faculty.findOne({ userId });
      if (faculty) {
        activeGroup = await Group.find({ guideId: faculty._id }).populate('members', 'name email');
      }
    }

    res.status(200).json({
      success: true,
      contacts: users,
      group: activeGroup,
    });
  } catch (error) {
    next(error);
  }
};
