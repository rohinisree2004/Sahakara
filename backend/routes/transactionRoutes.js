const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllTransactions,
  getTransactionDetails,
  reverseTransaction
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('Super Admin', 'Org Admin', 'Branch Manager', 'Treasurer', 'Accountant', 'Clerk', 'Agent'), getAllTransactions);

router.route('/dashboard')
  .get(authorize('Super Admin', 'Org Admin', 'Branch Manager', 'Treasurer', 'Accountant'), getDashboardStats);

router.route('/:id')
  .get(authorize('Super Admin', 'Org Admin', 'Branch Manager', 'Treasurer', 'Accountant', 'Clerk', 'Agent'), getTransactionDetails);

router.route('/:id/reverse')
  .post(authorize('Super Admin', 'Org Admin', 'Treasurer'), reverseTransaction);

module.exports = router;
