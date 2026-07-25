const express = require('express');
const router = express.Router();
const {
  getOrgDashboard,
  getOrgProfile,
  updateOrgProfile,
  getOrgBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getOrgSettings,
  updateOrgSettings,
  getOrgEmployees,
  getOrgActivityLogs,
  getOrgStatistics,
} = require('../controllers/orgController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');

// Protect all organization management routes
router.use(protect);
router.use(authorize('Organization Admin', 'Super Admin', 'President', 'Secretary', 'Treasurer'));

router.get('/my-org/dashboard', getOrgDashboard);
router.get('/my-org/profile', getOrgProfile);
router.put(
  '/my-org/profile',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
  ]),
  updateOrgProfile
);

router.get('/my-org/branches', getOrgBranches);
router.post('/my-org/branches', createBranch);
router.put('/my-org/branches/:id', updateBranch);
router.delete('/my-org/branches/:id', deleteBranch);

router.get('/my-org/settings', getOrgSettings);
router.put('/my-org/settings', updateOrgSettings);

router.get('/my-org/employees', getOrgEmployees);
router.get('/my-org/logs', getOrgActivityLogs);
router.get('/my-org/stats', getOrgStatistics);

module.exports = router;
