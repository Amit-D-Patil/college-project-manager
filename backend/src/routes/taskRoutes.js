const express = require('express');
const router = express.Router();
const { assignTask, getGroupTasks, updateTaskProgress, reviewTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('guide'), upload.single('attachment'), assignTask);
router.get('/group/:groupId', protect, getGroupTasks);
router.put('/:id/progress', protect, authorize('student'), upload.single('deliverable'), updateTaskProgress);
router.put('/:id/review', protect, authorize('guide'), reviewTask);

module.exports = router;
