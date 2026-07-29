const express = require('express');
const router = express.Router();
const {
  getMemberDashboard,
  getMembersList,
  registerMember,
  getMemberProfile,
  updateMember,
  approveMember,
  rejectMember,
  verifyMemberKYC,
  toggleMemberStatus,
  softDeleteMember,
  getMemberReports,
  getMemberActivityLogs,
} = require('../controllers/memberController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');

// Protect all Member Management routes
router.use(protect);
router.use(authorize('Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee'));

router.get('/dashboard', getMemberDashboard);
router.get('/reports', getMemberReports);
router.get('/logs', getMemberActivityLogs);
router.get('/', getMembersList);
router.post(
  '/',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhaarFile', maxCount: 1 },
    { name: 'panFile', maxCount: 1 },
  ]),
  registerMember
);
router.get('/:id', getMemberProfile);
router.put('/:id', updateMember);
router.put('/:id/approve', approveMember);
router.put('/:id/reject', rejectMember);
router.put('/:id/verify-kyc', verifyMemberKYC);
router.put('/:id/status', toggleMemberStatus);
router.delete('/:id', softDeleteMember);

module.exports = router;
