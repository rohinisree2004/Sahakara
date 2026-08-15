const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getChartOfAccounts,
  getTrialBalance,
  getJournalEntries
} = require('../controllers/accountingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getDashboardStats);
router.get('/accounts', authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getChartOfAccounts);
router.get('/trial-balance', authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getTrialBalance);
router.get('/journals', authorize('Super Admin', 'Organization Admin', 'Treasurer', 'President', 'Branch Manager'), getJournalEntries);

module.exports = router;
