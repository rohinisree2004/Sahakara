const express = require('express');
const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerUpload');
const loanController = require('../controllers/loanController');

const router = express.Router();

// ==============================
// LOAN TYPES ROUTES
// ==============================
router.route('/types')
  .post(
    protect, 
    checkPermission('Loan Management', 'create'), 
    loanController.createLoanType
  )
  .get(
    protect, 
    checkPermission('Loan Management', 'read'), 
    loanController.getLoanTypes
  );

// ==============================
// LOAN ELIGIBILITY & STATS
// ==============================
router.post('/eligibility', protect, loanController.checkLoanEligibility);
router.get('/dashboard', protect, checkPermission('Loan Management', 'read'), loanController.getDashboardStats);

// ==============================
// LOAN APPLICATION ROUTES
// ==============================
router.post('/apply', protect, checkPermission('Loan Management', 'create'), loanController.applyForLoan);

router.route('/')
  .post(
    protect, 
    checkPermission('Loan Management', 'create'), 
    loanController.applyForLoan
  )
  .get(
    protect, 
    checkPermission('Loan Management', 'read'), 
    loanController.getLoans
  );

router.route('/:id')
  .get(
    protect, 
    checkPermission('Loan Management', 'read'), 
    loanController.getLoanById
  );

// ==============================
// LOAN REVIEW, APPROVAL, DISBURSE
// ==============================
router.route('/:id/review')
  .post(protect, checkPermission('Loan Management', 'update'), loanController.reviewLoan)
  .put(protect, checkPermission('Loan Management', 'update'), loanController.reviewLoan);

router.route('/:id/approve')
  .post(protect, checkPermission('Loan Management', 'approve'), loanController.approveLoan)
  .put(protect, checkPermission('Loan Management', 'approve'), loanController.approveLoan);

router.route('/:id/reject')
  .post(protect, checkPermission('Loan Management', 'approve'), loanController.rejectLoan)
  .put(protect, checkPermission('Loan Management', 'approve'), loanController.rejectLoan);

router.route('/:id/disburse')
  .post(protect, checkPermission('Loan Management', 'update'), loanController.disburseLoan)
  .put(protect, checkPermission('Loan Management', 'update'), loanController.disburseLoan);

// ==============================
// LOAN CIBIL & RESUBMISSION
// ==============================
router.get('/:id/cibil', protect, loanController.getCibilReport);
router.put('/:id/resubmit', protect, loanController.resubmitLoan);

// ==============================
// LOAN DOCUMENTS UPLOAD (LOCAL STORAGE)
// ==============================
router.post('/:id/documents', 
  protect, 
  checkPermission('Loan Management', 'upload'),
  upload.single('document'), 
  loanController.uploadDocument
);

module.exports = router;
