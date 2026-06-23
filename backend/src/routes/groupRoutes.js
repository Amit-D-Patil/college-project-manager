const express = require('express');
const router = express.Router();
const {
  createGroup,
  joinGroup,
  inviteMember,
  acceptInvite,
  rejectInvite,
  leaveGroup,
  getMyGroup,
} = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create', protect, authorize('student'), createGroup);
router.post('/join', protect, authorize('student'), joinGroup);
router.post('/invite', protect, authorize('student'), inviteMember);
router.post('/accept', protect, authorize('student'), acceptInvite);
router.post('/reject', protect, authorize('student'), rejectInvite);
router.post('/leave', protect, authorize('student'), leaveGroup);
router.get('/my-group', protect, getMyGroup);

module.exports = router;
