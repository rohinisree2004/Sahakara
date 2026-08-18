const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');
const { getAccountByCode, recordTransaction } = require('../utils/accountingService');
const mongoose = require('mongoose');

// Helper to generate unique account number
const generateAccountNumber = async (organizationId, typeCode = 'SAV') => {
  const currentYear = new Date().getFullYear();
  const count = await SavingsAccount.countDocuments({ organizationId });
  const sequence = (count + 1).toString().padStart(5, '0');
  return `${typeCode}-${currentYear}-${sequence}`;
};

// Helper to generate unique transaction ID
const generateTransactionId = async (organizationId, typeCode = 'TXN') => {
  const currentYear = new Date().getFullYear();
  const count = await SavingsTransaction.countDocuments({ organizationId });
  const sequence = (count + 1).toString().padStart(6, '0');
  return `${typeCode}-${currentYear}-${sequence}`;
};

// @desc    Get Savings Dashboard Stats
// @route   GET /api/v1/savings/dashboard
// @access  Private (Org Admin, Branch Manager, Employee)
exports.getSavingsDashboardStats = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const organizationId = (roleName === 'Super Admin' && req.query.organizationId) 
      ? req.query.organizationId 
      : req.user.organizationId;

    let matchQuery = {};
    let txnMatchQuery = { status: 'Completed' };

    if (organizationId) {
      matchQuery.organizationId = new mongoose.Types.ObjectId(organizationId);
      txnMatchQuery.organizationId = new mongoose.Types.ObjectId(organizationId);
    }

    // If user is branch scoped
    if (req.user.branchId && roleName !== 'Super Admin' && roleName !== 'Organization Admin' && roleName !== 'President' && roleName !== 'Secretary' && roleName !== 'Treasurer') {
      matchQuery.branchId = new mongoose.Types.ObjectId(req.user.branchId);
      txnMatchQuery.branchId = new mongoose.Types.ObjectId(req.user.branchId);
    }

    // Total Savings (Sum of currentBalance)
    const totalSavingsResult = await SavingsAccount.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalBalance: { $sum: '$currentBalance' }, activeAccounts: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } } } }
    ]);

    const totalSavings = totalSavingsResult.length > 0 ? totalSavingsResult[0].totalBalance : 0;
    const activeAccounts = totalSavingsResult.length > 0 ? totalSavingsResult[0].activeAccounts : 0;
    const totalAccounts = await SavingsAccount.countDocuments(matchQuery);

    // Today's Collection
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCollectionResult = await SavingsTransaction.aggregate([
      { $match: { ...txnMatchQuery, transactionType: 'Deposit', transactionDate: { $gte: today, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todaysCollection = todayCollectionResult.length > 0 ? todayCollectionResult[0].total : 0;

    // Current Month Collection
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthCollectionResult = await SavingsTransaction.aggregate([
      { $match: { ...txnMatchQuery, transactionType: 'Deposit', transactionDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyCollection = monthCollectionResult.length > 0 ? monthCollectionResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSavings,
        activeAccounts,
        totalAccounts,
        todaysCollection,
        monthlyCollection
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Savings Account
// @route   POST /api/v1/savings/accounts
// @access  Private (Org Admin, Branch Manager, Employee)
exports.createSavingsAccount = async (req, res, next) => {
  try {
    const { memberId, accountType, openingBalance, minimumBalance, interestRate, remarks } = req.body;
    const { organizationId } = req.user;

    // Verify Member
    const member = await Member.findOne({ _id: memberId, organizationId });
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found or does not belong to your organization' });
    }

    // Check if account of same type already exists for this member
    const existingAccount = await SavingsAccount.findOne({ organizationId, memberId, accountType });
    if (existingAccount) {
      return res.status(400).json({ success: false, error: `Member already has an active ${accountType} account` });
    }

    const accountNumber = await generateAccountNumber(organizationId);

    const savingsAccount = await SavingsAccount.create({
      organizationId,
      branchId: member.branchId, // inherit member's branch
      memberId,
      accountNumber,
      accountType: accountType || 'Regular Savings',
      openingBalance: openingBalance || 0,
      currentBalance: openingBalance || 0,
      minimumBalance: minimumBalance || 0,
      interestRate: interestRate || 0,
      status: 'Active',
      remarks,
      createdBy: req.user._id
    });

    // If opening balance > 0, create an initial deposit transaction
    if (openingBalance > 0) {
      const transactionId = await generateTransactionId(organizationId);
      await SavingsTransaction.create({
        organizationId,
        branchId: member.branchId,
        savingsAccountId: savingsAccount._id,
        memberId,
        transactionId,
        transactionType: 'Deposit',
        amount: openingBalance,
        paymentMethod: 'Cash', // Default for opening balance
        referenceNumber: 'Opening Balance',
        balanceAfterTransaction: openingBalance,
        remarks: 'Initial deposit upon account opening',
        createdBy: req.user._id
      });
    }

    await AuditLog.create({
      organizationId,
      userId: req.user._id,
      action: 'CREATE_SAVINGS_ACCOUNT',
      module: 'Savings Management',
      description: `Created savings account ${accountNumber} for member ${member.memberId}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: savingsAccount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Savings Accounts
// @route   GET /api/v1/savings/accounts
// @access  Private
exports.getSavingsAccounts = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const organizationId = (roleName === 'Super Admin' && req.query.organizationId) 
      ? req.query.organizationId 
      : req.user.organizationId;

    let query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    }

    // Apply branch scope if applicable
    const isOrgLevel = roleName === 'Super Admin' || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';
    if (req.user.branchId && !isOrgLevel) {
      query.branchId = req.user.branchId;
    }

    // Filters
    if (req.query.branchId && (!req.user.branchId || isOrgLevel)) {
      query.branchId = req.query.branchId;
    }
    if (req.query.status) query.status = req.query.status;
    if (req.query.memberId) query.memberId = req.query.memberId;
    
    // Pagination & Sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await SavingsAccount.countDocuments(query);
    const accounts = await SavingsAccount.find(query)
      .populate('memberId', 'fullName memberId phone profileImage')
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: accounts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: accounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Savings Account
// @route   GET /api/v1/savings/accounts/:id
// @access  Private
exports.getSavingsAccountById = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const organizationId = (roleName === 'Super Admin' && req.query.organizationId) 
      ? req.query.organizationId 
      : req.user.organizationId;

    let query = { _id: req.params.id };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    // Strict isolation check
    const isOrgLevel = roleName === 'Super Admin' || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';
    if (req.user.branchId && !isOrgLevel) {
      query.branchId = req.user.branchId;
    }

    const account = await SavingsAccount.findOne(query)
      .populate('memberId', 'fullName memberId phone email address dob joinDate category profileImage')
      .populate('branchId', 'branchName branchCode address')
      .populate('organizationId', 'name code')
      .populate('createdBy', 'firstName lastName email');

    if (!account) {
      return res.status(404).json({ success: false, error: 'Savings account not found or access denied' });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record Deposit
// @route   POST /api/v1/savings/deposit
// @access  Private
exports.recordDeposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { accountId, amount, paymentMethod, referenceNumber, paymentDate, remarks } = req.body;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const organizationId = req.user.organizationId || req.body.organizationId;

    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

    let query = { _id: accountId };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const isOrgLevel = roleName === 'Super Admin' || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';
    if (req.user.branchId && !isOrgLevel) {
      query.branchId = req.user.branchId;
    }

    const account = await SavingsAccount.findOne(query).session(session);
    if (!account) {
      throw new Error('Savings account not found or access denied');
    }

    if (account.status !== 'Active') {
      throw new Error(`Cannot deposit to ${account.status} account`);
    }

    const targetOrgId = account.organizationId;
    const newBalance = account.currentBalance + Number(amount);
    
    // Update account balance
    account.currentBalance = newBalance;
    account.lastTransactionDate = paymentDate || Date.now();
    await account.save({ session });

    // Create transaction
    const transactionId = await generateTransactionId(targetOrgId, 'DEP');
    const transaction = await SavingsTransaction.create([{
      organizationId: targetOrgId,
      branchId: account.branchId,
      savingsAccountId: account._id,
      memberId: account.memberId,
      transactionId,
      transactionType: 'Deposit',
      amount,
      paymentMethod,
      referenceNumber,
      balanceAfterTransaction: newBalance,
      transactionDate: paymentDate || Date.now(),
      remarks,
      createdBy: req.user._id
    }], { session });

    await AuditLog.create([{
      organizationId: targetOrgId,
      userId: req.user._id,
      action: 'RECORD_DEPOSIT',
      module: 'Savings Management',
      description: `Recorded deposit of ${amount} for account ${account.accountNumber}`,
      ipAddress: req.ip
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // ----------------------------------------------------
    // Post to Accounting (Module 13 Integration)
    // ----------------------------------------------------
    try {
      const cashAcc = await getAccountByCode(targetOrgId, '1000');
      const savingsPayableAcc = await getAccountByCode(targetOrgId, '2000');
      if (cashAcc && savingsPayableAcc) {
        await recordTransaction({
          organizationId: targetOrgId,
          branchId: account.branchId,
          memberId: account.memberId,
          sourceModule: 'SavingsDeposit',
          sourceId: transaction[0]._id,
          transactionType: 'Inflow',
          amount: Number(amount),
          paymentMethod,
          date: paymentDate || Date.now(),
          description: `Savings Deposit - Account ${account.accountNumber}`,
          userId: req.user._id,
          journalLines: [
            { accountId: cashAcc._id, debit: Number(amount), credit: 0 },
            { accountId: savingsPayableAcc._id, debit: 0, credit: Number(amount) }
          ]
        });
      }
    } catch (accErr) {
      console.error('[Accounting Posting Error]', accErr);
    }

    res.status(201).json({
      success: true,
      data: transaction[0],
      message: 'Deposit recorded successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Catch custom errors to send 400
    if (error.message.includes('not found') || error.message.includes('must be greater') || error.message.includes('Cannot deposit')) {
       return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};

// @desc    Get Savings Transactions
// @route   GET /api/v1/savings/transactions
// @access  Private
exports.getSavingsTransactions = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const organizationId = (roleName === 'Super Admin' && req.query.organizationId) 
      ? req.query.organizationId 
      : req.user.organizationId;

    let query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const isOrgLevel = roleName === 'Super Admin' || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';
    if (req.user.branchId && !isOrgLevel) {
      query.branchId = req.user.branchId;
    }

    // Filters
    if (req.query.branchId && (!req.user.branchId || isOrgLevel)) {
      query.branchId = req.query.branchId;
    }
    if (req.query.memberId) query.memberId = req.query.memberId;
    if (req.query.savingsAccountId) query.savingsAccountId = req.query.savingsAccountId;
    if (req.query.transactionType) query.transactionType = req.query.transactionType;
    
    // Date Range
    if (req.query.startDate && req.query.endDate) {
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      query.transactionDate = {
        $gte: new Date(req.query.startDate),
        $lte: end
      };
    }

    // Pagination & Sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const startIndex = (page - 1) * limit;

    const total = await SavingsTransaction.countDocuments(query);
    const transactions = await SavingsTransaction.find(query)
      .populate('memberId', 'fullName memberId')
      .populate('savingsAccountId', 'accountNumber accountType')
      .populate('createdBy', 'firstName lastName name')
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Member Passbook
// @route   GET /api/v1/savings/passbook/:accountId
// @access  Private
exports.getPassbook = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const organizationId = (roleName === 'Super Admin' && req.query.organizationId) 
      ? req.query.organizationId 
      : req.user.organizationId;
    
    // First verify account access
    let query = { _id: req.params.accountId };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const isOrgLevel = roleName === 'Super Admin' || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';
    if (req.user.branchId && !isOrgLevel) {
      query.branchId = req.user.branchId;
    }

    const account = await SavingsAccount.findOne(query)
      .populate('memberId', 'fullName memberId phone address')
      .populate('branchId', 'branchName branchCode address');

    if (!account) {
      return res.status(404).json({ success: false, error: 'Savings account not found or access denied' });
    }

    // Member self-access check
    if (roleName === 'Member' && account.memberId._id.toString() !== req.user.memberId?.toString()) {
        return res.status(403).json({ success: false, error: 'Access denied to this passbook' });
    }

    // Fetch transactions
    let txnQuery = { savingsAccountId: account._id, status: 'Completed' };
    
    // Optional date range
    if (req.query.startDate && req.query.endDate) {
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      txnQuery.transactionDate = {
        $gte: new Date(req.query.startDate),
        $lte: end
      };
    }

    const transactions = await SavingsTransaction.find(txnQuery)
      .sort({ transactionDate: 1, createdAt: 1 }); // chronological

    res.status(200).json({
      success: true,
      data: {
        account,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};
