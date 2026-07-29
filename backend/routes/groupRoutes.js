const express = require('express');
const router = express.Router();
const {
  getGroupDashboard,
  getGroupsList,
  createGroup,
  getGroupProfile,
  updateGroup,
  assignGroupLeader,
  addGroupMembers,
  removeGroupMember,
  transferGroupMember,
  toggleGroupStatus,
  softDeleteGroup,
  getGroupReports,
  getGroupActivityLogs,
} = require('../controllers/groupController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all Group Management routes
router.use(protect);
router.use(authorize('Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee'));

router.get('/dashboard', getGroupDashboard);
router.get('/reports', getGroupReports);
router.get('/logs', getGroupActivityLogs);
router.post('/transfer-member', transferGroupMember);
router.get('/', getGroupsList);
router.post('/', createGroup);
router.get('/:id', getGroupProfile);
router.put('/:id', updateGroup);
router.put('/:id/leader', assignGroupLeader);
router.post('/:id/members', addGroupMembers);
router.delete('/:id/members/:memberId', removeGroupMember);
router.put('/:id/status', toggleGroupStatus);
router.delete('/:id', softDeleteGroup);

module.exports = router;
