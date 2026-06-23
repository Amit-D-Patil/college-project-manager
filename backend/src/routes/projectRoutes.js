const express = require('express');
const router = express.Router();
const {
  registerProject,
  getMyProject,
  getSuggestions,
  getAllProjects,
  updateProjectStatus,
  submitFinalProject,
  approveFinalByGuide,
  approveFinalByCoordinator,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Student project registration & suggestions
router.post('/register', protect, authorize('student'), registerProject);
router.get('/my-project', protect, getMyProject);
router.get('/suggestions', protect, authorize('student'), getSuggestions);

// Management routes
router.get('/all', protect, getAllProjects);
router.put('/:id/status', protect, authorize('coordinator', 'hod'), updateProjectStatus);

// Final submission routes (handles multi-field file uploads)
router.post(
  '/submit-final',
  protect,
  authorize('student'),
  upload.fields([
    { name: 'report', maxCount: 1 },
    { name: 'sourceCode', maxCount: 1 },
    { name: 'researchPaper', maxCount: 1 },
    { name: 'presentation', maxCount: 1 },
  ]),
  submitFinalProject
);

// Review final submissions
router.put('/:id/final-approve-guide', protect, authorize('guide'), approveFinalByGuide);
router.put('/:id/final-approve-coordinator', protect, authorize('coordinator'), approveFinalByCoordinator);

module.exports = router;
