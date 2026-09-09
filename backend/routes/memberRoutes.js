const express = require('express');
const router = express.Router();
const {
  getMemberDashboard,
  getMembersList,
  getMyProfile,
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

// 1. Read Routes
router.get('/dashboard', authorize('Super Admin', 'Organization Admin', 'Branch Manager', 'Employee', 'President', 'Secretary', 'Treasurer'), getMemberDashboard);
router.get('/me', getMyProfile);
router.get('/reports', getMemberReports);
router.get('/logs', authorize('Super Admin', 'Organization Admin', 'Branch Manager', 'Employee'), getMemberActivityLogs);
router.get('/', getMembersList);
router.get('/:id', getMemberProfile);

// 2. Member Enrollment & Roster Management (Staff & President)
router.post(
  '/',
  authorize('Super Admin', 'Organization Admin', 'Branch Manager', 'Employee', 'President'),
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhaarFile', maxCount: 1 },
    { name: 'panFile', maxCount: 1 },
  ]),
  registerMember
);
router.put('/:id', authorize('Super Admin', 'Organization Admin', 'Branch Manager', 'Employee', 'President'), updateMember);
router.delete('/:id', authorize('Super Admin', 'Organization Admin', 'Branch Manager', 'Employee', 'President'), softDeleteMember);

// 3. Administrative Approvals & KYC (Staff only)
router.put('/:id/approve', authorize('Super Admin', 'Organization Admin', 'Branch Manager'), approveMember);
router.put('/:id/reject', authorize('Super Admin', 'Organization Admin', 'Branch Manager'), rejectMember);
router.put('/:id/verify-kyc', authorize('Super Admin', 'Organization Admin', 'Branch Manager', 'Employee'), verifyMemberKYC);
router.put('/:id/status', authorize('Super Admin', 'Organization Admin', 'Branch Manager'), toggleMemberStatus);

module.exports = router;
