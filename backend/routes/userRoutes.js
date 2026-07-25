const express = require('express');
const router = express.Router();
const {
  getUserDashboard,
  getUsersList,
  createUser,
  getUserDetails,
  updateUser,
  transferUserBranch,
  resetUserPasswordByAdmin,
  toggleUserStatus,
  softDeleteUser,
  getUserReports,
  getUserActivityLogs,
} = require('../controllers/userManagementController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all user management routes
router.use(protect);
router.use(authorize('Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer'));

router.get('/dashboard', getUserDashboard);
router.get('/reports', getUserReports);
router.get('/logs', getUserActivityLogs);
router.get('/', getUsersList);
router.post('/', createUser);
router.get('/:id', getUserDetails);
router.put('/:id', updateUser);
router.put('/:id/transfer-branch', transferUserBranch);
router.put('/:id/reset-password', resetUserPasswordByAdmin);
router.put('/:id/status', toggleUserStatus);
router.delete('/:id', softDeleteUser);

module.exports = router;
