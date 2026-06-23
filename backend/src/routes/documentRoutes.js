const express = require('express');
const router = express.Router();
const { uploadDocument, getGroupDocuments, updateDocumentStatus } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, authorize('student'), upload.single('file'), uploadDocument);
router.get('/group/:groupId', protect, getGroupDocuments);
router.put('/:id/status', protect, authorize('guide'), updateDocumentStatus);

module.exports = router;
