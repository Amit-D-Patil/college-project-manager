const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforcollegeerpsystem12345', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Login user
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    // Generate Token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
        isPasswordTemp: user.isPasswordTemp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged in user profile
exports.getProfile = async (req, res, next) => {
  try {
    let profileData = null;

    if (req.user.currentRole === 'student') {
      profileData = await Student.findOne({ userId: req.user._id })
        .populate('departmentId', 'name code')
        .populate('academicYearId', 'name')
        .populate({
          path: 'groupId',
          populate: [
            { path: 'members', select: 'name rollNumber email mobile' },
            { path: 'guideId', select: 'name designation email specialization' },
            { path: 'projectId' },
          ],
        });
    } else if (req.user.currentRole !== 'admin') {
      // Faculty (Guide, Coordinator, HOD, Principal)
      profileData = await Faculty.findOne({ userId: req.user._id }).populate('departmentId', 'name code');
    }

    res.status(200).json({
      success: true,
      user: req.user,
      profile: profileData,
    });
  } catch (error) {
    next(error);
  }
};

// Update profile details
exports.updateProfile = async (req, res, next) => {
  const { mobile, specialization, name } = req.body;

  try {
    if (req.user.currentRole === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        if (mobile) student.mobile = mobile;
        if (name) student.name = name;
        await student.save();
      }
    } else if (req.user.currentRole !== 'admin') {
      const faculty = await Faculty.findOne({ userId: req.user._id });
      if (faculty) {
        if (mobile) faculty.mobile = mobile;
        if (name) faculty.name = name;
        if (specialization) faculty.specialization = specialization;
        await faculty.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    user.isPasswordTemp = false; // Mark temp password as changed
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Switch active role
exports.switchRole = async (req, res, next) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user.roles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Role not assigned to this user' });
    }

    user.currentRole = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Role switched to ${role} successfully`,
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
        isPasswordTemp: user.isPasswordTemp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password (stub for ERP)
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }
    // In production, send reset email. For ERP, return success code with a mock instructions.
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to registered email. For development: Please contact administrator.',
    });
  } catch (error) {
    next(error);
  }
};
