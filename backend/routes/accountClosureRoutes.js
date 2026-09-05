const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  submitClosureRequest,
  getClosureRequests,
  getClosureById,
  processClosureRequest,
  getMemberClosureFinancials,
  getClosureStats,
} = require('../controllers/accountClosureController');

const router = express.Router();

router.use(protect);

router.get('/stats', getClosureStats);
router.get('/member-financials/:memberId', getMemberClosureFinancials);

router.route('/')
  .get(getClosureRequests)
  .post(submitClosureRequest);

router.route('/:id')
  .get(getClosureById);

router.put('/:id/process', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer'), processClosureRequest);

module.exports = router;
