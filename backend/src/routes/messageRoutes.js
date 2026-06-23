const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('attachment'), sendMessage);
router.get('/', protect, getMessages);
router.get('/conversations', protect, getConversations);

module.exports = router;
