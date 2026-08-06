const Loan = require('../models/Loan');
const LoanType = require('../models/LoanType');
const LoanReview = require('../models/LoanReview');
const LoanDocument = require('../models/LoanDocument');
const Member = require('../models/Member');
const SavingsAccount = require('../models/SavingsAccount');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const { getAccountByCode, recordTransaction } = require('../utils/accountingService');

// Generate unique ID like LOAN-2026-00001
const generateLoanId = async (organizationId) => {
  const currentYear = new Date().getFullYear();
  const prefix = `LOAN-${currentYear}-`;
  
  const lastLoan = await Loan.findOne({
    organizationId,
    applicationId: new RegExp(`^${prefix}`)
  }).sort({ applicationId: -1 });

  let sequenceNumber = 1;
  if (lastLoan && lastLoan.applicationId) {
    const lastSequence = parseInt(lastLoan.applicationId.replace(prefix, ''), 10);
    if (!isNaN(lastSequence)) {
      sequenceNumber = lastSequence + 1;
    }
  }

  return `${prefix}${String(sequenceNumber).padStart(5, '0')}`;
};

// ==========================================
// LOAN TYPES MANAGEMENT
// ==========================================

exports.createLoanType = async (req, res) => {
  try {
    const { name, description, interestRate, minimumAmount, maximumAmount, maximumTenure } = req.body;

    // Check if exists
    const existing = await LoanType.findOne({ organizationId: req.user.organizationId, name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Loan Type with this name already exists' });
    }

    const loanType = await LoanType.create({
      organizationId: req.user.organizationId,
      name,
      description,
      interestRate,
      minimumAmount,
      maximumAmount,
      maximumTenure,
      createdBy: req.user._id
    });

    await AuditLog.create({
      organizationId: req.user.organizationId,
      userId: req.user._id,
      action: 'Create',
      module: 'Loan Types',
      description: `Created new loan type: ${name}`,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: loanType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoanTypes = async (req, res) => {
  try {
    const query = { organizationId: req.user.organizationId };
    if (req.query.status) query.status = req.query.status;

    const loanTypes = await LoanType.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: loanTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LOAN ELIGIBILITY ALGORITHM
// ==========================================

const checkEligibility = async (organizationId, memberId, loanTypeId, requestedAmount) => {
  // 1. Check if member exists and is active
  const member = await Member.findOne({ _id: memberId, organizationId, status: 'Active' });
  if (!member) {
    return { isEligible: false, reason: 'Member not found or inactive.' };
  }

  // 2. Validate against LoanType limits
  const loanType = await LoanType.findOne({ _id: loanTypeId, organizationId, status: 'Active' });
  if (!loanType) {
    return { isEligible: false, reason: 'Invalid or inactive loan type.' };
  }
  if (requestedAmount < loanType.minimumAmount || requestedAmount > loanType.maximumAmount) {
    return { isEligible: false, reason: `Requested amount must be between ₹${loanType.minimumAmount} and ₹${loanType.maximumAmount}.` };
  }

  // 3. Check Savings Balance (Specialized Algorithm: Eligible for up to 10x savings balance)
  const savingsAccounts = await SavingsAccount.find({ memberId, organizationId, status: 'Active' });
  const totalSavings = savingsAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
  
  const maxEligibleBasedOnSavings = totalSavings * 10;
  
  // 4. Check existing active loans for this member to deduct from their max eligibility
  const existingLoans = await Loan.find({ 
    memberId, 
    organizationId, 
    status: { $in: ['Approved', 'Disbursed', 'Active'] } 
  });
  
  const totalOutstanding = existingLoans.reduce((acc, curr) => acc + curr.outstandingAmount, 0);
  const adjustedMaxEligible = Math.max(0, maxEligibleBasedOnSavings - totalOutstanding);

  if (requestedAmount > adjustedMaxEligible) {
    return { 
      isEligible: false, 
      reason: `Requested amount exceeds eligibility. Savings: ₹${totalSavings}. Max Allowed: ₹${maxEligibleBasedOnSavings}. Outstanding: ₹${totalOutstanding}. Adjusted Max: ₹${adjustedMaxEligible}.`
    };
  }

  return {
    isEligible: true,
    details: { totalSavings, totalOutstanding, adjustedMaxEligible, maxEligibleBasedOnSavings }
  };
};

exports.checkLoanEligibility = async (req, res) => {
  try {
    const { memberId, loanTypeId, requestedAmount } = req.body;
    const result = await checkEligibility(req.user.organizationId, memberId, loanTypeId, Number(requestedAmount));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LOAN APPLICATION & MANAGEMENT
// ==========================================

exports.applyForLoan = async (req, res) => {
  try {
    const { memberId, loanTypeId, requestedAmount, tenure, purpose, remarks } = req.body;
    
    // Determine branch (from body if admin applying for someone, or from user context)
    const branchId = req.user.role === 'Super Admin' || req.user.role === 'Organization Admin' 
      ? req.body.branchId || req.user.branchId 
      : req.user.branchId;

    if (!branchId) {
      return res.status(400).json({ success: false, message: 'Branch ID is required' });
    }

    // Run eligibility algorithm
    const eligibility = await checkEligibility(req.user.organizationId, memberId, loanTypeId, Number(requestedAmount));
    if (!eligibility.isEligible) {
      return res.status(400).json({ success: false, message: eligibility.reason });
    }

    const loanType = await LoanType.findById(loanTypeId);
    if (Number(tenure) > loanType.maximumTenure) {
      return res.status(400).json({ success: false, message: `Tenure exceeds maximum allowed (${loanType.maximumTenure} months).` });
    }

    const applicationId = await generateLoanId(req.user.organizationId);

    const loan = await Loan.create({
      organizationId: req.user.organizationId,
      branchId,
      memberId,
      loanTypeId,
      applicationId,
      requestedAmount: Number(requestedAmount),
      interestRate: loanType.interestRate,
      tenure: Number(tenure),
      purpose,
      remarks,
      createdBy: req.user._id,
      status: 'Pending'
    });

    await AuditLog.create({
      organizationId: req.user.organizationId,
      branchId,
      userId: req.user._id,
      action: 'Apply',
      module: 'Loan Management',
      description: `Submitted loan application ${applicationId} for member ${memberId}`,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, memberId, branchId } = req.query;
    
    const query = { organizationId: req.user.organizationId };
    
    if (status) query.status = status;
    if (memberId) query.memberId = memberId;
    
    // Branch scoping
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    } else if (branchId) {
      query.branchId = branchId;
    }

    const loans = await Loan.find(query)
      .populate('memberId', 'fullName memberId')
      .populate('loanTypeId', 'name')
      .populate('branchId', 'branchName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Loan.countDocuments(query);

    res.status(200).json({
      success: true,
      data: loans,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const query = { _id: req.params.id, organizationId: req.user.organizationId };
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    const loan = await Loan.findOne(query)
      .populate('memberId')
      .populate('loanTypeId')
      .populate('branchId', 'branchName branchCode')
      .populate('approvedBy', 'fullName')
      .populate('disbursedBy', 'fullName')
      .populate('createdBy', 'fullName');

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    const reviews = await LoanReview.find({ loanId: loan._id }).populate('reviewerId', 'fullName role').sort({ createdAt: -1 });
    const documents = await LoanDocument.find({ loanId: loan._id });

    // Calculate dynamic eligibility snapshot for the frontend details page
    let eligibilitySnapshot = null;
    if (loan.status === 'Pending' || loan.status === 'Under Review') {
       eligibilitySnapshot = await checkEligibility(req.user.organizationId, loan.memberId._id, loan.loanTypeId._id, loan.requestedAmount);
    }

    res.status(200).json({ 
      success: true, 
      data: { loan, reviews, documents, eligibilitySnapshot } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LOAN REVIEWS & APPROVALS
// ==========================================

exports.reviewLoan = async (req, res) => {
  try {
    const { action, remarks } = req.body;
    // action: 'Started Review', 'Recommended', 'Returned for Correction', 'Requested Additional Docs'
    
    const query = { _id: req.params.id, organizationId: req.user.organizationId };
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }
    const loan = await Loan.findOne(query);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (action === 'Recommended') {
      loan.status = 'Recommended';
    } else if (action === 'Started Review' && loan.status === 'Pending') {
      loan.status = 'Under Review';
    } else if (action === 'Returned for Correction') {
      loan.status = 'Pending';
    }

    loan.updatedBy = req.user._id;
    await loan.save();

    await LoanReview.create({
      organizationId: req.user.organizationId,
      loanId: loan._id,
      reviewerId: req.user._id,
      action,
      remarks
    });

    res.status(200).json({ success: true, message: 'Review added successfully', data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const { approvedAmount, remarks } = req.body;

    const query = { _id: req.params.id, organizationId: req.user.organizationId };
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    const loan = await Loan.findOne(query);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (loan.status === 'Approved' || loan.status === 'Rejected' || loan.status === 'Disbursed' || loan.status === 'Active' || loan.status === 'Closed') {
      return res.status(400).json({ success: false, message: `Cannot approve loan in ${loan.status} status` });
    }

    loan.status = 'Approved';
    loan.approvedAmount = Number(approvedAmount) || loan.requestedAmount;
    loan.approvalDate = new Date();
    loan.approvedBy = req.user._id;
    loan.updatedBy = req.user._id;
    
    await loan.save();

    await LoanReview.create({
      organizationId: req.user.organizationId,
      loanId: loan._id,
      reviewerId: req.user._id,
      action: 'Approved',
      remarks
    });

    await AuditLog.create({
      organizationId: req.user.organizationId,
      branchId: loan.branchId,
      userId: req.user._id,
      action: 'Approve',
      module: 'Loan Management',
      description: `Approved loan application ${loan.applicationId} for ₹${loan.approvedAmount}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Loan approved successfully', data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectLoan = async (req, res) => {
  try {
    const { remarks } = req.body;
    if (!remarks) return res.status(400).json({ success: false, message: 'Rejection reason (remarks) is required' });

    const query = { _id: req.params.id, organizationId: req.user.organizationId };
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    const loan = await Loan.findOne(query);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (loan.status === 'Disbursed' || loan.status === 'Active' || loan.status === 'Closed') {
      return res.status(400).json({ success: false, message: `Cannot reject loan in ${loan.status} status` });
    }

    loan.status = 'Rejected';
    loan.rejectionReason = remarks;
    loan.updatedBy = req.user._id;
    await loan.save();

    await LoanReview.create({
      organizationId: req.user.organizationId,
      loanId: loan._id,
      reviewerId: req.user._id,
      action: 'Rejected',
      remarks
    });

    await AuditLog.create({
      organizationId: req.user.organizationId,
      branchId: loan.branchId,
      userId: req.user._id,
      action: 'Reject',
      module: 'Loan Management',
      description: `Rejected loan application ${loan.applicationId}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Loan rejected successfully', data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LOAN DISBURSEMENT
// ==========================================

exports.disburseLoan = async (req, res) => {
  try {
    const { disbursementAmount, paymentMethod, referenceNumber, remarks } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const query = { _id: req.params.id, organizationId: req.user.organizationId };
      if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
        query.branchId = req.user.branchId;
      }
      
      const loan = await Loan.findOne(query).session(session);
      if (!loan) throw new Error('Loan not found');

      if (loan.status !== 'Approved') {
        throw new Error(`Cannot disburse loan in ${loan.status} status. Loan must be Approved.`);
      }

      const dAmount = Number(disbursementAmount);
      if (dAmount <= 0 || dAmount > loan.approvedAmount) {
        throw new Error(`Invalid disbursement amount. Must be between 1 and ${loan.approvedAmount}`);
      }

      loan.status = 'Active'; // Shift to Active after disbursement
      loan.disbursedAmount = dAmount;
      loan.outstandingAmount = dAmount; // Outstanding starts equal to disbursed (before interest/repayment)
      loan.disbursementDate = new Date();
      loan.disbursedBy = req.user._id;
      loan.updatedBy = req.user._id;
      
      if (remarks) loan.remarks = (loan.remarks ? loan.remarks + '\n' : '') + `Disbursement: ${remarks} (${paymentMethod} - Ref: ${referenceNumber})`;

      await loan.save({ session });

      // In a real system, we might also create an Accounting Transaction here.

      await AuditLog.create([{
        organizationId: req.user.organizationId,
        branchId: loan.branchId,
        userId: req.user._id,
        action: 'Disburse',
        module: 'Loan Management',
        description: `Disbursed ₹${dAmount} for loan ${loan.applicationId}`,
        ipAddress: req.ip
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // ----------------------------------------------------
      // Post to Accounting (Module 13 Integration)
      // ----------------------------------------------------
      try {
        const cashAcc = await getAccountByCode(req.user.organizationId, '1000');
        const loanRecAcc = await getAccountByCode(req.user.organizationId, '1200');
        if (cashAcc && loanRecAcc) {
          await recordTransaction({
            organizationId: req.user.organizationId,
            branchId: loan.branchId,
            memberId: loan.memberId,
            sourceModule: 'LoanDisbursement',
            sourceId: loan._id,
            transactionType: 'Outflow',
            amount: dAmount,
            paymentMethod,
            date: new Date(),
            description: `Loan Disbursement - Application ${loan.applicationId}`,
            userId: req.user._id,
            journalLines: [
              { accountId: loanRecAcc._id, debit: dAmount, credit: 0 },
              { accountId: cashAcc._id, debit: 0, credit: dAmount }
            ]
          });
        }
      } catch (accErr) {
        console.error('[Accounting Posting Error]', accErr);
      }

      res.status(200).json({ success: true, message: 'Loan disbursed successfully', data: loan });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// DOCUMENTS UPLOAD (LOCAL STORAGE)
// ==========================================

exports.uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or file upload failed.' });
    }

    const query = { _id: req.params.id, organizationId: req.user.organizationId };
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }
    const loan = await Loan.findOne(query);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await LoanDocument.create({
      organizationId: req.user.organizationId,
      loanId: loan._id,
      memberId: loan.memberId,
      documentType,
      fileUrl,
      fileName: req.file.filename,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Document uploaded successfully to local storage', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// DASHBOARD STATS
// ==========================================

exports.getDashboardStats = async (req, res) => {
  try {
    const query = { organizationId: req.user.organizationId };
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Organization Admin') {
      query.branchId = req.user.branchId;
    }

    const totalLoans = await Loan.countDocuments(query);
    const pendingApps = await Loan.countDocuments({ ...query, status: 'Pending' });
    const activeLoans = await Loan.countDocuments({ ...query, status: 'Active' });

    const statsAgg = await Loan.aggregate([
      { $match: { 
        organizationId: req.user.organizationId,
        ...(query.branchId && { branchId: query.branchId })
      }},
      {
        $group: {
          _id: null,
          totalApprovedAmount: { $sum: "$approvedAmount" },
          totalDisbursedAmount: { $sum: "$disbursedAmount" },
          totalOutstandingAmount: { $sum: "$outstandingAmount" }
        }
      }
    ]);

    const financialStats = statsAgg[0] || { totalApprovedAmount: 0, totalDisbursedAmount: 0, totalOutstandingAmount: 0 };

    res.status(200).json({ 
      success: true, 
      data: {
        totalLoans,
        pendingApps,
        activeLoans,
        financialStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
