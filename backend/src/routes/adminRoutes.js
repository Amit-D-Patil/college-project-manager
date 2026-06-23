const express = require('express');
const router = express.Router();
const {
  importStudents,
  importFaculty,
  createDepartment,
  getDepartments,
  createAcademicYear,
  getAcademicYears,
  getUsers,
  updateUserStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Bulk imports (Coordinators or Admin)
router.post('/import-students', protect, authorize('admin', 'coordinator'), upload.single('file'), importStudents);
router.post('/import-faculty', protect, authorize('admin', 'coordinator'), upload.single('file'), importFaculty);

// Department setup
router.post('/departments', protect, authorize('admin'), createDepartment);
router.get('/departments', protect, getDepartments);

// Academic year setup
router.post('/academic-years', protect, authorize('admin'), createAcademicYear);
router.get('/academic-years', protect, getAcademicYears);

// Users lists
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;
