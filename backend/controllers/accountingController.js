const ChartOfAccount = require('../models/ChartOfAccount');
const JournalEntry = require('../models/JournalEntry');
const JournalLine = require('../models/JournalLine');
const FinancialTransaction = require('../models/FinancialTransaction');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const mongoose = require('mongoose');
const { ensureDefaultAccounts, postJournalEntry } = require('../utils/accountingService');

// @desc    Get Accounting Dashboard Stats
// @route   GET /api/v1/accounting/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId, branchId } = req.query;

    let targetOrgId = req.user.organizationId;
    if (isSuperAdmin) {
      if (organizationId && organizationId !== 'All') {
        targetOrgId = organizationId;
      } else {
        const firstOrg = await Organization.findOne();
        if (firstOrg) targetOrgId = firstOrg._id;
      }
    }

    if (targetOrgId) {
      await ensureDefaultAccounts(targetOrgId, req.user._id);
    }

    const matchStage = {};
    if (targetOrgId) matchStage.organizationId = new mongoose.Types.ObjectId(targetOrgId);
    if (['Branch Manager', 'Employee'].includes(roleName) || (req.user.branchId && roleName !== 'Organization Admin' && !isSuperAdmin)) {
      if (req.user.branchId) matchStage.branchId = new mongoose.Types.ObjectId(req.user.branchId);
    } else if (branchId && branchId !== 'All') {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    const accounts = await ChartOfAccount.find(targetOrgId ? { organizationId: targetOrgId } : {});
    
    let cashBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const lineAgg = await JournalLine.aggregate([
      { $match: matchStage },
      { $group: { _id: "$accountId", totalDebit: { $sum: "$debit" }, totalCredit: { $sum: "$credit" } } }
    ]);

    accounts.forEach(acc => {
      const lineData = lineAgg.find(l => l._id.toString() === acc._id.toString());
      if (lineData) {
        let balance = 0;
        if (acc.normalBalance === 'Debit') {
          balance = lineData.totalDebit - lineData.totalCredit;
        } else {
          balance = lineData.totalCredit - lineData.totalDebit;
        }

        if (acc.accountType === 'Asset') {
          totalAssets += balance;
          if (acc.accountName.toLowerCase().includes('cash') || acc.accountName.toLowerCase().includes('bank') || acc.accountCode === '1010' || acc.accountCode === '1000' || acc.accountCode === '1100') {
            cashBalance += balance;
          }
        } else if (acc.accountType === 'Liability') {
          totalLiabilities += balance;
        } else if (acc.accountType === 'Equity') {
          totalEquity += balance;
        } else if (acc.accountType === 'Income') {
          totalIncome += balance;
        } else if (acc.accountType === 'Expense') {
          totalExpense += balance;
        }
      }
    });

    const netSurplus = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      data: {
        cashBalance,
        totalIncome,
        totalExpense,
        netSurplus,
        totalAssets,
        totalLiabilities,
        totalEquity,
        accountsCount: accounts.length
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
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId } = req.query;

    let targetOrgId = req.user.organizationId;
    if (isSuperAdmin) {
      if (organizationId && organizationId !== 'All') {
        targetOrgId = organizationId;
      } else {
        const firstOrg = await Organization.findOne();
        if (firstOrg) targetOrgId = firstOrg._id;
      }
    }

    if (targetOrgId) {
      await ensureDefaultAccounts(targetOrgId, req.user._id);
    }

    const query = targetOrgId ? { organizationId: targetOrgId } : {};
    const accounts = await ChartOfAccount.find(query)
      .populate('organizationId', 'name code')
      .sort({ accountCode: 1 });
    
    // Compute running balances
    const matchStage = targetOrgId ? { organizationId: new mongoose.Types.ObjectId(targetOrgId) } : {};
    const lines = await JournalLine.aggregate([
      { $match: matchStage },
      { $group: { _id: "$accountId", totalDebit: { $sum: "$debit" }, totalCredit: { $sum: "$credit" } } }
    ]);

    const accountsWithBalance = accounts.map(acc => {
      const lineData = lines.find(l => l._id.toString() === acc._id.toString());
      let balance = 0;
      let debitSum = 0;
      let creditSum = 0;
      if (lineData) {
        debitSum = lineData.totalDebit;
        creditSum = lineData.totalCredit;
        balance = acc.normalBalance === 'Debit' 
          ? lineData.totalDebit - lineData.totalCredit 
          : lineData.totalCredit - lineData.totalDebit;
      }
      return { 
        ...acc.toObject(), 
        currentBalance: balance,
        totalDebit: debitSum,
        totalCredit: creditSum
      };
    });

    res.status(200).json({ success: true, count: accountsWithBalance.length, data: accountsWithBalance });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Custom Account in Chart of Accounts
// @route   POST /api/v1/accounting/accounts
// @access  Private (Super Admin, Org Admin, Treasurer)
exports.createAccount = async (req, res, next) => {
  try {
    const { organizationId, accountCode, accountName, accountType, normalBalance } = req.body;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    const targetOrgId = isSuperAdmin ? (organizationId || req.user.organizationId) : req.user.organizationId;
    if (!targetOrgId) {
      return res.status(400).json({ success: false, error: 'Cooperative Society organization is required' });
    }

    const existing = await ChartOfAccount.findOne({ organizationId: targetOrgId, accountCode });
    if (existing) {
      return res.status(400).json({ success: false, error: `Account code ${accountCode} already exists in this society` });
    }

    const account = await ChartOfAccount.create({
      organizationId: targetOrgId,
      accountCode,
      accountName,
      accountType,
      normalBalance: normalBalance || (accountType === 'Asset' || accountType === 'Expense' ? 'Debit' : 'Credit'),
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Account created in Chart of Accounts', data: account });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Trial Balance
// @route   GET /api/v1/accounting/trial-balance
// @access  Private
exports.getTrialBalance = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId, branchId } = req.query;

    let targetOrgId = req.user.organizationId;
    if (isSuperAdmin) {
      if (organizationId && organizationId !== 'All') {
        targetOrgId = organizationId;
      } else {
        const firstOrg = await Organization.findOne();
        if (firstOrg) targetOrgId = firstOrg._id;
      }
    }

    if (targetOrgId) {
      await ensureDefaultAccounts(targetOrgId, req.user._id);
    }

    const matchStage = {};
    if (targetOrgId) matchStage.organizationId = new mongoose.Types.ObjectId(targetOrgId);
    if (['Branch Manager', 'Employee'].includes(roleName) || (req.user.branchId && roleName !== 'Organization Admin' && !isSuperAdmin)) {
      if (req.user.branchId) matchStage.branchId = new mongoose.Types.ObjectId(req.user.branchId);
    } else if (branchId && branchId !== 'All') {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    const lines = await JournalLine.aggregate([
      { $match: matchStage },
      { $group: { _id: "$accountId", totalDebit: { $sum: "$debit" }, totalCredit: { $sum: "$credit" } } }
    ]);

    const accounts = await ChartOfAccount.find(targetOrgId ? { organizationId: targetOrgId } : {}).sort({ accountCode: 1 });

    let totalDebit = 0;
    let totalCredit = 0;

    const trialBalance = accounts.map(acc => {
      const line = lines.find(l => l._id.toString() === acc._id.toString());
      let debit = 0;
      let credit = 0;

      if (line) {
        let net = line.totalDebit - line.totalCredit;
        if (acc.normalBalance === 'Debit') {
          if (net >= 0) debit = net;
          else credit = Math.abs(net);
        } else {
          if (net <= 0) credit = Math.abs(net);
          else debit = net;
        }
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        accountId: acc._id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        normalBalance: acc.normalBalance,
        debit,
        credit
      };
    });

    res.status(200).json({
      success: true,
      data: {
        lines: trialBalance,
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
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
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId, branchId, referenceType, page = 1, limit = 50 } = req.query;

    let query = {};
    if (!isSuperAdmin) {
      if (req.user.organizationId) query.organizationId = req.user.organizationId;
    } else if (organizationId && organizationId !== 'All') {
      query.organizationId = organizationId;
    }

    if (['Branch Manager', 'Employee'].includes(roleName) || (req.user.branchId && roleName !== 'Organization Admin' && !isSuperAdmin)) {
      if (req.user.branchId) query.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    }

    if (referenceType && referenceType !== 'All') {
      query.referenceType = referenceType;
    }

    const total = await JournalEntry.countDocuments(query);
    const journals = await JournalEntry.find(query)
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .populate('createdBy', 'name username')
      .sort({ entryDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: journals
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Journal Entry
// @route   POST /api/v1/accounting/journals
// @access  Private (Admins & Accountants)
exports.createJournalEntry = async (req, res, next) => {
  try {
    const { organizationId, branchId, date, description, referenceType, lines } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';
    const targetOrgId = isSuperAdmin ? (organizationId || req.user.organizationId) : req.user.organizationId;

    if (!targetOrgId) {
      return res.status(400).json({ success: false, message: 'Society / Organization context required.' });
    }

    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({ success: false, message: 'A journal entry must contain at least 2 lines (debit & credit).' });
    }

    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += Number(line.debit) || 0;
      totalCredit += Number(line.credit) || 0;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: `Debit (₹${totalDebit}) and Credit (₹${totalCredit}) must balance in double-entry bookkeeping.` 
      });
    }

    const entry = await recordTransaction({
      organizationId: targetOrgId,
      branchId: branchId || req.user.branchId,
      date: date || new Date(),
      description,
      referenceType: referenceType || 'Manual',
      lines,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry posted successfully to General Ledger.',
      data: entry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get General Ledger with running balance
// @route   GET /api/v1/accounting/general-ledger
// @access  Private
exports.getGeneralLedger = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId, branchId, accountId, startDate, endDate } = req.query;

    let targetOrgId = req.user.organizationId;
    if (isSuperAdmin) {
      if (organizationId && organizationId !== 'All') {
        targetOrgId = organizationId;
      } else {
        const firstOrg = await Organization.findOne();
        if (firstOrg) targetOrgId = firstOrg._id;
      }
    }

    const matchQuery = {};
    if (targetOrgId) matchQuery.organizationId = new mongoose.Types.ObjectId(targetOrgId);
    if (['Branch Manager', 'Employee'].includes(roleName) || (req.user.branchId && roleName !== 'Organization Admin' && !isSuperAdmin)) {
      if (req.user.branchId) matchQuery.branchId = new mongoose.Types.ObjectId(req.user.branchId);
    } else if (branchId && branchId !== 'All') {
      matchQuery.branchId = new mongoose.Types.ObjectId(branchId);
    }
    if (accountId && accountId !== 'All') matchQuery.accountId = new mongoose.Types.ObjectId(accountId);

    const accountsQuery = targetOrgId ? { organizationId: targetOrgId } : {};
    if (accountId && accountId !== 'All') accountsQuery._id = accountId;

    const accounts = await ChartOfAccount.find(accountsQuery).sort({ accountCode: 1 });

    const lines = await JournalLine.find(matchQuery)
      .populate({
        path: 'journalEntryId',
        select: 'entryNumber entryDate description referenceType referenceId'
      })
      .populate('accountId', 'accountCode accountName accountType normalBalance')
      .sort({ createdAt: 1 });

    // Group lines by account with running balances
    const ledger = accounts.map(acc => {
      const accLines = lines.filter(l => l.accountId?._id?.toString() === acc._id.toString());
      let runningBalance = 0;

      const transactions = accLines.map(line => {
        const debit = line.debit || 0;
        const credit = line.credit || 0;
        
        if (acc.normalBalance === 'Debit') {
          runningBalance += (debit - credit);
        } else {
          runningBalance += (credit - debit);
        }

        return {
          lineId: line._id,
          date: line.journalEntryId?.entryDate || line.createdAt,
          entryNumber: line.journalEntryId?.entryNumber || 'JRN-ENTRY',
          referenceType: line.journalEntryId?.referenceType || 'Voucher',
          referenceId: line.journalEntryId?.referenceId || '-',
          description: line.description || line.journalEntryId?.description || 'Ledger posting',
          debit,
          credit,
          runningBalance
        };
      });

      const totalDebit = transactions.reduce((s, t) => s + t.debit, 0);
      const totalCredit = transactions.reduce((s, t) => s + t.credit, 0);

      return {
        accountId: acc._id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        normalBalance: acc.normalBalance,
        totalDebit,
        totalCredit,
        closingBalance: runningBalance,
        transactions
      };
    });

    res.status(200).json({
      success: true,
      data: ledger
    });
  } catch (err) {
    next(err);
  }
};
