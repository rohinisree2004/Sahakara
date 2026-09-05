const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  transferComplaint,
  escalateComplaint,
  addInternalNote,
  resolveComplaint,
  getComplaintStats,
} = require('../controllers/complaintController');

const router = express.Router();

router.use(protect);

router.get('/stats', getComplaintStats);
router.route('/')
  .get(getComplaints)
  .post(createComplaint);

router.route('/:id')
  .get(getComplaintById);

router.put('/:id/transfer', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer'), transferComplaint);
router.put('/:id/escalate', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer'), escalateComplaint);
router.post('/:id/notes', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer', 'Employee'), addInternalNote);
router.put('/:id/resolve', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer'), resolveComplaint);

module.exports = router;
