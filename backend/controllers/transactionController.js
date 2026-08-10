const FinancialTransaction = require('../models/FinancialTransaction');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const { postJournalEntry } = require('../utils/accountingService');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

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

// @desc    Get Transaction Dashboard Stats
// @route   GET /api/v1/transactions/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { organizationId } = req.user;

    const stats = await FinancialTransaction.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), status: 'Completed' } },
      {
        $group: {
          _id: { sourceModule: '$sourceModule', type: '$transactionType' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format for frontend
    const summary = {
      SavingsDeposit: { Inflow: 0, Outflow: 0 },
      SavingsWithdrawal: { Inflow: 0, Outflow: 0 },
      SavingsInterest: { Inflow: 0, Outflow: 0 },
      SavingsFee: { Inflow: 0, Outflow: 0 },
      LoanDisbursement: { Inflow: 0, Outflow: 0 },
      Repayment: { Inflow: 0, Outflow: 0 },
      totalInflow: 0,
      totalOutflow: 0,
    };

    stats.forEach(stat => {
      const { sourceModule, type } = stat._id;
      if (!summary[sourceModule]) {
        summary[sourceModule] = { Inflow: 0, Outflow: 0 };
      }
      summary[sourceModule][type] += stat.totalAmount;

      if (type === 'Inflow') summary.totalInflow += stat.totalAmount;
      if (type === 'Outflow') summary.totalOutflow += stat.totalAmount;
    });

    const recentTransactions = await FinancialTransaction.find({ organizationId, status: 'Completed' })
      .sort({ transactionDate: -1 })
      .limit(10)
      .populate('memberId', 'memberId firstName lastName')
      .populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: {
        summary,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Transactions with filters
// @route   GET /api/v1/transactions
// @access  Private
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const { sourceModule, transactionType, startDate, endDate, status, page = 1, limit = 50, memberId } = req.query;

    const query = { organizationId };

    if (sourceModule) query.sourceModule = sourceModule;
    if (transactionType) query.transactionType = transactionType;
    if (status) query.status = status;
    if (memberId) query.memberId = memberId;

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const total = await FinancialTransaction.countDocuments(query);
    const transactions = await FinancialTransaction.find(query)
      .populate('memberId', 'memberId firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('branchId', 'name code')
      .sort({ transactionDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Transaction Details
// @route   GET /api/v1/transactions/:id
// @access  Private
exports.getTransactionDetails = async (req, res, next) => {
  try {
    const transaction = await FinancialTransaction.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .populate('memberId', 'memberId firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('branchId', 'name code');

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    let journalEntry = null;
    let journalLines = [];
    if (transaction.journalEntryId) {
      journalEntry = await JournalEntry.findById(transaction.journalEntryId);
      if (journalEntry) {
        journalLines = await JournalLine.find({ journalEntryId: journalEntry._id })
          .populate('accountId', 'accountCode accountName');
      }
    }

    res.status(200).json({
      success: true,
      data: {
        transaction,
        journalEntry,
        journalLines
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reverse a Transaction
// @route   POST /api/v1/transactions/:id/reverse
// @access  Private
exports.reverseTransaction = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Reversal reason is required' });
    }

    const transaction = await FinancialTransaction.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    }).session(session);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'Reversed') {
      throw new Error('Transaction is already reversed');
    }

    // Mark original as Reversed
    transaction.status = 'Reversed';
    await transaction.save({ session });

    // Reverse the Journal Entry if it exists
    let reversedJournalEntryId = null;
    if (transaction.journalEntryId) {
      const originalLines = await JournalLine.find({ journalEntryId: transaction.journalEntryId }).session(session);
      
      // Swap Debits and Credits
      const reversedLines = originalLines.map(line => ({
        accountId: line.accountId,
        debit: line.credit,  // swap
        credit: line.debit,  // swap
        description: `Reversal of ${transaction.transactionId}`
      }));

      const newJournalEntry = await postJournalEntry({
        organizationId: req.user.organizationId,
        branchId: transaction.branchId,
        date: new Date(),
        description: `Reversal: ${reason}`,
        referenceType: 'Reversal',
        referenceId: transaction._id,
        lines: reversedLines,
        userId: req.user._id
      });
      reversedJournalEntryId = newJournalEntry._id;
    }

    // Create the Reversal Transaction Record
    const reversalTxnId = 'REV' + Date.now().toString();
    const reversalTxn = await FinancialTransaction.create([{
      organizationId: req.user.organizationId,
      branchId: transaction.branchId,
      memberId: transaction.memberId,
      transactionId: reversalTxnId,
      sourceModule: transaction.sourceModule, // Or 'Reversal'
      sourceId: transaction.sourceId,
      journalEntryId: reversedJournalEntryId,
      transactionType: transaction.transactionType === 'Inflow' ? 'Outflow' : 'Inflow',
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      transactionDate: new Date(),
      description: `Reversal: ${reason}`,
      status: 'Completed',
      createdBy: req.user._id,
      reversalOf: transaction._id,
      reversalReason: reason
    }], { session });

    transaction.reversalOf = reversalTxn[0]._id;
    transaction.reversedBy = req.user._id;
    transaction.reversedAt = new Date();
    transaction.reversalReason = reason;
    await transaction.save({ session });

    await logAction(req, 'REVERSE_TRANSACTION', 'FinancialTransaction', transaction._id, `Reversed transaction ${transaction.transactionId}. Reason: ${reason}`);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Transaction reversed successfully',
      data: reversalTxn[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.message === 'Transaction not found' || error.message === 'Transaction is already reversed') {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};
