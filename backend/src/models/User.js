const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      required: true,
      enum: ['student', 'guide', 'coordinator', 'hod', 'principal', 'admin'],
      default: ['student'],
    },
    currentRole: {
      type: String,
      required: true,
      enum: ['student', 'guide', 'coordinator', 'hod', 'principal', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    facultyProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    isPasswordTemp: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
