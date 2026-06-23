const express = require('express');
const router = express.Router();
const { addReview, getGroupReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('guide', 'coordinator'), addReview);
router.get('/group/:groupId', protect, getGroupReviews);

module.exports = router;
