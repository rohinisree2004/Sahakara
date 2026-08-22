const express = require('express');
const router = express.Router();
const {
  getSavingsDashboardStats,
  createSavingsAccount,
  getSavingsAccounts,
  getSavingsAccountById,
  recordDeposit,
  getSavingsTransactions,
  getPassbook,
  submitDepositRequest,
  submitWithdrawalRequest,
  getPendingSavingsRequests,
  approveSavingsRequest,
  rejectSavingsRequest,
  rollbackSavingsTransaction
} = require('../controllers/savingsController');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Dashboard
router.route('/dashboard')
  .get(getSavingsDashboardStats);

// Member Self-Service Requests & Approval Queues
router.route('/deposit-request')
  .post(submitDepositRequest);

router.route('/withdrawal-request')
  .post(submitWithdrawalRequest);

router.route('/pending-requests')
  .get(getPendingSavingsRequests);

router.route('/requests/:id/approve')
  .put(approveSavingsRequest);

router.route('/requests/:id/reject')
  .put(rejectSavingsRequest);

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

router.route('/transactions/:id/rollback')
  .post(rollbackSavingsTransaction);

// Passbook
router.route('/passbook/:accountId')
  .get(getPassbook);

module.exports = router;
