const Group = require('../models/Group');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// Create Group
exports.createGroup = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (student.groupId) {
      return res.status(400).json({ success: false, message: 'You are already a member of a group' });
    }

    // Generate unique group code
    let groupCode;
    let codeExists = true;
    while (codeExists) {
      const randNum = Math.floor(100 + Math.random() * 900); // 3 digit code
      groupCode = `G-${student.division}-${randNum}`;
      const check = await Group.findOne({ groupCode });
      if (!check) codeExists = false;
    }

    const group = await Group.create({
      groupCode,
      departmentId: student.departmentId,
      academicYearId: student.academicYearId,
      division: student.division,
      leader: student._id,
      members: [student._id],
      status: 'pending_approval',
    });

    student.groupId = group._id;
    await student.save();

    res.status(201).json({
      success: true,
      message: `Group ${groupCode} created successfully`,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// Join Group via Code
exports.joinGroup = async (req, res, next) => {
  const { groupCode } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (student.groupId) {
      return res.status(400).json({ success: false, message: 'You are already a member of a group' });
    }

    const group = await Group.findOne({ groupCode });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group code not found' });
    }

    // Check maximum members
    if (group.members.length >= 4) {
      return res.status(400).json({ success: false, message: 'Group is already full (maximum 4 members)' });
    }

    // Validate same division
    if (group.division !== student.division) {
      return res.status(400).json({
        success: false,
        message: `Division mismatch. You belong to Division '${student.division}' but this group is for Division '${group.division}'`,
      });
    }

    // Join group
    group.members.push(student._id);
    // Remove from pendingInvites if present
    group.pendingInvites = group.pendingInvites.filter((id) => !id.equals(student._id));
    await group.save();

    student.groupId = group._id;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// Send Invite to Student
exports.inviteMember = async (req, res, next) => {
  const { rollNumber } = req.body;

  try {
    const leaderStudent = await Student.findOne({ userId: req.user._id });
    const group = await Group.findById(leaderStudent.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.leader.equals(leaderStudent._id)) {
      return res.status(403).json({ success: false, message: 'Only the group leader can invite members' });
    }

    if (group.members.length + group.pendingInvites.length >= 4) {
      return res.status(400).json({ success: false, message: 'Group slots are full (members + pending invites cannot exceed 4)' });
    }

    const targetStudent = await Student.findOne({ rollNumber });
    if (!targetStudent) {
      return res.status(404).json({ success: false, message: 'Student with this roll number not found' });
    }

    if (targetStudent.groupId) {
      return res.status(400).json({ success: false, message: 'Student is already in a group' });
    }

    if (targetStudent.division !== leaderStudent.division) {
      return res.status(400).json({ success: false, message: 'Student must be in the same division' });
    }

    if (group.pendingInvites.includes(targetStudent._id) || group.members.includes(targetStudent._id)) {
      return res.status(400).json({ success: false, message: 'Student has already been invited or is a member' });
    }

    group.pendingInvites.push(targetStudent._id);
    await group.save();

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${targetStudent.name}`,
    });
  } catch (error) {
    next(error);
  }
};

// Accept Invite
exports.acceptInvite = async (req, res, next) => {
  const { groupId } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.pendingInvites.includes(student._id)) {
      return res.status(400).json({ success: false, message: 'No pending invitation for this group' });
    }

    if (group.members.length >= 4) {
      return res.status(400).json({ success: false, message: 'Group is now full' });
    }

    // Join
    group.members.push(student._id);
    group.pendingInvites = group.pendingInvites.filter((id) => !id.equals(student._id));
    await group.save();

    student.groupId = group._id;
    await student.save();

    // Clean invitations from other groups
    await Group.updateMany(
      { pendingInvites: student._id },
      { $pull: { pendingInvites: student._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// Reject Invite
exports.rejectInvite = async (req, res, next) => {
  const { groupId } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    group.pendingInvites = group.pendingInvites.filter((id) => !id.equals(student._id));
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Invitation rejected successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Leave Group
exports.leaveGroup = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || !student.groupId) {
      return res.status(400).json({ success: false, message: 'You are not in a group' });
    }

    const group = await Group.findById(student.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Remove member
    group.members = group.members.filter((id) => !id.equals(student._id));

    student.groupId = null;
    await student.save();

    if (group.members.length === 0) {
      // Delete empty group and project if exists
      if (group.projectId) {
        await Project.findByIdAndDelete(group.projectId);
      }
      await Group.findByIdAndDelete(group._id);
    } else {
      // If student was leader, promote next member
      if (group.leader.equals(student._id)) {
        group.leader = group.members[0];
      }
      await group.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get My Group Details
exports.getMyGroup = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (!student.groupId) {
      // Check invitations
      const invites = await Group.find({ pendingInvites: student._id })
        .populate('leader', 'name rollNumber email')
        .populate('departmentId', 'name code');
      return res.status(200).json({ success: true, inGroup: false, invitations: invites });
    }

    const group = await Group.findById(student.groupId)
      .populate('members', 'name rollNumber email mobile division batch')
      .populate('leader', 'name rollNumber email')
      .populate('departmentId', 'name code')
      .populate('guideId', 'name email designation mobile specialization')
      .populate('projectId');

    res.status(200).json({
      success: true,
      inGroup: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};
