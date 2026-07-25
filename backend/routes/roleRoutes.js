const express = require('express');
const router = express.Router();
const {
  getRolesDashboard,
  getRolesList,
  createRole,
  getRoleDetails,
  updateRole,
  cloneRole,
  assignRoleToUser,
  getUserAccessReview,
  toggleRoleStatus,
  deleteRole,
  getRoleActivityLogs,
} = require('../controllers/roleController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all Role & Permission routes
router.use(protect);
router.use(authorize('Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer'));

router.get('/dashboard', getRolesDashboard);
router.get('/logs', getRoleActivityLogs);
router.get('/user-access-review/:userId', getUserAccessReview);
router.get('/', getRolesList);
router.post('/', createRole);
router.get('/:id', getRoleDetails);
router.put('/:id', updateRole);
router.post('/:id/clone', cloneRole);
router.put('/assign-user', assignRoleToUser);
router.put('/:id/status', toggleRoleStatus);
router.delete('/:id', deleteRole);

module.exports = router;
