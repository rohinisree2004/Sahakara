const Loan = require('../models/Loan');
const LoanRepaymentSchedule = require('../models/LoanRepaymentSchedule');
const LoanRepaymentTransaction = require('../models/LoanRepaymentTransaction');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsTransaction = require('../models/SavingsTransaction');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const { calculateEMI } = require('../utils/emiCalculator');
const { getAccountByCode, recordTransaction } = require('../utils/accountingService');

// Helper to log audit actions
const logAction = async (req, action, resourceType, resourceId, details, orgId, branchId) => {
  try {
    const performerName = req.user.name || req.user.username || 'Staff';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';
    await AuditLog.create({
      organizationId: orgId || req.user.organizationId,
      branchId: branchId || req.user.branchId || null,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action,
      module: 'Loan Repayments',
      details: `${action}: ${details}`,
      description: `${action}: ${details}`,
      ipAddress: req.ip || '127.0.0.1',
    });
  } catch (err) {
    console.warn('Audit Log Warning:', err.message);
  }
};

// @desc    Generate EMI Schedule for a Loan
// @route   POST /api/v1/repayments/:loanId/generate-schedule
// @access  Private (Org Admin, Branch Manager, Super Admin)
exports.generateSchedule = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { startDate } = req.body;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    const query = { _id: loanId };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const loan = await Loan.findOne(query);

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    if (loan.status !== 'Disbursed' && loan.status !== 'Active') {
      return res.status(400).json({ success: false, error: 'Loan must be Disbursed or Active to generate schedule' });
    }

    // Check if schedule already exists
    const existing = await LoanRepaymentSchedule.findOne({ loanId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Repayment schedule already exists for this loan' });
    }

    const firstEmiDate = startDate ? new Date(startDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const principal = loan.disbursedAmount || loan.approvedAmount || loan.requestedAmount;
    const tenure = loan.tenure || 12;
    const rate = loan.interestRate || 12;

    const emiData = calculateEMI(principal, rate, tenure, firstEmiDate);

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

    if (loan.status === 'Disbursed') {
      loan.status = 'Active';
      await loan.save();
    }

    await logAction(req, 'GENERATE_SCHEDULE', 'Loan', loan._id, `Generated schedule with EMI of ₹${emiData.emiAmount}`, loan.organizationId, loan.branchId);

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

// @desc    Get EMI Schedule for a Loan (with Overdue auto-evaluation & Savings link)
// @route   GET /api/v1/repayments/loan/:loanId
// @access  Private (Members, Executives, Staff, Admins)
exports.getSchedule = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || roleName;
    const isSuperAdmin = effectiveRole === 'Super Admin' || req.user.role === 'Super Admin';

    const query = { _id: loanId };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const loan = await Loan.findOne(query)
      .populate('memberId', 'fullName memberId phone category gender profilePicture')
      .populate('loanTypeId', 'name interestRate')
      .populate('groupId', 'groupName groupCode leaderId presidentId treasurerId secretaryId')
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code');

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    let schedule = await LoanRepaymentSchedule.find({ loanId }).sort({ emiNumber: 1 });
    
    // Auto-generate if missing for active/disbursed loan
    if (schedule.length === 0 && (loan.status === 'Active' || loan.status === 'Disbursed')) {
      const firstEmiDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const principal = loan.disbursedAmount || loan.approvedAmount || loan.requestedAmount;
      const tenure = loan.tenure || 12;
      const rate = loan.interestRate || 12;

      const emiData = calculateEMI(principal, rate, tenure, firstEmiDate);
      const scheduleDocs = emiData.schedule.map(emi => ({
        organizationId: loan.organizationId?._id || loan.organizationId,
        branchId: loan.branchId?._id || loan.branchId,
        loanId: loan._id,
        memberId: loan.memberId?._id || loan.memberId,
        emiNumber: emi.emiNumber,
        dueDate: emi.dueDate,
        principalAmount: emi.principalAmount,
        interestAmount: emi.interestAmount,
        emiAmount: emi.emiAmount,
        remainingAmount: emi.remainingAmount,
        status: 'Upcoming'
      }));

      await LoanRepaymentSchedule.insertMany(scheduleDocs);
      schedule = await LoanRepaymentSchedule.find({ loanId }).sort({ emiNumber: 1 });
    }

    // Auto-update overdue status if due date passed and not paid
    const now = new Date();
    let hasOverdueUpdates = false;
    for (const emi of schedule) {
      if (emi.dueDate && new Date(emi.dueDate) < now && (emi.status === 'Upcoming' || emi.status === 'Due')) {
        emi.status = 'Overdue';
        await emi.save();
        hasOverdueUpdates = true;
      }
    }
    if (hasOverdueUpdates) {
      schedule = await LoanRepaymentSchedule.find({ loanId }).sort({ emiNumber: 1 });
    }

    // Resolve Member's Savings Account for Auto-Deduction display
    const borrowerMemberId = loan.memberId?._id || loan.memberId;
    let savingsAccount = null;
    if (borrowerMemberId) {
      const targetGroupId = loan.groupId?._id || loan.groupId;
      if (targetGroupId) {
        savingsAccount = await SavingsAccount.findOne({
          memberId: borrowerMemberId,
          groupId: targetGroupId,
          status: 'Active',
          isDeleted: { $ne: true }
        });
      }
      if (!savingsAccount) {
        savingsAccount = await SavingsAccount.findOne({
          memberId: borrowerMemberId,
          status: 'Active',
          isDeleted: { $ne: true }
        });
      }
    }

    // Calculate summaries
    const totalPaid = schedule.reduce((sum, emi) => sum + (emi.paidAmount || 0), 0);
    const totalDue = schedule.reduce((sum, emi) => sum + (emi.emiAmount || 0), 0);
    const nextUnpaidEmi = schedule.find(e => e.status !== 'Paid' && e.status !== 'Waived' && e.status !== 'Auto-Deducted from Savings');
    const overdueCount = schedule.filter(e => e.status === 'Overdue').length;
    const unpaidCount = schedule.filter(e => e.status !== 'Paid' && e.status !== 'Waived' && e.status !== 'Auto-Deducted from Savings').length;

    // Auto-heal/sync loan status if all EMIs are settled but loan is still Active/Disbursed
    if (unpaidCount === 0 && (loan.status === 'Active' || loan.status === 'Disbursed')) {
      loan.status = 'Closed';
      loan.outstandingAmount = 0;
      loan.closureDate = loan.closureDate || new Date();
      loan.closureRemarks = loan.closureRemarks || 'All installments settled';
      await loan.save();
    }

    res.status(200).json({
      success: true,
      data: {
        loan,
        schedule,
        savingsAccount: savingsAccount ? {
          _id: savingsAccount._id,
          accountNumber: savingsAccount.accountNumber,
          currentBalance: savingsAccount.currentBalance,
          accountType: savingsAccount.accountType
        } : null,
        summary: {
          totalPayable: totalDue,
          totalPaid,
          outstandingBalance: Math.max(0, totalDue - totalPaid),
          nextEmi: nextUnpaidEmi || null,
          overdueCount
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record Repayment (Cash, Bank Transfer, Counter Deposit)
// @route   POST /api/v1/repayments
// @access  Private (Treasurer, Manager, Super Admin)
exports.recordRepayment = async (req, res, next) => {
  try {
    const { loanId, emiNumber, amount, paymentMethod, referenceNumber, remarks } = req.body;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    if (!loanId || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'Loan, repayment amount, and payment channel are required' });
    }

    const query = { _id: loanId };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const loan = await Loan.findOne(query);

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }
    
    if (loan.status !== 'Active' && loan.status !== 'Disbursed') {
      return res.status(400).json({ success: false, error: `Cannot record payment for loan in ${loan.status} status` });
    }

    let emi = null;
    if (emiNumber) {
      emi = await LoanRepaymentSchedule.findOne({ loanId, emiNumber });
    } else {
      // Find earliest unpaid EMI
      emi = await LoanRepaymentSchedule.findOne({ 
        loanId, 
        status: { $in: ['Overdue', 'Due', 'Upcoming', 'Partially Paid'] } 
      }).sort({ emiNumber: 1 });
    }

    if (!emi) {
      return res.status(400).json({ success: false, error: 'No active unpaid EMI found for this loan' });
    }

    if (emi.status === 'Paid' || emi.status === 'Waived' || emi.status === 'Auto-Deducted from Savings') {
      return res.status(400).json({ success: false, error: 'Selected EMI is already fully paid or waived' });
    }

    const payAmount = Number(amount);
    const targetOrgId = loan.organizationId;
    const targetBranchId = loan.branchId;

    // Process payment
    const transactionId = 'REP' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    
    // Update loan outstanding
    loan.outstandingAmount = Math.max(0, (loan.outstandingAmount || 0) - payAmount);
    
    const txn = await LoanRepaymentTransaction.create({
      organizationId: targetOrgId,
      branchId: targetBranchId,
      loanId: loan._id,
      memberId: loan.memberId,
      emiId: emi._id,
      transactionId,
      amount: payAmount,
      paymentMethod: paymentMethod || 'Cash',
      referenceNumber: referenceNumber || 'Counter Payment',
      balanceAfterTransaction: loan.outstandingAmount,
      recordedBy: req.user._id,
      remarks,
    });

    // Update EMI status
    emi.paidAmount = (emi.paidAmount || 0) + payAmount;
    if (emi.paidAmount >= emi.emiAmount) {
      emi.status = 'Paid';
    } else {
      emi.status = 'Partially Paid';
    }
    emi.paidDate = new Date();
    emi.paymentMethod = paymentMethod || 'Cash';
    await emi.save();
    
    // Check if all EMIs are paid to auto-close loan
    const remainingUnpaid = await LoanRepaymentSchedule.countDocuments({
      loanId: loan._id,
      status: { $nin: ['Paid', 'Waived', 'Auto-Deducted from Savings'] }
    });

    if (remainingUnpaid === 0) {
      loan.status = 'Closed';
      loan.outstandingAmount = 0;
      loan.closureDate = new Date();
      loan.closedBy = req.user._id;
      loan.closureRemarks = 'Automatically closed upon full settlement of all installments.';
    }

    await loan.save();

    await logAction(req, 'RECORD_REPAYMENT', 'LoanRepaymentTransaction', txn._id, `Recorded payment of ₹${payAmount} for EMI ${emi.emiNumber} of Loan ${loan.applicationId}`, targetOrgId, targetBranchId);

    // ----------------------------------------------------
    // Post to Accounting (Module 13 Integration)
    // ----------------------------------------------------
    try {
      const cashAcc = await getAccountByCode(targetOrgId, '1010');
      const loanAssetAcc = await getAccountByCode(targetOrgId, '1030');
      const interestIncAcc = await getAccountByCode(targetOrgId, '4010');
      
      const principalPortion = Math.min(payAmount, emi.principalAmount);
      const interestPortion = Math.max(0, payAmount - principalPortion);

      if (cashAcc && loanAssetAcc) {
        const entries = [
          {
            accountId: cashAcc._id,
            type: 'Debit',
            amount: payAmount,
            description: `Cash received for EMI ${emi.emiNumber} - Loan ${loan.applicationId}`
          },
          {
            accountId: loanAssetAcc._id,
            type: 'Credit',
            amount: principalPortion,
            description: `Principal recovery for Loan ${loan.applicationId}`
          }
        ];

        if (interestPortion > 0 && interestIncAcc) {
          entries.push({
            accountId: interestIncAcc._id,
            type: 'Credit',
            amount: interestPortion,
            description: `Interest income on EMI ${emi.emiNumber} - Loan ${loan.applicationId}`
          });
        }

        await recordTransaction({
          organizationId: targetOrgId,
          branchId: targetBranchId,
          description: `Loan Repayment: ${loan.applicationId} - EMI ${emi.emiNumber}`,
          referenceType: 'LoanRepayment',
          referenceId: txn._id,
          date: new Date(),
          entries,
          createdBy: req.user._id
        });
      }
    } catch (accErr) {
      console.warn('[Accounting Posting Warning]', accErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Repayment voucher recorded successfully',
      data: txn
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Auto-Deduct Overdue / Due EMI directly from Borrower's Savings Account
// @route   POST /api/v1/repayments/deduct-from-savings
// @access  Private (Treasurer, President, Branch Manager, Org Admin, Super Admin)
exports.deductEmiFromSavings = async (req, res, next) => {
  try {
    const { loanId, emiNumber, emiId, remarks } = req.body;
    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || roleName;
    const isSuperAdmin = effectiveRole === 'Super Admin' || req.user.role === 'Super Admin';

    if (!loanId) {
      return res.status(400).json({ success: false, error: 'Loan ID is required' });
    }

    const query = { _id: loanId };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const loan = await Loan.findOne(query)
      .populate('memberId')
      .populate('groupId');

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan application not found' });
    }

    if (loan.status !== 'Active' && loan.status !== 'Disbursed') {
      return res.status(400).json({ success: false, error: `Cannot deduct EMI for loan in '${loan.status}' status.` });
    }

    // Find specific EMI or earliest unpaid/overdue EMI
    let emi = null;
    if (emiId) {
      emi = await LoanRepaymentSchedule.findById(emiId);
    } else if (emiNumber) {
      emi = await LoanRepaymentSchedule.findOne({ loanId: loan._id, emiNumber });
    } else {
      emi = await LoanRepaymentSchedule.findOne({
        loanId: loan._id,
        status: { $in: ['Overdue', 'Due', 'Upcoming', 'Partially Paid'] }
      }).sort({ emiNumber: 1 });
    }

    if (!emi) {
      return res.status(400).json({ success: false, error: 'No unpaid or overdue EMI found for this loan.' });
    }

    if (emi.status === 'Paid' || emi.status === 'Waived' || emi.status === 'Auto-Deducted from Savings') {
      return res.status(400).json({ success: false, error: `EMI #${emi.emiNumber} is already settled.` });
    }

    const borrowerMemberId = loan.memberId?._id || loan.memberId;
    const amountToDeduct = Math.max(0, (emi.emiAmount || 0) - (emi.paidAmount || 0));

    if (amountToDeduct <= 0) {
      return res.status(400).json({ success: false, error: 'EMI has no outstanding amount to deduct.' });
    }

    // Find member's Savings Account (prioritizing group savings account)
    const targetGroupId = loan.groupId?._id || loan.groupId;
    let savingsAccount = null;
    if (targetGroupId) {
      savingsAccount = await SavingsAccount.findOne({
        memberId: borrowerMemberId,
        groupId: targetGroupId,
        status: 'Active',
        isDeleted: { $ne: true }
      });
    }

    if (!savingsAccount) {
      savingsAccount = await SavingsAccount.findOne({
        memberId: borrowerMemberId,
        status: 'Active',
        isDeleted: { $ne: true }
      });
    }

    if (!savingsAccount) {
      return res.status(404).json({
        success: false,
        error: `No active savings or thrift account found for member ${loan.memberId?.fullName || 'Borrower'}.`
      });
    }

    // Check balance
    if (savingsAccount.currentBalance < amountToDeduct) {
      return res.status(400).json({
        success: false,
        error: `Insufficient savings balance. Member has ₹${savingsAccount.currentBalance.toLocaleString('en-IN')}, but EMI #${emi.emiNumber} requires ₹${amountToDeduct.toLocaleString('en-IN')}.`
      });
    }

    // 1. Deduct from savings balance
    savingsAccount.currentBalance = Math.max(0, savingsAccount.currentBalance - amountToDeduct);
    await savingsAccount.save();

    // 2. Create SavingsTransaction (Withdrawal / Debit - Reflects on Member Passbook)
    const savingsTxnId = 'TXN-SAV-REC-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    const savingsTxn = await SavingsTransaction.create({
      organizationId: loan.organizationId?._id || loan.organizationId,
      branchId: loan.branchId?._id || loan.branchId || savingsAccount.branchId,
      savingsAccountId: savingsAccount._id,
      memberId: borrowerMemberId,
      groupId: targetGroupId || savingsAccount.groupId || null,
      transactionId: savingsTxnId,
      transactionType: 'Withdrawal',
      paymentMethod: 'Savings Auto-Debit',
      amount: amountToDeduct,
      referenceNumber: `EMI Auto-Recovery: ${loan.applicationId} #${emi.emiNumber}`,
      balanceAfterTransaction: savingsAccount.currentBalance,
      transactionDate: new Date(),
      remarks: remarks || `Loan EMI #${emi.emiNumber} Auto-Debit for ${loan.applicationId} by ${req.user.name} (${effectiveRole})`,
      status: 'Completed',
      createdBy: req.user._id
    });

    // 3. Create LoanRepaymentTransaction
    const loanTxnId = 'REP-SAV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    loan.outstandingAmount = Math.max(0, (loan.outstandingAmount || 0) - amountToDeduct);
    
    const loanTxn = await LoanRepaymentTransaction.create({
      organizationId: loan.organizationId?._id || loan.organizationId,
      branchId: loan.branchId?._id || loan.branchId,
      loanId: loan._id,
      memberId: borrowerMemberId,
      emiId: emi._id,
      transactionId: loanTxnId,
      amount: amountToDeduct,
      paymentMethod: 'Savings Account Auto-Debit',
      referenceNumber: savingsTxnId,
      balanceAfterTransaction: loan.outstandingAmount,
      recordedBy: req.user._id,
      remarks: remarks || `Auto-recovered from Thrift Savings A/c ${savingsAccount.accountNumber} by ${req.user.name} (${effectiveRole})`
    });

    // 4. Update EMI schedule doc
    emi.paidAmount = (emi.paidAmount || 0) + amountToDeduct;
    emi.status = 'Paid';
    emi.paidDate = new Date();
    emi.paymentMethod = 'Savings Account Auto-Debit';
    emi.deductedFromSavingsAccountId = savingsAccount._id;
    emi.deductedBy = req.user._id;
    emi.deductedAt = new Date();
    emi.remarks = remarks || `Auto-deducted from Savings A/c ${savingsAccount.accountNumber}`;
    await emi.save();

    // 5. Check if all EMIs are settled to auto-close loan
    const remainingUnpaid = await LoanRepaymentSchedule.countDocuments({
      loanId: loan._id,
      status: { $nin: ['Paid', 'Waived', 'Auto-Deducted from Savings'] }
    });

    if (remainingUnpaid === 0) {
      loan.status = 'Closed';
      loan.outstandingAmount = 0;
      loan.closureDate = new Date();
      loan.closedBy = req.user._id;
      loan.closureRemarks = 'Automatically closed upon final EMI auto-deduction from savings.';
    }
    await loan.save();

    // 6. Audit Log
    await logAction(
      req,
      'AUTO_DEDUCT_SAVINGS_EMI',
      'LoanRepaymentSchedule',
      emi._id,
      `Auto-deducted ₹${amountToDeduct} for EMI #${emi.emiNumber} of Loan ${loan.applicationId} from Savings A/c ${savingsAccount.accountNumber}`,
      loan.organizationId,
      loan.branchId
    );

    // 7. Post to double-entry accounting
    try {
      const savingsLiabilityAcc = await getAccountByCode(loan.organizationId, '2010'); // Savings Deposit Liability
      const loanAssetAcc = await getAccountByCode(loan.organizationId, '1030'); // Loan Portfolio Asset
      const interestIncAcc = await getAccountByCode(loan.organizationId, '4010'); // Interest Income

      const principalPortion = Math.min(amountToDeduct, emi.principalAmount);
      const interestPortion = Math.max(0, amountToDeduct - principalPortion);

      if (savingsLiabilityAcc && loanAssetAcc) {
        const entries = [
          {
            accountId: savingsLiabilityAcc._id,
            type: 'Debit',
            amount: amountToDeduct,
            description: `Auto-debit from savings for EMI ${emi.emiNumber} - Loan ${loan.applicationId}`
          },
          {
            accountId: loanAssetAcc._id,
            type: 'Credit',
            amount: principalPortion,
            description: `Principal recovery for Loan ${loan.applicationId}`
          }
        ];

        if (interestPortion > 0 && interestIncAcc) {
          entries.push({
            accountId: interestIncAcc._id,
            type: 'Credit',
            amount: interestPortion,
            description: `Interest income on EMI ${emi.emiNumber} - Loan ${loan.applicationId}`
          });
        }

        await recordTransaction({
          organizationId: loan.organizationId,
          branchId: loan.branchId,
          description: `Savings Auto-Debit EMI: ${loan.applicationId} - EMI ${emi.emiNumber}`,
          referenceType: 'LoanRepayment',
          referenceId: loanTxn._id,
          date: new Date(),
          entries,
          createdBy: req.user._id
        });
      }
    } catch (accErr) {
      console.warn('[Accounting Posting Warning]', accErr.message);
    }

    res.status(200).json({
      success: true,
      message: `EMI #${emi.emiNumber} of ₹${amountToDeduct.toLocaleString('en-IN')} successfully deducted from member's savings account!`,
      data: {
        emi,
        loanTxn,
        savingsTxn,
        savingsAccount: {
          accountNumber: savingsAccount.accountNumber,
          remainingBalance: savingsAccount.currentBalance
        },
        loanOutstanding: loan.outstandingAmount,
        loanStatus: loan.status
      }
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
    const { branchId, days = 30, groupId, memberId } = req.query;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + Number(days));

    const query = {
      status: { $in: ['Upcoming', 'Due'] },
      dueDate: { $gte: now, $lte: futureDate }
    };

    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    } else if (!isSuperAdmin && req.user.branchId && roleName !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    if (groupId && groupId !== 'All') {
      const group = await Group.findById(groupId);
      if (group?.memberIds?.length > 0) {
        query.memberId = { $in: group.memberIds };
      }
    }

    if (memberId && memberId !== 'All') {
      query.memberId = memberId;
    } else if (roleName === 'Member') {
      const myMember = await Member.findOne({ userId: req.user._id });
      if (myMember) query.memberId = myMember._id;
    }

    const upcoming = await LoanRepaymentSchedule.find(query)
      .populate('memberId', 'fullName memberId phone category')
      .populate('loanId', 'applicationId principalAmount disbursedAmount tenure interestRate')
      .populate('branchId', 'branchName branchCode')
      .sort({ dueDate: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Overdue EMIs
// @route   GET /api/v1/repayments/overdue
// @access  Private
exports.getOverdueEMIs = async (req, res, next) => {
  try {
    const { branchId, groupId, memberId } = req.query;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    const now = new Date();

    const query = {
      $or: [
        { status: 'Overdue' },
        { status: { $in: ['Upcoming', 'Due', 'Partially Paid'] }, dueDate: { $lt: now } }
      ]
    };

    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    } else if (!isSuperAdmin && req.user.branchId && roleName !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    if (groupId && groupId !== 'All') {
      const group = await Group.findById(groupId);
      if (group?.memberIds?.length > 0) {
        query.memberId = { $in: group.memberIds };
      }
    }

    if (memberId && memberId !== 'All') {
      query.memberId = memberId;
    } else if (roleName === 'Member') {
      const myMember = await Member.findOne({ userId: req.user._id });
      if (myMember) query.memberId = myMember._id;
    }

    const overdue = await LoanRepaymentSchedule.find(query)
      .populate('memberId', 'fullName memberId phone category')
      .populate('loanId', 'applicationId principalAmount disbursedAmount tenure interestRate')
      .populate('branchId', 'branchName branchCode')
      .sort({ dueDate: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: overdue.length,
      data: overdue
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Repayment Transactions
// @route   GET /api/v1/repayments/transactions
// @access  Private
exports.getRepaymentTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, loanId, memberId, branchId, startDate, endDate } = req.query;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    const query = {};

    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    } else if (!isSuperAdmin && req.user.branchId && roleName !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    if (loanId) query.loanId = loanId;
    
    if (memberId && memberId !== 'All') {
      query.memberId = memberId;
    } else if (roleName === 'Member') {
      const myMember = await Member.findOne({ userId: req.user._id });
      if (myMember) query.memberId = myMember._id;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const total = await LoanRepaymentTransaction.countDocuments(query);
    const transactions = await LoanRepaymentTransaction.find(query)
      .populate('memberId', 'fullName memberId phone')
      .populate('loanId', 'applicationId principalAmount')
      .populate('emiId', 'emiNumber dueDate')
      .populate('recordedBy', 'name username role')
      .sort({ paymentDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Close Loan Formally
// @route   POST /api/v1/repayments/:loanId/close
// @access  Private (Treasurer, President, Org Admin, Branch Manager, Super Admin)
exports.closeLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { remarks, settleRemaining } = req.body;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    const query = { _id: loanId };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const loan = await Loan.findOne(query);

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    if (loan.status === 'Closed') {
      return res.status(400).json({ success: false, error: `Loan ${loan.applicationId} is already closed.` });
    }

    const unpaidEMIs = await LoanRepaymentSchedule.countDocuments({
      loanId,
      status: { $nin: ['Paid', 'Waived', 'Auto-Deducted from Savings'] }
    });

    if (unpaidEMIs > 0) {
      if (settleRemaining) {
        // Mark all remaining EMIs as Waived / Settled
        await LoanRepaymentSchedule.updateMany(
          {
            loanId,
            status: { $nin: ['Paid', 'Waived', 'Auto-Deducted from Savings'] }
          },
          {
            $set: {
              status: 'Waived',
              remarks: `Waived upon formal loan closure by ${req.user.name || 'Treasurer'}.`,
              paidDate: new Date()
            }
          }
        );
      } else {
        return res.status(400).json({ 
          success: false, 
          error: `Cannot close loan: ${unpaidEMIs} unpaid EMI installment(s) remaining. Settle all installments or choose settle remaining to proceed.` 
        });
      }
    }

    loan.status = 'Closed';
    loan.outstandingAmount = 0;
    loan.closureDate = new Date();
    loan.closedBy = req.user._id;
    loan.closureRemarks = remarks || 'Formally closed by Treasurer / Executive.';
    await loan.save();

    await logAction(req, 'CLOSE_LOAN', 'Loan', loan._id, `Formally closed loan ${loan.applicationId}. Remarks: ${loan.closureRemarks}`, loan.organizationId, loan.branchId);

    res.status(200).json({
      success: true,
      message: `Loan ${loan.applicationId} successfully closed with zero outstanding balance.`,
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
    const { branchId, groupId, memberId } = req.query;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';

    const query = {};

    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    } else if (!isSuperAdmin && req.user.branchId && roleName !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    if (groupId && groupId !== 'All') {
      const group = await Group.findById(groupId);
      if (group?.memberIds?.length > 0) {
        query.memberId = { $in: group.memberIds };
      }
    }

    if (memberId && memberId !== 'All') {
      query.memberId = memberId;
    } else if (roleName === 'Member') {
      const myMember = await Member.findOne({ userId: req.user._id });
      if (myMember) query.memberId = myMember._id;
    }

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
      if (s._id === 'Paid' || s._id === 'Auto-Deducted from Savings') emiSummary.paid = { count: s.count, amount: s.totalAmount };
      else if (s._id === 'Overdue') emiSummary.overdue = { count: emiSummary.overdue.count + s.count, amount: emiSummary.overdue.amount + s.totalAmount };
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
