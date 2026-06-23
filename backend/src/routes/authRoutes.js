const express = require('express');
const router = express.Router();
const { login, getProfile, updateProfile, forgotPassword, changePassword, switchRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/switch-role', protect, switchRole);

module.exports = router;
