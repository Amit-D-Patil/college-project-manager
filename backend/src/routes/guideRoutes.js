const express = require('express');
const router = express.Router();
const { getGuidesWorkload, allocateGuideManual, allocateGuidesAuto } = require('../controllers/guideController');
const { protect, authorize } = require('../middleware/auth');

router.get('/workload', protect, authorize('coordinator', 'hod', 'principal'), getGuidesWorkload);
router.post('/allocate/manual', protect, authorize('coordinator'), allocateGuideManual);
router.post('/allocate/auto', protect, authorize('coordinator'), allocateGuidesAuto);

module.exports = router;
