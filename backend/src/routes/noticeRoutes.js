const express = require('express');
const router = express.Router();
const { createNotice, getNotices, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getNotices);
router.post('/', protect, authorize('coordinator', 'hod', 'principal'), upload.single('attachment'), createNotice);
router.put('/:id', protect, authorize('coordinator', 'hod', 'principal'), upload.single('attachment'), updateNotice);
router.delete('/:id', protect, authorize('coordinator', 'hod', 'principal'), deleteNotice);

module.exports = router;
