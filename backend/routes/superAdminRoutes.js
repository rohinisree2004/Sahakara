const express = require('express');
const router = express.Router();
const {
  getSuperAdminDashboard,
  getPendingApprovals,
  approveOrganization,
  rejectOrganization,
  getAllOrganizations,
  getOrganizationDetails,
  updateOrganizationStatus,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
} = require('../controllers/superAdminController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All Super Admin routes are strictly protected by RBAC
router.use(protect);
router.use(authorize('Super Admin'));

router.get('/dashboard', getSuperAdminDashboard);
router.get('/approvals', getPendingApprovals);
router.post('/approvals/:id/approve', approveOrganization);
router.post('/approvals/:id/reject', rejectOrganization);
router.get('/organizations', getAllOrganizations);
router.get('/organizations/:id', getOrganizationDetails);
router.put('/organizations/:id/status', updateOrganizationStatus);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
