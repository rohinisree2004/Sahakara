const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getChartOfAccounts,
  createAccount,
  getTrialBalance,
  getJournalEntries,
  createJournalEntry,
  getGeneralLedger
} = require('../controllers/accountingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getDashboardStats);
router.route('/accounts')
  .get(authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getChartOfAccounts)
  .post(authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President'), createAccount);

router.get('/trial-balance', authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getTrialBalance);

router.route('/journals')
  .get(authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getJournalEntries)
  .post(authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President'), createJournalEntry);

router.get('/general-ledger', authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getGeneralLedger);

module.exports = router;
