const ChartOfAccount = require('../models/ChartOfAccount');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const FinancialTransaction = require('../models/FinancialTransaction');
const { ensureDefaultAccounts, postJournalEntry } = require('../utils/accountingService');

// @desc    Get Accounting Dashboard Stats
// @route   GET /api/v1/accounting/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;
    
    // Ensure default accounts exist so metrics don't break on fresh orgs
    await ensureDefaultAccounts(orgId, req.user._id);

    // Basic calculation for cash balance, income, expenses via JournalLines
    // Let's find specific accounts
    const accounts = await ChartOfAccount.find({ organizationId: orgId });
    
    let cashBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    // Get all journal lines to compute balances (in a real system this would use aggregation or pre-calculated balances)
    const lines = await JournalLine.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: "$accountId", totalDebit: { $sum: "$debit" }, totalCredit: { $sum: "$credit" } } }
    ]);

    accounts.forEach(acc => {
      const lineData = lines.find(l => l._id.toString() === acc._id.toString());
      if (lineData) {
        let balance = 0;
        if (acc.normalBalance === 'Debit') {
          balance = lineData.totalDebit - lineData.totalCredit;
        } else {
          balance = lineData.totalCredit - lineData.totalDebit;
        }

        if (acc.accountType === 'Asset' && (acc.accountName.includes('Cash') || acc.accountName.includes('Bank'))) {
          cashBalance += balance;
        } else if (acc.accountType === 'Income') {
          totalIncome += balance;
        } else if (acc.accountType === 'Expense') {
          totalExpense += balance;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        cashBalance,
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Chart of Accounts
// @route   GET /api/v1/accounting/accounts
// @access  Private
exports.getChartOfAccounts = async (req, res, next) => {
  try {
    await ensureDefaultAccounts(req.user.organizationId, req.user._id);

    const accounts = await ChartOfAccount.find({ organizationId: req.user.organizationId }).sort({ accountCode: 1 });
    
    // Compute running balances
    const lines = await JournalLine.aggregate([
      { $match: { organizationId: req.user.organizationId } },
      { $group: { _id: "$accountId", totalDebit: { $sum: "$debit" }, totalCredit: { $sum: "$credit" } } }
    ]);

    const accountsWithBalance = accounts.map(acc => {
      const lineData = lines.find(l => l._id.toString() === acc._id.toString());
      let balance = 0;
      if (lineData) {
        balance = acc.normalBalance === 'Debit' 
          ? lineData.totalDebit - lineData.totalCredit 
          : lineData.totalCredit - lineData.totalDebit;
      }
      return { ...acc.toObject(), currentBalance: balance };
    });

    res.status(200).json({ success: true, count: accountsWithBalance.length, data: accountsWithBalance });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Trial Balance
// @route   GET /api/v1/accounting/trial-balance
// @access  Private
exports.getTrialBalance = async (req, res, next) => {
  try {
    const lines = await JournalLine.aggregate([
      { $match: { organizationId: req.user.organizationId } },
      { $group: { _id: "$accountId", totalDebit: { $sum: "$debit" }, totalCredit: { $sum: "$credit" } } }
    ]);

    const accounts = await ChartOfAccount.find({ _id: { $in: lines.map(l => l._id) } });

    let totalDebit = 0;
    let totalCredit = 0;

    const trialBalance = accounts.map(acc => {
      const line = lines.find(l => l._id.toString() === acc._id.toString());
      let debit = 0;
      let credit = 0;

      let net = line.totalDebit - line.totalCredit;
      
      if (net > 0) {
        debit = net;
      } else if (net < 0) {
        credit = Math.abs(net);
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        accountId: acc._id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debit,
        credit
      };
    });

    res.status(200).json({
      success: true,
      data: {
        lines: trialBalance,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.001
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Journal Entries
// @route   GET /api/v1/accounting/journals
// @access  Private
exports.getJournalEntries = async (req, res, next) => {
  try {
    const journals = await JournalEntry.find({ organizationId: req.user.organizationId })
      .sort({ entryDate: -1 })
      .limit(100);

    // Fetch lines for these journals
    const journalIds = journals.map(j => j._id);
    const lines = await JournalLine.find({ journalEntryId: { $in: journalIds } })
      .populate('accountId', 'accountCode accountName');

    const data = journals.map(j => {
      const jLines = lines.filter(l => l.journalEntryId.toString() === j._id.toString());
      return { ...j.toObject(), lines: jLines };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};
