const express = require('express');
const router = express.Router();
const { exportExcelReport, exportPDFReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/excel', protect, authorize('coordinator', 'hod', 'principal', 'admin'), exportExcelReport);
router.get('/pdf', protect, authorize('coordinator', 'hod', 'principal', 'admin'), exportPDFReport);

module.exports = router;
