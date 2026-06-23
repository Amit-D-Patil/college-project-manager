const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Department = require('../models/Department');
const AcademicYear = require('../models/AcademicYear');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Group = require('../models/Group');
const Project = require('../models/Project');
const Notice = require('../models/Notice');
const Task = require('../models/Task');
const Document = require('../models/Document');
const Review = require('../models/Review');
const Evaluation = require('../models/Evaluation');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');

require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing database...');
    await Department.deleteMany({});
    await AcademicYear.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Group.deleteMany({});
    await Project.deleteMany({});
    await Notice.deleteMany({});
    await Task.deleteMany({});
    await Document.deleteMany({});
    await Review.deleteMany({});
    await Evaluation.deleteMany({});
    await Notification.deleteMany({});
    await Message.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Database cleared.');

    // 1. Create Departments
    console.log('Creating Departments...');
    const deptCS = await Department.create({ name: 'Computer Engineering', code: 'CS' });
    const deptIT = await Department.create({ name: 'Information Technology', code: 'IT' });
    const deptEXTC = await Department.create({ name: 'Electronics and Telecommunication', code: 'EXTC' });
    console.log('Departments created.');

    // 2. Create Academic Year
    console.log('Creating Academic Year...');
    const academicYear = await AcademicYear.create({ name: '2025-2026', isActive: true });
    console.log('Academic Year created.');

    // 3. Create Admin User
    console.log('Creating Admin Account...');
    await User.create({
      email: 'admin@college.edu',
      password: 'Admin@123',
      roles: ['admin'],
      currentRole: 'admin',
      isPasswordTemp: false,
    });
    console.log('Admin Account created (admin@college.edu / Admin@123).');

    // 4. Create Faculty Accounts
    console.log('Creating Faculty Accounts...');
    
    // Principal (Principal + Guide)
    const principalUser = await User.create({
      email: 'principal@college.edu',
      password: 'Welcome@123',
      roles: ['principal', 'guide'],
      currentRole: 'principal',
      isPasswordTemp: false,
    });
    const principalFaculty = await Faculty.create({
      name: 'Dr. Ramesh Mehta',
      departmentId: deptCS._id,
      designation: 'Principal & Professor',
      email: 'principal@college.edu',
      mobile: '9876543210',
      specialization: ['Cloud Computing', 'Cyber Security'],
      roles: ['principal', 'guide'],
      userId: principalUser._id,
    });
    principalUser.facultyProfile = principalFaculty._id;
    await principalUser.save();

    // HOD CS (HOD + Guide)
    const hodCSUser = await User.create({
      email: 'hod_cs@college.edu',
      password: 'Welcome@123',
      roles: ['hod', 'guide'],
      currentRole: 'hod',
      isPasswordTemp: false,
    });
    const hodCSFaculty = await Faculty.create({
      name: 'Dr. Sunita Sharma',
      departmentId: deptCS._id,
      designation: 'HOD & Professor',
      email: 'hod_cs@college.edu',
      mobile: '9876543211',
      specialization: ['Artificial Intelligence', 'Machine Learning'],
      roles: ['hod', 'guide'],
      userId: hodCSUser._id,
    });
    hodCSUser.facultyProfile = hodCSFaculty._id;
    await hodCSUser.save();

    // Coordinator CS (Coordinator + Guide)
    const coordCSUser = await User.create({
      email: 'coordinator_cs@college.edu',
      password: 'Welcome@123',
      roles: ['coordinator', 'guide'],
      currentRole: 'coordinator',
      isPasswordTemp: false,
    });
    const coordCSFaculty = await Faculty.create({
      name: 'Prof. Rajesh Kulkarni',
      departmentId: deptCS._id,
      designation: 'Assistant Professor',
      email: 'coordinator_cs@college.edu',
      mobile: '9876543212',
      specialization: ['Web Technologies', 'Blockchain'],
      roles: ['coordinator', 'guide'],
      userId: coordCSUser._id,
    });
    coordCSUser.facultyProfile = coordCSFaculty._id;
    await coordCSUser.save();

    // Faculty Guide 1
    const guide1User = await User.create({
      email: 'guide1@college.edu',
      password: 'Welcome@123',
      roles: ['guide'],
      currentRole: 'guide',
      isPasswordTemp: false,
    });
    const guide1Faculty = await Faculty.create({
      name: 'Prof. Amit Verma',
      departmentId: deptCS._id,
      designation: 'Associate Professor',
      email: 'guide1@college.edu',
      mobile: '9876543213',
      specialization: ['IoT', 'Robotics'],
      roles: ['guide'],
      userId: guide1User._id,
    });
    guide1User.facultyProfile = guide1Faculty._id;
    await guide1User.save();

    // Faculty Guide 2
    const guide2User = await User.create({
      email: 'guide2@college.edu',
      password: 'Welcome@123',
      roles: ['guide'],
      currentRole: 'guide',
      isPasswordTemp: false,
    });
    const guide2Faculty = await Faculty.create({
      name: 'Prof. Deepa Patil',
      departmentId: deptCS._id,
      designation: 'Assistant Professor',
      email: 'guide2@college.edu',
      mobile: '9876543214',
      specialization: ['Data Science', 'Machine Learning', 'Computer Vision'],
      roles: ['guide'],
      userId: guide2User._id,
    });
    guide2User.facultyProfile = guide2Faculty._id;
    await guide2User.save();

    console.log('Faculty Accounts created (passwords: Welcome@123).');

    // 5. Create Students, Group and Project (Pre-populated team in CS, Div A)
    console.log('Creating Sample Students...');
    const s1User = await User.create({
      email: 'student1@college.edu',
      password: 'Welcome@123',
      roles: ['student'],
      currentRole: 'student',
      isPasswordTemp: false,
    });
    const s2User = await User.create({
      email: 'student2@college.edu',
      password: 'Welcome@123',
      roles: ['student'],
      currentRole: 'student',
      isPasswordTemp: false,
    });
    const s3User = await User.create({
      email: 'student3@college.edu',
      password: 'Welcome@123',
      roles: ['student'],
      currentRole: 'student',
      isPasswordTemp: false,
    });

    const s1Student = await Student.create({
      rollNumber: 'CS2026A01',
      enrollmentNumber: 'EN22100401',
      name: 'Aarav Shah',
      division: 'A',
      batch: 'A1',
      email: 'student1@college.edu',
      mobile: '9123456780',
      departmentId: deptCS._id,
      academicYearId: academicYear._id,
      userId: s1User._id,
    });
    s1User.studentProfile = s1Student._id;
    await s1User.save();

    const s2Student = await Student.create({
      rollNumber: 'CS2026A02',
      enrollmentNumber: 'EN22100402',
      name: 'Diya Sharma',
      division: 'A',
      batch: 'A1',
      email: 'student2@college.edu',
      mobile: '9123456781',
      departmentId: deptCS._id,
      academicYearId: academicYear._id,
      userId: s2User._id,
    });
    s2User.studentProfile = s2Student._id;
    await s2User.save();

    const s3Student = await Student.create({
      rollNumber: 'CS2026A03',
      enrollmentNumber: 'EN22100403',
      name: 'Kabir Verma',
      division: 'A',
      batch: 'A1',
      email: 'student3@college.edu',
      mobile: '9123456782',
      departmentId: deptCS._id,
      academicYearId: academicYear._id,
      userId: s3User._id,
    });
    s3User.studentProfile = s3Student._id;
    await s3User.save();

    console.log('Sample Students created.');

    // 6. Create Group
    console.log('Creating Sample Group...');
    const newGroup = await Group.create({
      groupCode: 'G-101',
      departmentId: deptCS._id,
      academicYearId: academicYear._id,
      division: 'A',
      leader: s1Student._id,
      members: [s1Student._id, s2Student._id, s3Student._id],
      status: 'approved',
      guideId: hodCSFaculty._id, // Assign HOD as guide to this group
    });

    s1Student.groupId = newGroup._id;
    await s1Student.save();
    s2Student.groupId = newGroup._id;
    await s2Student.save();
    s3Student.groupId = newGroup._id;
    await s3Student.save();

    // Increment Guide Load
    hodCSFaculty.allocatedGroupsCount = 1;
    await hodCSFaculty.save();

    console.log('Group G-101 created and linked to Students.');

    // 7. Create Project
    console.log('Creating Sample Project...');
    const project = await Project.create({
      title: 'AI-Powered Smart Campus Navigation System',
      problemStatement: 'Students and visitors face difficulties navigating sprawling university campuses, resulting in delays and confusion.',
      objectives: 'To build a web-based interactive 3D map with navigation routes, live event locations, and administrative room locations using AI and AR/VR routing guides.',
      domain: 'Artificial Intelligence',
      technologies: ['React.js', 'Node.js', 'MongoDB', 'Three.js', 'A* Search Algorithm'],
      abstract: 'This project implements a web-based smart campus navigation system using a 3D interface powered by Three.js and a shortest path routing algorithm. The application allows users to query locations, find paths, and see real-time notices on the map.',
      expectedOutcome: 'A functional web application that reduces navigation time by 40% and integrates campus notice feeds on the main directory page.',
      preferences: ['Campus Navigation', 'Smart Parking', 'Student Query Bot'],
      groupId: newGroup._id,
      status: 'approved',
      comment: 'Excellent project scope and objectives. Recommended to begin literature review immediately.',
    });

    newGroup.projectId = project._id;
    await newGroup.save();
    console.log('Project created and linked to Group.');

    // 8. Create a Notice
    console.log('Creating Notices...');
    await Notice.create({
      title: 'Submission of Literature Review and Abstract',
      content: '<p>All final year groups must submit their Literature Review report and finalized abstract by next Friday. The submission links are open in your task panels.</p>',
      type: 'submission',
      targetAudience: 'students',
      authorId: coordCSUser._id,
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    });
    
    await Notice.create({
      title: 'Project Coordinator Review Meeting - Review 1',
      content: '<p>Review 1 evaluations will start on July 5th. All groups should prepare their presentations including problem identification and SRS documents.</p>',
      type: 'review',
      targetAudience: 'all',
      authorId: coordCSUser._id,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });
    console.log('Sample notices created.');

    console.log('Database Seeding Completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
