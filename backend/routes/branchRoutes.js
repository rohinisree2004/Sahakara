const express = require('express');
const router = express.Router();
const {
  getBranchDashboard,
  getBranchesList,
  createBranch,
  getBranchProfile,
  updateBranchProfile,
  assignBranchManager,
  getBranchEmployees,
  getBranchMembers,
  getBranchReports,
  getBranchActivityLogs,
  deleteBranch,
} = require('../controllers/branchController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all Branch Management routes
router.use(protect);
router.use(authorize('Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee'));

router.get('/dashboard', getBranchDashboard);
router.get('/', getBranchesList);
router.post('/', createBranch);
router.get('/:id', getBranchProfile);
router.put('/:id', updateBranchProfile);
router.put('/:id/manager', assignBranchManager);
router.get('/:id/employees', getBranchEmployees);
router.get('/:id/members', getBranchMembers);
router.get('/:id/reports', getBranchReports);
router.get('/:id/logs', getBranchActivityLogs);
router.delete('/:id', deleteBranch);

module.exports = router;
