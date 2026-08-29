const express = require('express');
const {
  generateSchedule,
  getSchedule,
  recordRepayment,
  deductEmiFromSavings,
  getUpcomingEMIs,
  getOverdueEMIs,
  getRepaymentTransactions,
  closeLoan,
  getRepaymentDashboard
} = require('../controllers/repaymentController');

const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Dashboard & Lists
router.get('/dashboard', checkPermission('Loans', 'read'), getRepaymentDashboard);
router.get('/upcoming', checkPermission('Loans', 'read'), getUpcomingEMIs);
router.get('/overdue', checkPermission('Loans', 'read'), getOverdueEMIs);
router.get('/transactions', checkPermission('Loans', 'read'), getRepaymentTransactions);

// Loan specific routes
router.post('/:loanId/generate-schedule', checkPermission('Loans', 'create'), generateSchedule);
router.get('/loan/:loanId', checkPermission('Loans', 'read'), getSchedule);
router.post('/:loanId/close', checkPermission('Loans', 'update'), closeLoan);

// General repayment & Savings Auto-Debit
router.post('/', checkPermission('Loans', 'create'), recordRepayment);
router.post('/deduct-from-savings', checkPermission('Loans', 'update'), deductEmiFromSavings);

module.exports = router;
