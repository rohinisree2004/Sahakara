const Loan = require('../models/Loan');
const LoanRepaymentSchedule = require('../models/LoanRepaymentSchedule');
const LoanRepaymentTransaction = require('../models/LoanRepaymentTransaction');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');
const { calculateEMI } = require('../utils/emiCalculator');
const { getAccountByCode, recordTransaction } = require('../utils/accountingService');

// Helper to log audit actions
const logAction = async (req, action, resourceType, resourceId, details) => {
  try {
    await AuditLog.create({
      organizationId: req.user.organizationId,
      branchId: req.body.branchId || req.query.branchId || null,
      userId: req.user._id,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

// @desc    Generate EMI Schedule for a Loan
// @route   POST /api/v1/repayments/:loanId/generate-schedule
// @access  Private (Org Admin, Branch Manager)
exports.generateSchedule = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { startDate } = req.body;

    const loan = await Loan.findOne({
      _id: loanId,
      organizationId: req.user.organizationId,
    });

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    if (loan.status !== 'Disbursed' && loan.status !== 'Active') {
      return res.status(400).json({ success: false, error: 'Loan must be disbursed to generate schedule' });
    }

    // Check if schedule already exists
    const existing = await LoanRepaymentSchedule.findOne({ loanId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Schedule already exists for this loan' });
    }

    const firstEmiDate = startDate ? new Date(startDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Calculate EMIs
    const emiData = calculateEMI(loan.approvedAmount, loan.interestRate, loan.tenure, firstEmiDate);

    // Save EMIs
    const scheduleDocs = emiData.schedule.map(emi => ({
      organizationId: loan.organizationId,
      branchId: loan.branchId,
      loanId: loan._id,
      memberId: loan.memberId,
      emiNumber: emi.emiNumber,
      dueDate: emi.dueDate,
      principalAmount: emi.principalAmount,
      interestAmount: emi.interestAmount,
      emiAmount: emi.emiAmount,
      remainingAmount: emi.remainingAmount,
      status: 'Upcoming'
    }));

    await LoanRepaymentSchedule.insertMany(scheduleDocs);

    // Update loan status to active if not already
    if (loan.status === 'Disbursed') {
      loan.status = 'Active';
      await loan.save();
    }

    await logAction(req, 'GENERATE_SCHEDULE', 'Loan', loan._id, `Generated schedule with EMI of ${emiData.emiAmount}`);

    res.status(201).json({
      success: true,
      data: {
        emiAmount: emiData.emiAmount,
        totalInterest: emiData.totalInterest,
        totalPayable: emiData.totalPayable,
        scheduleCount: scheduleDocs.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get EMI Schedule for a Loan
// @route   GET /api/v1/repayments/loan/:loanId
// @access  Private
exports.getSchedule = async (req, res, next) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findOne({
      _id: loanId,
      organizationId: req.user.organizationId,
    }).populate('memberId', 'firstName lastName memberId profilePicture');

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    const schedule = await LoanRepaymentSchedule.find({ loanId }).sort({ emiNumber: 1 });
    
    // Calculate summaries
    const totalPaid = schedule.reduce((sum, emi) => sum + emi.paidAmount, 0);
    const totalDue = schedule.reduce((sum, emi) => sum + emi.emiAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        loan,
        schedule,
        summary: {
          totalPayable: totalDue,
          totalPaid,
          outstandingBalance: totalDue - totalPaid
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record Repayment
// @route   POST /api/v1/repayments
// @access  Private (Treasurer, Manager)
exports.recordRepayment = async (req, res, next) => {
  try {
    const { loanId, emiNumber, amount, paymentMethod, referenceNumber, remarks } = req.body;

    if (!loanId || !emiNumber || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const loan = await Loan.findOne({
      _id: loanId,
      organizationId: req.user.organizationId,
    });

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }
    
    if (loan.status !== 'Active') {
      return res.status(400).json({ success: false, error: 'Cannot record payment for non-active loan' });
    }

    const emi = await LoanRepaymentSchedule.findOne({ loanId, emiNumber });

    if (!emi) {
      return res.status(404).json({ success: false, error: 'EMI record not found' });
    }

    if (emi.status === 'Paid' || emi.status === 'Waived') {
      return res.status(400).json({ success: false, error: 'EMI is already fully paid or waived' });
    }

    // Exact payment logic
    const requiredAmount = emi.emiAmount - emi.paidAmount;
    if (amount !== requiredAmount) {
      return res.status(400).json({ success: false, error: `Exact amount required. Expected: ${requiredAmount}, Provided: ${amount}` });
    }

    // Process payment
    const transactionId = 'REP' + Date.now().toString() + Math.floor(Math.random() * 1000);
    
    // Update loan outstanding
    loan.outstandingAmount = Math.max(0, loan.outstandingAmount - emi.principalAmount);
    
    const txn = await LoanRepaymentTransaction.create({
      organizationId: loan.organizationId,
      branchId: loan.branchId,
      loanId: loan._id,
      memberId: loan.memberId,
      emiId: emi._id,
      transactionId,
      amount,
      paymentMethod,
      referenceNumber,
      balanceAfterTransaction: loan.outstandingAmount,
      recordedBy: req.user._id,
      remarks,
    });

    // Update EMI status
    emi.paidAmount += amount;
    emi.status = 'Paid';
    emi.paidDate = new Date();
    await emi.save();
    
    await loan.save();

    await logAction(req, 'RECORD_REPAYMENT', 'LoanRepaymentTransaction', txn._id, `Recorded payment of ${amount} for EMI ${emiNumber} of Loan ${loanId}`);

    // ----------------------------------------------------
    // Post to Accounting (Module 13 Integration)
    // ----------------------------------------------------
    try {
      const cashAcc = await getAccountByCode(req.user.organizationId, '1000');
      const loanRecAcc = await getAccountByCode(req.user.organizationId, '1200');
      const interestIncAcc = await getAccountByCode(req.user.organizationId, '4000');
      if (cashAcc && loanRecAcc && interestIncAcc) {
        await recordTransaction({
          organizationId: req.user.organizationId,
          branchId: loan.branchId,
          memberId: loan.memberId,
          sourceModule: 'Repayment',
          sourceId: txn._id,
          transactionType: 'Inflow',
          amount: Number(amount),
          paymentMethod,
          date: new Date(),
          description: `Loan Repayment EMI ${emiNumber} - Loan ${loanId}`,
          userId: req.user._id,
          journalLines: [
            { accountId: cashAcc._id, debit: Number(amount), credit: 0 },
            { accountId: loanRecAcc._id, debit: 0, credit: Number(emi.principalAmount) },
            { accountId: interestIncAcc._id, debit: 0, credit: Number(emi.interestAmount) }
          ]
        });
      }
    } catch (accErr) {
      console.error('[Accounting Posting Error]', accErr);
    }

    res.status(201).json({
      success: true,
      data: txn
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Upcoming EMIs
// @route   GET /api/v1/repayments/upcoming
// @access  Private
exports.getUpcomingEMIs = async (req, res, next) => {
  try {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    let query = {
      organizationId: req.user.organizationId,
      status: { $in: ['Upcoming', 'Due', 'Partially Paid'] },
      dueDate: { $gte: now, $lte: thirtyDaysFromNow }
    };

    if (req.user.role === 'Member') {
      query.memberId = req.user.memberId || req.user._id; // Adapt based on actual schema mapping
    } else if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }

    const upcoming = await LoanRepaymentSchedule.find(query)
      .populate('memberId', 'firstName lastName memberId')
      .populate('loanId', 'applicationId loanType')
      .sort({ dueDate: 1 })
      .limit(50);

    res.status(200).json({ success: true, count: upcoming.length, data: upcoming });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Overdue EMIs
// @route   GET /api/v1/repayments/overdue
// @access  Private
exports.getOverdueEMIs = async (req, res, next) => {
  try {
    const now = new Date();

    let query = {
      organizationId: req.user.organizationId,
      status: { $in: ['Upcoming', 'Due', 'Partially Paid', 'Overdue'] },
      dueDate: { $lt: now }
    };

    if (req.user.role === 'Member') {
      query.memberId = req.user.memberId || req.user._id; 
    } else if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }

    const overdue = await LoanRepaymentSchedule.find(query)
      .populate('memberId', 'firstName lastName memberId phone')
      .populate('loanId', 'applicationId loanType')
      .sort({ dueDate: 1 })
      .limit(50);

    res.status(200).json({ success: true, count: overdue.length, data: overdue });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Repayment Transactions
// @route   GET /api/v1/repayments/transactions
// @access  Private
exports.getRepaymentTransactions = async (req, res, next) => {
  try {
    let query = { organizationId: req.user.organizationId };

    if (req.user.role === 'Member') {
      query.memberId = req.user.memberId || req.user._id; 
    } else if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }
    
    if (req.query.loanId) {
      query.loanId = req.query.loanId;
    }

    const transactions = await LoanRepaymentTransaction.find(query)
      .populate('memberId', 'firstName lastName memberId')
      .populate({
        path: 'emiId',
        select: 'emiNumber'
      })
      .sort({ paymentDate: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    next(err);
  }
};

// @desc    Close Loan
// @route   POST /api/v1/repayments/:loanId/close
// @access  Private (Org Admin, Branch Manager)
exports.closeLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findOne({
      _id: loanId,
      organizationId: req.user.organizationId,
    });

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    // Check if any EMIs are unpaid
    const unpaidEMIs = await LoanRepaymentSchedule.countDocuments({
      loanId,
      status: { $nin: ['Paid', 'Waived'] }
    });

    if (unpaidEMIs > 0 || loan.outstandingAmount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot close loan. There are ${unpaidEMIs} unpaid EMIs or an outstanding balance of ${loan.outstandingAmount}.` 
      });
    }

    loan.status = 'Closed';
    await loan.save();

    await logAction(req, 'CLOSE_LOAN', 'Loan', loan._id, `Closed loan completely`);

    res.status(200).json({
      success: true,
      message: 'Loan has been successfully closed.',
      data: loan
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Repayment Dashboard Stats
// @route   GET /api/v1/repayments/dashboard
// @access  Private
exports.getRepaymentDashboard = async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;
    let query = { organizationId: orgId };
    if (req.query.branchId) query.branchId = req.query.branchId;

    const [activeLoansCount, closedLoansCount, totalOutstandingRes, emiStatusDist] = await Promise.all([
      Loan.countDocuments({ ...query, status: 'Active' }),
      Loan.countDocuments({ ...query, status: 'Closed' }),
      Loan.aggregate([
        { $match: { ...query, status: 'Active' } },
        { $group: { _id: null, total: { $sum: "$outstandingAmount" } } }
      ]),
      LoanRepaymentSchedule.aggregate([
        { $match: query },
        { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$emiAmount" } } }
      ])
    ]);

    // Format distributions
    const emiSummary = {
      upcoming: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 }
    };
    
    emiStatusDist.forEach(s => {
      if (s._id === 'Paid') emiSummary.paid = { count: s.count, amount: s.totalAmount };
      else if (s._id === 'Overdue' || s.dueDate < new Date()) emiSummary.overdue = { count: emiSummary.overdue.count + s.count, amount: emiSummary.overdue.amount + s.totalAmount };
      else emiSummary.upcoming = { count: emiSummary.upcoming.count + s.count, amount: emiSummary.upcoming.amount + s.totalAmount };
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todaysTransactions = await LoanRepaymentTransaction.aggregate([
      { $match: { ...query, paymentDate: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activeLoansCount,
        closedLoansCount,
        totalOutstanding: totalOutstandingRes[0]?.total || 0,
        todaysCollections: todaysTransactions[0]?.total || 0,
        todaysCollectionCount: todaysTransactions[0]?.count || 0,
        emiSummary
      }
    });
  } catch (err) {
    next(err);
  }
};
