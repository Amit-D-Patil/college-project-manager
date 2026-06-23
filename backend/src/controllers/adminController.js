const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const AcademicYear = require('../models/AcademicYear');

// Bulk Import Students from Excel
exports.importStudents = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    // Build header map from first row
    const headerRow = worksheet.getRow(1).values.slice(1);
    const headers = headerRow.map((h) => (h === null || h === undefined) ? '' : String(h).trim());

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const obj = {};
      headers.forEach((h, idx) => {
        const cell = row.getCell(idx + 1).value;
        obj[h] = cell && typeof cell === 'object' && cell.text ? cell.text : (cell !== undefined ? cell : '');
      });
      rows.push(obj);
    });

    // Clean up local file after reading
    fs.unlinkSync(filePath);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const results = {
      total: rows.length,
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    // Get active academic year
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear) {
      return res.status(400).json({ success: false, message: 'No active academic year found. Please configure one first.' });
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rollNumber = row['Roll Number'] || row['rollNumber'];
      const enrollmentNumber = row['Enrollment Number'] || row['enrollmentNumber'];
      const name = row['Student Name'] || row['name'];
      const division = row['Division'] || row['division'];
      const batch = row['Batch'] || row['batch'];
      const email = row['Email'] || row['email'];
      const mobile = row['Mobile Number'] || row['mobile'];
      const deptCode = row['Department Code'] || row['deptCode'];

      if (!rollNumber || !enrollmentNumber || !name || !division || !batch || !email || !mobile || !deptCode) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Missing required student fields`);
        continue;
      }

      // Check department
      const department = await Department.findOne({ code: deptCode.toUpperCase() });
      if (!department) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Department code '${deptCode}' not found`);
        continue;
      }

      // Check duplicates
      const emailExists = await User.findOne({ email });
      const rollExists = await Student.findOne({ rollNumber });
      const enrollExists = await Student.findOne({ enrollmentNumber });

      if (emailExists || rollExists || enrollExists) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Duplicate Student (Email/Roll No/Enrollment No already exists)`);
        continue;
      }

      try {
        // Generate temporary password: e.g. Temp@RollNumber
        const tempPassword = `Temp@${rollNumber}`;

        // Create User
        const newUser = await User.create({
          email: email.toLowerCase(),
          password: tempPassword,
          roles: ['student'],
          currentRole: 'student',
          isPasswordTemp: true,
        });

        // Create Student Profile
        const student = await Student.create({
          rollNumber,
          enrollmentNumber,
          name,
          division,
          batch,
          email: email.toLowerCase(),
          mobile: String(mobile),
          departmentId: department._id,
          academicYearId: activeYear._id,
          userId: newUser._id,
        });

        // Associate Profile with User
        newUser.studentProfile = student._id;
        await newUser.save();

        results.successCount++;
      } catch (err) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Database error - ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Import processed. Success: ${results.successCount}, Failed: ${results.failedCount}`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk Import Faculty from Excel
exports.importFaculty = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const headerRow = worksheet.getRow(1).values.slice(1);
    const headers = headerRow.map((h) => (h === null || h === undefined) ? '' : String(h).trim());

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const obj = {};
      headers.forEach((h, idx) => {
        const cell = row.getCell(idx + 1).value;
        obj[h] = cell && typeof cell === 'object' && cell.text ? cell.text : (cell !== undefined ? cell : '');
      });
      rows.push(obj);
    });

    // Clean up local file
    fs.unlinkSync(filePath);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const results = {
      total: rows.length,
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row['Faculty Name'] || row['name'];
      const deptCode = row['Department Code'] || row['deptCode'];
      const designation = row['Designation'] || row['designation'];
      const email = row['Email'] || row['email'];
      const mobile = row['Mobile Number'] || row['mobile'];
      const specializationStr = row['Specialization'] || row['specialization'] || '';
      const rolesStr = row['Roles'] || row['roles'] || 'guide';

      if (!name || !deptCode || !designation || !email || !mobile) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Missing required faculty fields`);
        continue;
      }

      // Check department
      const department = await Department.findOne({ code: deptCode.toUpperCase() });
      if (!department) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Department code '${deptCode}' not found`);
        continue;
      }

      // Check duplicates
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Faculty email '${email}' already has an account`);
        continue;
      }

      try {
        // Parse Specialization (comma separated)
        const specialization = specializationStr
          ? specializationStr.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        // Parse Roles (comma separated, e.g. "guide,coordinator")
        const rolesList = rolesStr
          ? rolesStr.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean)
          : ['guide'];

        // Validate Roles
        const validRoles = ['guide', 'coordinator', 'hod', 'principal'];
        const roles = rolesList.filter((r) => validRoles.includes(r));
        if (roles.length === 0) {
          roles.push('guide');
        }

        // Temporary password
        const tempPassword = 'Welcome@Faculty';

        // Create User account (First role in roles array becomes currentRole)
        const newUser = await User.create({
          email: email.toLowerCase(),
          password: tempPassword,
          roles: roles,
          currentRole: roles[0],
          isPasswordTemp: true,
        });

        // Create Faculty Profile
        const faculty = await Faculty.create({
          name,
          departmentId: department._id,
          designation,
          email: email.toLowerCase(),
          mobile: String(mobile),
          specialization,
          roles,
          userId: newUser._id,
        });

        // Associate Profile with User
        newUser.facultyProfile = faculty._id;
        await newUser.save();

        results.successCount++;
      } catch (err) {
        results.failedCount++;
        results.errors.push(`Row ${i + 2}: Database error - ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Import processed. Success: ${results.successCount}, Failed: ${results.failedCount}`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// Create Department
exports.createDepartment = async (req, res, next) => {
  const { name, code } = req.body;
  try {
    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department code already exists' });
    }
    const dept = await Department.create({ name, code: code.toUpperCase() });
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
};

// Get all Departments
exports.getDepartments = async (req, res, next) => {
  try {
    const depts = await Department.find();
    res.status(200).json({ success: true, data: depts });
  } catch (error) {
    next(error);
  }
};

// Create Academic Year
exports.createAcademicYear = async (req, res, next) => {
  const { name, isActive } = req.body;
  try {
    if (isActive) {
      // Set all other years to inactive
      await AcademicYear.updateMany({}, { isActive: false });
    }
    const year = await AcademicYear.create({ name, isActive });
    res.status(201).json({ success: true, data: year });
  } catch (error) {
    next(error);
  }
};

// Get all Academic Years
exports.getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.find();
    res.status(200).json({ success: true, data: years });
  } catch (error) {
    next(error);
  }
};

// Get all Users (Admin list)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password')
      .populate('studentProfile')
      .populate('facultyProfile');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.status = status;
    await user.save();
    res.status(200).json({ success: true, message: `User account is now ${status}` });
  } catch (error) {
    next(error);
  }
};
