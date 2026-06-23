const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getMyNotifications, markNotificationsRead } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;
