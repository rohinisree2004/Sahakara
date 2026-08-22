const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const Member = require('../models/Member');
const Group = require('../models/Group');
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
// @access  Private (Org Admin, Branch Manager, Employee, Super Admin)
exports.getSavingsDashboardStats = async (req, res, next) => {
  try {
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId, branchId, groupId, memberId } = req.query;

    let matchQuery = {};
    let txnMatchQuery = { status: 'Completed' };

    if (!isSuperAdmin) {
      if (req.user.organizationId) {
        matchQuery.organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
        txnMatchQuery.organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
      }
    } else if (organizationId && organizationId !== 'All') {
      matchQuery.organizationId = new mongoose.Types.ObjectId(organizationId);
      txnMatchQuery.organizationId = new mongoose.Types.ObjectId(organizationId);
    }

    if (!isSuperAdmin && req.user.branchId && roleName !== 'Organization Admin') {
      matchQuery.branchId = new mongoose.Types.ObjectId(req.user.branchId);
      txnMatchQuery.branchId = new mongoose.Types.ObjectId(req.user.branchId);
    } else if (branchId && branchId !== 'All') {
      matchQuery.branchId = new mongoose.Types.ObjectId(branchId);
      txnMatchQuery.branchId = new mongoose.Types.ObjectId(branchId);
    }

    if (groupId && groupId !== 'All') {
      const groupDoc = await Group.findById(groupId);
      if (groupDoc && groupDoc.memberIds?.length > 0) {
        const mObjIds = groupDoc.memberIds.map(id => new mongoose.Types.ObjectId(id));
        matchQuery.memberId = { $in: mObjIds };
        txnMatchQuery.memberId = { $in: mObjIds };
      }
    }

    if (memberId && memberId !== 'All') {
      matchQuery.memberId = new mongoose.Types.ObjectId(memberId);
      txnMatchQuery.memberId = new mongoose.Types.ObjectId(memberId);
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
// @access  Private (Org Admin, Branch Manager, Employee, Super Admin)
exports.createSavingsAccount = async (req, res, next) => {
  try {
    const { memberId, accountType, openingBalance, minimumBalance, interestRate, remarks } = req.body;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    // Verify Member
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    const organizationId = isSuperAdmin ? (req.body.organizationId || member.organizationId) : req.user.organizationId;
    if (!isSuperAdmin && member.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({ success: false, error: 'Member does not belong to your organization' });
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
        status: 'Completed',
        createdBy: req.user._id
      });
    }

    const performerName = req.user.name || req.user.username || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Staff';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';

    await AuditLog.create({
      organizationId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: 'CREATE_SAVINGS_ACCOUNT',
      module: 'Savings Management',
      details: `Created savings account ${accountNumber} for member ${member.memberId}`,
      description: `Created savings account ${accountNumber} for member ${member.memberId}`,
      ipAddress: req.ip || '127.0.0.1'
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
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId, branchId, groupId, memberId, status, accountType, search } = req.query;

    let query = {};
    if (!isSuperAdmin) {
      if (req.user.organizationId) query.organizationId = req.user.organizationId;
    } else if (organizationId && organizationId !== 'All') {
      query.organizationId = organizationId;
    }

    const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin';
    if (req.user.branchId && !isOrgLevel && !['President', 'Secretary', 'Treasurer', 'Member'].includes(roleName)) {
      query.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    }

    // 1. Member Perspective or Explicit Personal Account Query (myOnly)
    if (roleName === 'Member' || req.query.myOnly === 'true') {
      const filters = [];
      if (req.user._id) filters.push({ userId: req.user._id });
      if (req.user.phone) filters.push({ phone: req.user.phone });
      if (req.user.email) filters.push({ email: req.user.email });
      if (req.user.name) filters.push({ fullName: req.user.name });

      const myMember = await Member.findOne({ $or: filters, isDeleted: false });
      if (myMember) {
        let memberQuery = { memberId: myMember._id };
        const effectiveGroupId = (groupId && groupId !== 'All') ? groupId : (req.headers?.['x-active-group'] || req.user.groupId);

        if (effectiveGroupId) {
          memberQuery.groupId = effectiveGroupId;
        }

        let accounts = await SavingsAccount.find(memberQuery)
          .populate('memberId', 'fullName memberId phone profileImage category')
          .populate('branchId', 'branchName branchCode')
          .populate('organizationId', 'name code')
          .populate('groupId', 'groupName groupCode groupType');

        if (accounts.length === 0 && effectiveGroupId) {
          const groupDoc = await Group.findById(effectiveGroupId);
          const grpCode = groupDoc?.groupCode || 'GRP';
          const memCode = myMember.memberId || 'MEM';
          const accNum = `SAV-${grpCode}-${memCode}`;

          // Ensure unique account number
          const existingNum = await SavingsAccount.findOne({ accountNumber: accNum });
          const finalAccNum = existingNum ? `SAV-${grpCode}-${memCode}-${Date.now().toString().slice(-4)}` : accNum;

          const newAcc = await SavingsAccount.create({
            organizationId: groupDoc?.organizationId || myMember.organizationId || req.user.organizationId,
            branchId: groupDoc?.branchId || myMember.branchId || req.user.branchId,
            memberId: myMember._id,
            groupId: effectiveGroupId,
            accountNumber: finalAccNum,
            accountType: 'Regular Savings',
            openingBalance: 15000,
            currentBalance: 15000,
            status: 'Active',
            createdBy: req.user._id,
          });

          const createdAcc = await SavingsAccount.findById(newAcc._id)
            .populate('memberId', 'fullName memberId phone profileImage category')
            .populate('branchId', 'branchName branchCode')
            .populate('organizationId', 'name code')
            .populate('groupId', 'groupName groupCode groupType');

          accounts = [createdAcc];
        }

        return res.status(200).json({
          success: true,
          count: accounts.length,
          total: accounts.length,
          totalPages: 1,
          currentPage: 1,
          data: accounts
        });
      }
    }

    // 2. Role-based group constraint for President, Secretary, Treasurer
    if (['President', 'Secretary', 'Treasurer'].includes(roleName)) {
      const activeGrpId = (groupId && groupId !== 'All') 
        ? groupId 
        : (req.user.groupId || req.headers?.['x-active-group']);

      if (activeGrpId) {
        query.groupId = activeGrpId;
      } else {
        const RoleAssignment = require('../models/RoleAssignment');
        const grpAssigns = await RoleAssignment.find({
          userId: req.user._id,
          role: roleName,
          status: 'Active',
          groupId: { $exists: true, $ne: null }
        });
        const assignedGroupIds = grpAssigns.map(a => a.groupId);
        if (assignedGroupIds.length > 0) {
          query.groupId = { $in: assignedGroupIds };
        } else {
          query.groupId = new mongoose.Types.ObjectId();
        }
      }
    } else if (groupId && groupId !== 'All') {
      const groupDoc = await Group.findById(groupId);
      if (groupDoc && groupDoc.memberIds?.length > 0) {
        query.memberId = { $in: groupDoc.memberIds };
      } else {
        query.memberId = new mongoose.Types.ObjectId();
      }
    }

    if (memberId && memberId !== 'All') {
      query.memberId = memberId;
      delete query.branchId;
    }

    if (status && status !== 'All') query.status = status;
    if (accountType && accountType !== 'All') query.accountType = accountType;

    if (search) {
      query.$or = [
        { accountNumber: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    let total = await SavingsAccount.countDocuments(query);
    let accounts = await SavingsAccount.find(query)
      .populate('memberId', 'fullName memberId phone profileImage category')
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .populate('groupId', 'groupName groupCode groupType')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Fallback: If logged in as Member and no account found, auto-create one
    if (accounts.length === 0 && roleName === 'Member') {
      const filters = [];
      if (req.user._id) filters.push({ userId: req.user._id });
      if (req.user.phone) filters.push({ phone: req.user.phone });
      if (req.user.email) filters.push({ email: req.user.email });
      if (req.user.name) filters.push({ fullName: req.user.name });
      const myMember = await Member.findOne({ $or: filters, isDeleted: false });
      if (myMember) {
        const orgId = myMember.organizationId || req.user.organizationId;
        const count = await SavingsAccount.countDocuments({ organizationId: orgId });
        const accNum = `SAV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
        const newAcc = await SavingsAccount.create({
          organizationId: orgId,
          branchId: myMember.branchId || req.user.branchId,
          memberId: myMember._id,
          groupId: groupId || myMember.groupId || null,
          accountNumber: accNum,
          accountType: 'Regular Savings',
          openingBalance: 15000,
          currentBalance: 15000,
          status: 'Active',
          createdBy: req.user._id,
        });
        const populatedAcc = await SavingsAccount.findById(newAcc._id)
          .populate('memberId', 'fullName memberId phone profileImage category')
          .populate('branchId', 'branchName branchCode')
          .populate('organizationId', 'name code')
          .populate('groupId', 'groupName groupCode groupType');
        accounts = [populatedAcc];
        total = 1;
      }
    }

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

// @desc    Get Savings Account by ID
// @route   GET /api/v1/savings/accounts/:id
// @access  Private
exports.getSavingsAccountById = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === 'Super Admin';
    let query = { _id: req.params.id };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const account = await SavingsAccount.findOne(query)
      .populate('memberId')
      .populate('branchId', 'branchName branchCode address district state')
      .populate('organizationId', 'name code address email phone');

    if (!account) {
      return res.status(404).json({ success: false, error: 'Savings account not found' });
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
// @access  Private (Org Admin, Branch Manager, Employee, Super Admin)
exports.recordDeposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { accountId, savingsAccountId, amount, paymentMethod, referenceNumber, paymentDate, remarks } = req.body;
    const targetAccountId = accountId || savingsAccountId;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    if (!targetAccountId) {
      throw new Error('Savings account is required');
    }

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

    let query = { _id: targetAccountId };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';
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
    const newBalance = account.currentBalance + depositAmount;
    
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
      amount: depositAmount,
      paymentMethod: paymentMethod || 'Cash',
      referenceNumber,
      balanceAfterTransaction: newBalance,
      transactionDate: paymentDate || Date.now(),
      remarks,
      status: 'Completed',
      createdBy: req.user._id
    }], { session });

    const performerName = req.user.name || req.user.username || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Staff';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';

    await AuditLog.create([{
      organizationId: targetOrgId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: 'RECORD_DEPOSIT',
      module: 'Savings Management',
      details: `Recorded deposit of ₹${depositAmount} for account ${account.accountNumber}`,
      description: `Recorded deposit of ₹${depositAmount} for account ${account.accountNumber}`,
      ipAddress: req.ip || '127.0.0.1'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // ----------------------------------------------------
    // Post to Accounting (Module 13 Integration)
    // ----------------------------------------------------
    try {
      const cashAcc = await getAccountByCode(targetOrgId, '1010');
      const savingsPayableAcc = await getAccountByCode(targetOrgId, '2010');
      if (cashAcc && savingsPayableAcc) {
        await recordTransaction({
          organizationId: targetOrgId,
          branchId: account.branchId,
          description: `Savings Deposit: ${account.accountNumber} - ${transactionId}`,
          referenceType: 'SavingsDeposit',
          referenceId: transaction[0]._id,
          date: paymentDate || new Date(),
          entries: [
            {
              accountId: cashAcc._id,
              type: 'Debit',
              amount: depositAmount,
              description: `Cash received for deposit into ${account.accountNumber}`
            },
            {
              accountId: savingsPayableAcc._id,
              type: 'Credit',
              amount: depositAmount,
              description: `Savings liability increase for ${account.accountNumber}`
            }
          ],
          createdBy: req.user._id
        });
      }
    } catch (accErr) {
      console.warn('[Accounting Posting Warning]', accErr.message);
    }

    res.status(201).json({
      success: true,
      data: {
        transaction: transaction[0],
        newBalance
      },
      message: 'Deposit recorded successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Catch custom errors to send 400
    if (error.message.includes('not found') || error.message.includes('must be greater') || error.message.includes('Cannot deposit') || error.message.includes('required')) {
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
    const isSuperAdmin = roleName === 'Super Admin';
    const { organizationId, branchId, groupId, memberId, savingsAccountId, transactionType, status, startDate, endDate, search } = req.query;

    let query = {};
    if (!isSuperAdmin) {
      if (req.user.organizationId) query.organizationId = req.user.organizationId;
    } else if (organizationId && organizationId !== 'All') {
      query.organizationId = organizationId;
    }

    const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin';
    if (req.user.branchId && !isOrgLevel && !['President', 'Secretary', 'Treasurer', 'Member'].includes(roleName)) {
      query.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (['President', 'Secretary', 'Treasurer'].includes(roleName)) {
      const activeGrpId = (groupId && groupId !== 'All') 
        ? groupId 
        : (req.user.groupId || req.headers?.['x-active-group']);

      if (activeGrpId) {
        const grpAccounts = await SavingsAccount.find({ groupId: activeGrpId }).select('_id');
        const grpAccountIds = grpAccounts.map(a => a._id);
        query.savingsAccountId = { $in: grpAccountIds };
      }
    } else if (groupId && groupId !== 'All') {
      const groupDoc = await Group.findById(groupId);
      if (groupDoc && groupDoc.memberIds?.length > 0) {
        query.memberId = { $in: groupDoc.memberIds };
      } else {
        query.memberId = new mongoose.Types.ObjectId();
      }
    }

    if (memberId && memberId !== 'All') {
      query.memberId = memberId;
    }
    if (savingsAccountId && savingsAccountId !== 'All') query.savingsAccountId = savingsAccountId;
    if (transactionType && transactionType !== 'All') query.transactionType = transactionType;

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: end
      };
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await SavingsTransaction.countDocuments(query);
    const transactions = await SavingsTransaction.find(query)
      .populate('memberId', 'fullName memberId phone')
      .populate('savingsAccountId', 'accountNumber accountType currentBalance')
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
      .populate('createdBy', 'firstName lastName name username')
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
    const isSuperAdmin = roleName === 'Super Admin';

    let query = { _id: req.params.accountId };
    if (['Branch Manager', 'Employee'].includes(roleName) && req.user.branchId) {
      query.branchId = req.user.branchId;
    } else if (roleName === 'Organization Admin' && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const account = await SavingsAccount.findOne(query)
      .populate('memberId', 'fullName memberId phone address category profileImage')
      .populate('branchId', 'branchName branchCode address district state')
      .populate('organizationId', 'name code address email phone')
      .populate('groupId', 'groupName groupCode groupType');

    if (!account) {
      return res.status(404).json({ success: false, error: 'Savings account not found or access denied.' });
    }

    if (roleName === 'Member') {
      const myMember = await Member.findOne({ 
        $or: [{ userId: req.user._id }, { phone: req.user.phone }, { email: req.user.email }] 
      });
      if (!myMember || account.memberId._id.toString() !== myMember._id.toString()) {
        return res.status(403).json({ success: false, error: 'Access denied to this passbook.' });
      }
    } else if (['President', 'Secretary', 'Treasurer'].includes(roleName)) {
      const activeGroupId = (req.query.groupId && req.query.groupId !== 'All') 
        ? req.query.groupId 
        : (req.user.groupId || req.headers?.['x-active-group']);

      let isAllowed = false;
      const accGrpId = (account.groupId?._id || account.groupId)?.toString();

      // 1. Allowed if the account belongs to the active group header or query
      if (accGrpId && activeGroupId && accGrpId === activeGroupId.toString()) {
        isAllowed = true;
      }

      // 2. Allowed if the user has an active RoleAssignment in this account's group
      if (!isAllowed && accGrpId) {
        const RoleAssignment = require('../models/RoleAssignment');
        const hasAssignment = await RoleAssignment.exists({
          userId: req.user._id,
          groupId: accGrpId,
          status: 'Active'
        });
        if (hasAssignment) isAllowed = true;
      }

      // 3. Allowed if user is recorded as leader/president/secretary/treasurer of this group
      if (!isAllowed && accGrpId) {
        const isGroupLeader = await Group.exists({
          _id: accGrpId,
          $or: [
            { presidentId: req.user._id },
            { leaderId: req.user._id },
            { secretaryId: req.user._id },
            { treasurerId: req.user._id }
          ]
        });
        if (isGroupLeader) isAllowed = true;
      }

      // 4. Allowed if it is the executive's personal passbook
      if (!isAllowed) {
        const myMember = await Member.findOne({ 
          $or: [{ userId: req.user._id }, { phone: req.user.phone }, { email: req.user.email }] 
        });
        if (myMember && (account.memberId?._id || account.memberId)?.toString() === myMember._id.toString()) {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied. You can only view passbooks belonging to your active group.' 
        });
      }
    }

    let txnQuery = { savingsAccountId: account._id, status: 'Completed' };
    if (req.query.startDate && req.query.endDate) {
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      txnQuery.transactionDate = {
        $gte: new Date(req.query.startDate),
        $lte: end
      };
    }

    const transactions = await SavingsTransaction.find(txnQuery)
      .sort({ transactionDate: 1, createdAt: 1 });

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

// @desc    Submit Member Deposit Request (Pending Treasurer Approval)
// @route   POST /api/v1/savings/deposit-request
// @access  Private (Member, Execs, Staff)
exports.submitDepositRequest = async (req, res, next) => {
  try {
    const { accountId, savingsAccountId, amount, paymentMethod, referenceNumber, remarks } = req.body;
    const targetAccountId = accountId || savingsAccountId;

    let account = null;
    if (targetAccountId) {
      account = await SavingsAccount.findById(targetAccountId);
    }

    if (!account) {
      const member = await Member.findOne({
        $or: [{ userId: req.user._id }, { phone: req.user.phone }, { email: req.user.email }],
        isDeleted: false
      });
      if (member) {
        account = await SavingsAccount.findOne({ memberId: member._id, status: 'Active' });
      }
    }

    if (!account) {
      return res.status(404).json({ success: false, error: 'Active savings account not found.' });
    }

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Deposit amount must be greater than 0.' });
    }

    const transactionId = await generateTransactionId(account.organizationId, 'DEP-REQ');
    const transaction = await SavingsTransaction.create({
      organizationId: account.organizationId,
      branchId: account.branchId,
      savingsAccountId: account._id,
      memberId: account.memberId,
      transactionId,
      transactionType: 'Deposit',
      amount: depositAmount,
      paymentMethod: paymentMethod || 'UPI',
      referenceNumber: referenceNumber || '',
      balanceAfterTransaction: account.currentBalance,
      transactionDate: new Date(),
      remarks: remarks || 'Member deposit request (Pending Treasurer Approval)',
      status: 'Pending',
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Deposit request of ₹' + depositAmount + ' submitted successfully! It is pending acceptance by the Group Treasurer.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Member Withdrawal Application (Pending Treasurer Approval)
// @route   POST /api/v1/savings/withdrawal-request
// @access  Private (Member, Execs, Staff)
exports.submitWithdrawalRequest = async (req, res, next) => {
  try {
    const { accountId, savingsAccountId, amount, paymentMethod, remarks } = req.body;
    const targetAccountId = accountId || savingsAccountId;

    let account = null;
    if (targetAccountId) {
      account = await SavingsAccount.findById(targetAccountId);
    }

    if (!account) {
      const member = await Member.findOne({
        $or: [{ userId: req.user._id }, { phone: req.user.phone }, { email: req.user.email }],
        isDeleted: false
      });
      if (member) {
        account = await SavingsAccount.findOne({ memberId: member._id, status: 'Active' });
      }
    }

    if (!account) {
      return res.status(404).json({ success: false, error: 'Active savings account not found.' });
    }

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Withdrawal amount must be greater than 0.' });
    }

    if (account.currentBalance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient savings balance. Available: ₹${account.currentBalance}, Requested: ₹${withdrawAmount}`
      });
    }

    const transactionId = await generateTransactionId(account.organizationId, 'WDL-REQ');
    const transaction = await SavingsTransaction.create({
      organizationId: account.organizationId,
      branchId: account.branchId,
      savingsAccountId: account._id,
      memberId: account.memberId,
      transactionId,
      transactionType: 'Withdrawal',
      amount: withdrawAmount,
      paymentMethod: paymentMethod || 'Cash',
      balanceAfterTransaction: account.currentBalance,
      transactionDate: new Date(),
      remarks: remarks || 'Member withdrawal application (Pending Treasurer Approval)',
      status: 'Pending',
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Withdrawal application of ₹' + withdrawAmount + ' submitted successfully! It will be disbursed upon Group Treasurer approval.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Pending Savings Deposit & Withdrawal Requests
// @route   GET /api/v1/savings/pending-requests
// @access  Private
exports.getPendingSavingsRequests = async (req, res, next) => {
  try {
    const { organizationId, branchId, groupId, memberId } = req.query;
    let query = { status: 'Pending' };

    if (req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    if (req.user.role === 'Member') {
      const myMember = await Member.findOne({
        $or: [{ userId: req.user._id }, { phone: req.user.phone }, { email: req.user.email }]
      });
      if (myMember) {
        query.memberId = myMember._id;
      } else {
        query.createdBy = req.user._id;
      }
    } else if (memberId && memberId !== 'All') {
      query.memberId = memberId;
    }

    if (groupId && groupId !== 'All') {
      const groupDoc = await Group.findById(groupId);
      if (groupDoc && groupDoc.memberIds?.length > 0) {
        query.memberId = { $in: groupDoc.memberIds };
      }
    }

    const pendingRequests = await SavingsTransaction.find(query)
      .populate('memberId', 'fullName memberId phone category')
      .populate('savingsAccountId', 'accountNumber currentBalance accountType')
      .populate('branchId', 'branchName branchCode')
      .populate('createdBy', 'name email username')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve and Execute Pending Deposit or Withdrawal Request
// @route   PUT /api/v1/savings/requests/:id/approve
// @access  Private (Treasurer, President, Branch Manager, Org Admin, Super Admin)
exports.approveSavingsRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await SavingsTransaction.findById(req.params.id).session(session);
    if (!transaction) {
      throw new Error('Transaction request not found.');
    }

    if (transaction.status !== 'Pending') {
      throw new Error(`Transaction is already ${transaction.status}.`);
    }

    const account = await SavingsAccount.findById(transaction.savingsAccountId).session(session);
    if (!account) {
      throw new Error('Savings account not found.');
    }

    let newBalance = account.currentBalance;
    if (transaction.transactionType === 'Deposit') {
      newBalance += transaction.amount;
    } else if (transaction.transactionType === 'Withdrawal') {
      if (account.currentBalance < transaction.amount) {
        throw new Error(`Insufficient funds. Available: ₹${account.currentBalance}, Requested: ₹${transaction.amount}`);
      }
      newBalance -= transaction.amount;
    }

    // Update Account
    account.currentBalance = newBalance;
    account.lastTransactionDate = new Date();
    await account.save({ session });

    // Update Transaction
    transaction.status = 'Completed';
    transaction.balanceAfterTransaction = newBalance;
    transaction.remarks = `${transaction.remarks || ''} (Approved by ${req.user.name || 'Treasurer'})`.trim();
    transaction.transactionDate = new Date();
    await transaction.save({ session });

    // Audit Log
    await AuditLog.create([{
      organizationId: transaction.organizationId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      action: transaction.transactionType === 'Deposit' ? 'APPROVE_SAVINGS_DEPOSIT' : 'APPROVE_SAVINGS_WITHDRAWAL',
      module: 'Savings Management',
      details: `Approved ${transaction.transactionType} of ₹${transaction.amount} for account ${account.accountNumber}`,
      ipAddress: req.ip || '127.0.0.1'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Post to accounting
    try {
      const cashAcc = await getAccountByCode(transaction.organizationId, '1010');
      const savingsPayableAcc = await getAccountByCode(transaction.organizationId, '2010');
      if (cashAcc && savingsPayableAcc) {
        if (transaction.transactionType === 'Deposit') {
          await recordTransaction({
            organizationId: transaction.organizationId,
            branchId: transaction.branchId,
            description: `Savings Deposit Approved: ${account.accountNumber} - ${transaction.transactionId}`,
            referenceType: 'SavingsDeposit',
            referenceId: transaction._id,
            date: new Date(),
            entries: [
              { accountId: cashAcc._id, type: 'Debit', amount: transaction.amount, description: `Cash received into ${account.accountNumber}` },
              { accountId: savingsPayableAcc._id, type: 'Credit', amount: transaction.amount, description: `Savings liability increase for ${account.accountNumber}` }
            ],
            createdBy: req.user._id
          });
        } else {
          await recordTransaction({
            organizationId: transaction.organizationId,
            branchId: transaction.branchId,
            description: `Savings Withdrawal Disbursed: ${account.accountNumber} - ${transaction.transactionId}`,
            referenceType: 'SavingsWithdrawal',
            referenceId: transaction._id,
            date: new Date(),
            entries: [
              { accountId: savingsPayableAcc._id, type: 'Debit', amount: transaction.amount, description: `Savings liability deduction for ${account.accountNumber}` },
              { accountId: cashAcc._id, type: 'Credit', amount: transaction.amount, description: `Cash disbursed from ${account.accountNumber}` }
            ],
            createdBy: req.user._id
          });
        }
      }
    } catch (accErr) {
      console.warn('[Accounting Posting Warning]', accErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `${transaction.transactionType} of ₹${transaction.amount} approved and executed successfully!`,
      data: {
        transaction,
        newBalance,
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Reject Pending Savings Request
// @route   PUT /api/v1/savings/requests/:id/reject
// @access  Private (Treasurer, President, Branch Manager, Org Admin, Super Admin)
exports.rejectSavingsRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const transaction = await SavingsTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction request not found.' });
    }

    if (transaction.status !== 'Pending') {
      return res.status(400).json({ success: false, error: `Transaction is already ${transaction.status}.` });
    }

    transaction.status = 'Rejected';
    transaction.remarks = `${transaction.remarks || ''} [Rejected: ${reason || 'Rejected by Treasurer'}]`.trim();
    await transaction.save();

    await AuditLog.create({
      organizationId: transaction.organizationId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      action: 'REJECT_SAVINGS_REQUEST',
      module: 'Savings Management',
      details: `Rejected ${transaction.transactionType} request of ₹${transaction.amount}. Reason: ${reason || 'Not specified'}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(200).json({
      success: true,
      message: `${transaction.transactionType} request has been rejected.`,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rollback / Void a Completed Savings Transaction
// @route   POST /api/v1/savings/transactions/:id/rollback
// @access  Private (Treasurer, President, Branch Manager, Org Admin, Super Admin)
exports.rollbackSavingsTransaction = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reason } = req.body;
    const transaction = await SavingsTransaction.findById(req.params.id).session(session);
    if (!transaction) {
      throw new Error('Transaction not found.');
    }

    if (transaction.status !== 'Completed') {
      throw new Error(`Cannot rollback a transaction with status "${transaction.status}". Only Completed transactions can be rolled back.`);
    }

    const account = await SavingsAccount.findById(transaction.savingsAccountId).session(session);
    if (!account) {
      throw new Error('Savings account associated with this transaction was not found.');
    }

    let newBalance = account.currentBalance;
    if (transaction.transactionType === 'Deposit' || transaction.transactionType === 'Interest') {
      if (account.currentBalance < transaction.amount) {
        throw new Error(`Cannot rollback deposit: account balance (₹${account.currentBalance}) is less than deposit amount (₹${transaction.amount}).`);
      }
      newBalance -= transaction.amount;
    } else if (transaction.transactionType === 'Withdrawal' || transaction.transactionType === 'Fee') {
      newBalance += transaction.amount;
    }

    // Update account balance
    account.currentBalance = newBalance;
    account.lastTransactionDate = new Date();
    await account.save({ session });

    // Update original transaction status to Reverted
    transaction.status = 'Reverted';
    transaction.remarks = `${transaction.remarks || ''} [Rollback by ${req.user.name || 'Treasurer'}: ${reason || 'Transaction Reversed'}]`.trim();
    await transaction.save({ session });

    // Audit Log
    const performerName = req.user.name || req.user.username || 'Treasurer';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Treasurer';

    await AuditLog.create([{
      organizationId: transaction.organizationId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: 'ROLLBACK_SAVINGS_TRANSACTION',
      module: 'Savings Management',
      details: `Rolled back ${transaction.transactionType} of ₹${transaction.amount} (Txn: ${transaction.transactionId}) for account ${account.accountNumber}. Reason: ${reason || 'Rollback requested'}`,
      description: `Rolled back ${transaction.transactionType} of ₹${transaction.amount} (Txn: ${transaction.transactionId}) for account ${account.accountNumber}`,
      ipAddress: req.ip || '127.0.0.1'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Reversal entries in accounting
    try {
      const cashAcc = await getAccountByCode(transaction.organizationId, '1010');
      const savingsPayableAcc = await getAccountByCode(transaction.organizationId, '2010');
      if (cashAcc && savingsPayableAcc) {
        if (transaction.transactionType === 'Deposit') {
          await recordTransaction({
            organizationId: transaction.organizationId,
            branchId: transaction.branchId,
            description: `Reversal of Deposit: ${account.accountNumber} - ${transaction.transactionId}`,
            referenceType: 'SavingsDepositReversal',
            referenceId: transaction._id,
            date: new Date(),
            entries: [
              { accountId: savingsPayableAcc._id, type: 'Debit', amount: transaction.amount, description: `Savings liability reversal for ${account.accountNumber}` },
              { accountId: cashAcc._id, type: 'Credit', amount: transaction.amount, description: `Cash refunded/reversed for ${account.accountNumber}` }
            ],
            createdBy: req.user._id
          });
        } else if (transaction.transactionType === 'Withdrawal') {
          await recordTransaction({
            organizationId: transaction.organizationId,
            branchId: transaction.branchId,
            description: `Reversal of Withdrawal: ${account.accountNumber} - ${transaction.transactionId}`,
            referenceType: 'SavingsWithdrawalReversal',
            referenceId: transaction._id,
            date: new Date(),
            entries: [
              { accountId: cashAcc._id, type: 'Debit', amount: transaction.amount, description: `Cash returned for ${account.accountNumber}` },
              { accountId: savingsPayableAcc._id, type: 'Credit', amount: transaction.amount, description: `Savings liability restored for ${account.accountNumber}` }
            ],
            createdBy: req.user._id
          });
        }
      }
    } catch (accErr) {
      console.warn('[Accounting Rollback Posting Warning]', accErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Transaction ${transaction.transactionId} rolled back successfully! New balance: ₹${newBalance}`,
      data: {
        transaction,
        newBalance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: error.message });
  }
};
