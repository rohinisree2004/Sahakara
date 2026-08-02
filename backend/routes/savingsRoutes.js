const express = require('express');
const router = express.Router();
const {
  getSavingsDashboardStats,
  createSavingsAccount,
  getSavingsAccounts,
  getSavingsAccountById,
  recordDeposit,
  getSavingsTransactions,
  getPassbook
} = require('../controllers/savingsController');
const { protect } = require('../middleware/authMiddleware');

// Check Permissions Middleware placeholder - if project has a specific permission middleware, it can be applied here
// Example: const { checkPermission } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Dashboard
router.route('/dashboard')
  .get(getSavingsDashboardStats);

// Accounts
router.route('/accounts')
  .get(getSavingsAccounts)
  .post(createSavingsAccount);

router.route('/accounts/:id')
  .get(getSavingsAccountById);

// Deposits
router.route('/deposit')
  .post(recordDeposit);

// Transactions
router.route('/transactions')
  .get(getSavingsTransactions);

// Passbook
router.route('/passbook/:accountId')
  .get(getPassbook);

module.exports = router;
