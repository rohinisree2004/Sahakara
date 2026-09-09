const express = require('express');
const router = express.Router();
const {
  getGroupDashboard,
  getGroupsList,
  getMyGroups,
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

// 1. Read-Only Group Endpoints accessible to Members & All Roles
router.get('/dashboard', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'Employee', 'President', 'Secretary', 'Treasurer'), getGroupDashboard);
router.get('/my-groups', getMyGroups);
router.get('/reports', getGroupReports);
router.get('/logs', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'Employee', 'President', 'Secretary', 'Treasurer'), getGroupActivityLogs);
router.get('/', getGroupsList);
router.get('/:id', getGroupProfile);

// 2. Group Administrative Management (Super Admin, Organization Admin, Branch Manager)
router.post('/', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'Employee'), createGroup);
router.put('/:id', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager'), updateGroup);
router.put('/:id/leader', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager'), assignGroupLeader);
router.put('/:id/executives', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager'), assignGroupLeader);
router.put('/:id/status', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager'), toggleGroupStatus);
router.delete('/:id', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager'), softDeleteGroup);
router.post('/transfer-member', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager'), transferGroupMember);

// 3. Member Roster Management (Staff & Group President only; Forbidden for regular Member, Secretary, Treasurer)
router.post('/:id/members', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'President'), addGroupMembers);
router.delete('/:id/members/:memberId', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'President'), removeGroupMember);

module.exports = router;
