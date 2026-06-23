const express = require('express');
const router = express.Router();
const { addEvaluation, getGroupEvaluation } = require('../controllers/evaluationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('guide', 'coordinator'), addEvaluation);
router.get('/group/:groupId', protect, getGroupEvaluation);

module.exports = router;
