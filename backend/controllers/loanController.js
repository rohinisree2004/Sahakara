const Loan = require('../models/Loan');
const LoanType = require('../models/LoanType');
const LoanReview = require('../models/LoanReview');
const LoanDocument = require('../models/LoanDocument');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const SavingsAccount = require('../models/SavingsAccount');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const { getAccountByCode, recordTransaction } = require('../utils/accountingService');
const { generateCibilReport } = require('../utils/cibilService');

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
    const { name, description, interestRate, minimumAmount, maximumAmount, maximumTenure, organizationId: bodyOrgId } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';
    const organizationId = isSuperAdmin ? (bodyOrgId || req.user.organizationId) : req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ success: false, message: 'Organization / Society is required' });
    }

    // Check if exists
    const existing = await LoanType.findOne({ organizationId, name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Loan Type with this name already exists in this society' });
    }

    const loanType = await LoanType.create({
      organizationId,
      name,
      description,
      interestRate: Number(interestRate),
      minimumAmount: Number(minimumAmount),
      maximumAmount: Number(maximumAmount),
      maximumTenure: Number(maximumTenure),
      status: 'Active',
      createdBy: req.user._id
    });

    const performerName = req.user.name || req.user.username || 'Staff';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';

    await AuditLog.create({
      organizationId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: 'Create',
      module: 'Loan Types',
      details: `Created new loan type: ${name}`,
      description: `Created new loan type: ${name}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const populated = await LoanType.findById(loanType._id).populate('organizationId', 'name code');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoanTypes = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'Super Admin';
    const query = {};
    if (!isSuperAdmin) {
      if (req.user.organizationId) query.organizationId = req.user.organizationId;
    } else if (req.query.organizationId && req.query.organizationId !== 'All') {
      query.organizationId = req.query.organizationId;
    }
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;

    const loanTypes = await LoanType.find(query).populate('organizationId', 'name code').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: loanTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LOAN ELIGIBILITY ALGORITHM
// ==========================================

const checkEligibility = async (organizationId, memberId, loanTypeId, requestedAmount) => {
  // 1. Resolve member document
  let member = null;
  if (memberId) {
    if (mongoose.Types.ObjectId.isValid(memberId)) {
      member = await Member.findById(memberId);
    }
    if (!member) {
      member = await Member.findOne({ userId: memberId, isDeleted: false });
    }
    if (!member) {
      member = await Member.findOne({ memberId: memberId, isDeleted: false });
    }
  }

  if (!member || member.isDeleted) {
    return { isEligible: false, reason: 'Member not found in society registry.' };
  }

  // Check active status
  const currentStatus = member.membershipStatus || member.status || 'Active';
  if (currentStatus === 'Suspended' || currentStatus === 'Rejected') {
    return { isEligible: false, reason: `Member account is currently in '${currentStatus}' status.` };
  }

  const effectiveOrgId = organizationId || member.organizationId;
  const effectiveMemberId = member._id;

  // 2. Validate against LoanType limits
  const ltQuery = { _id: loanTypeId };
  if (effectiveOrgId) ltQuery.organizationId = effectiveOrgId;
  const loanType = await LoanType.findOne(ltQuery);
  if (!loanType) {
    return { isEligible: false, reason: 'Invalid or inactive loan scheme.' };
  }
  if (requestedAmount < loanType.minimumAmount || requestedAmount > loanType.maximumAmount) {
    return { isEligible: false, reason: `Requested amount must be between ₹${loanType.minimumAmount.toLocaleString('en-IN')} and ₹${loanType.maximumAmount.toLocaleString('en-IN')}.` };
  }

  // 3. Check Savings Balance (Specialized Algorithm: Eligible for up to 10x savings balance)
  const savingsAccounts = await SavingsAccount.find({ memberId: effectiveMemberId, isDeleted: { $ne: true } });
  const totalSavings = savingsAccounts.reduce((acc, curr) => acc + (curr.currentBalance || curr.balance || 0), 0);
  
  const maxEligibleBasedOnSavings = Math.max(50000, totalSavings * 10);
  
  // 4. Existing active loans check
  const activeLoans = await Loan.find({ memberId: effectiveMemberId, status: 'Active', isDeleted: { $ne: true } });
  const totalOutstanding = activeLoans.reduce((acc, curr) => acc + (curr.outstandingAmount || curr.principalAmount || 0), 0);
  
  const adjustedMaxEligible = Math.max(0, maxEligibleBasedOnSavings - totalOutstanding);
  
  if (requestedAmount > adjustedMaxEligible && totalSavings > 0 && totalOutstanding > 0) {
    return { 
      isEligible: false, 
      reason: `Requested amount exceeds eligible limit of ₹${adjustedMaxEligible.toLocaleString('en-IN')} based on thrift savings (₹${totalSavings.toLocaleString('en-IN')}) and existing loans (₹${totalOutstanding.toLocaleString('en-IN')}).` 
    };
  }

  // 5. CIBIL/Credit Score & KYC simulation
  const panNumber = member.kycDetails?.panNumber || member.kycDocuments?.panNumber || member.panNumber || 'ABCDE1234F';
  const kycStatus = member.kycDetails?.kycStatus || (member.kycDocuments?.kycVerified ? 'Verified' : 'Verified');
  const creditScore = Math.floor(Math.random() * (850 - 650 + 1)) + 650;

  return {
    isEligible: true,
    details: {
      memberId: effectiveMemberId,
      totalSavings,
      totalOutstanding,
      adjustedMaxEligible,
      maxEligibleBasedOnSavings,
      panNumber,
      kycStatus,
      creditScore,
      eligibilityGrade: creditScore >= 750 ? 'Excellent' : creditScore >= 650 ? 'Good' : 'Moderate'
    }
  };
};

exports.checkLoanEligibility = async (req, res) => {
  try {
    const { memberId, loanTypeId, requestedAmount } = req.body;
    let member = null;
    if (memberId) {
      if (mongoose.Types.ObjectId.isValid(memberId)) member = await Member.findById(memberId);
      if (!member) member = await Member.findOne({ userId: memberId, isDeleted: false });
      if (!member) member = await Member.findOne({ memberId: memberId, isDeleted: false });
    }
    const orgId = req.user.organizationId || member?.organizationId;
    const result = await checkEligibility(orgId, member?._id || memberId, loanTypeId, Number(requestedAmount));
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
    
    let member = null;
    if (memberId) {
      if (mongoose.Types.ObjectId.isValid(memberId)) member = await Member.findById(memberId);
      if (!member) member = await Member.findOne({ userId: memberId, isDeleted: false });
      if (!member) member = await Member.findOne({ memberId: memberId, isDeleted: false });
    }

    if (!member || member.isDeleted) {
      return res.status(404).json({ success: false, message: 'Member not found in society registry.' });
    }

    const orgId = req.user.organizationId || member.organizationId;
    const branchId = req.body.branchId || req.user.branchId || member.branchId;

    if (!branchId) {
      return res.status(400).json({ success: false, message: 'Branch ID is required for loan application.' });
    }

    // Run eligibility algorithm
    const eligibility = await checkEligibility(orgId, member._id, loanTypeId, Number(requestedAmount));
    if (!eligibility.isEligible) {
      return res.status(400).json({ success: false, message: eligibility.reason });
    }

    const loanType = await LoanType.findById(loanTypeId);
    if (!loanType) {
      return res.status(400).json({ success: false, message: 'Invalid loan type.' });
    }

    if (Number(tenure) > loanType.maximumTenure) {
      return res.status(400).json({ success: false, message: `Tenure cannot exceed ${loanType.maximumTenure} months for this loan type.` });
    }

    const applicationId = await generateLoanId(orgId);

    // Fetch initial CIBIL credit bureau report for the applicant
    const cibilReport = generateCibilReport({
      memberId: member._id,
      name: member.fullName,
      phone: member.phone,
      pan: member.panNumber,
      requestedAmount
    });

    const targetGroupId = req.body.groupId || req.headers?.['x-active-group'] || req.user.groupId || member.groupId;

    const loan = await Loan.create({
      organizationId: orgId,
      branchId,
      groupId: targetGroupId || undefined,
      memberId: member._id,
      loanTypeId,
      applicationId,
      requestedAmount: Number(requestedAmount),
      principalAmount: Number(requestedAmount),
      interestRate: loanType.interestRate,
      tenure: Number(tenure),
      tenureMonths: Number(tenure),
      purpose,
      remarks: remarks || '',
      status: 'Pending',
      cibilScore: cibilReport.score,
      cibilReport,
      eligibilityDetails: eligibility.details,
      createdBy: req.user._id
    });

    try {
      await AuditLog.create({
        organizationId: orgId,
        performedBy: req.user._id,
        userId: req.user._id,
        performerName: req.user.name || 'Member',
        performerRole: req.user.role || 'Member',
        action: 'CREATE_LOAN_APPLICATION',
        module: 'Loan Applications',
        details: `Submitted loan application ${applicationId} for ₹${requestedAmount}`,
        description: `Submitted loan application ${applicationId} for ₹${requestedAmount}`,
        ipAddress: req.ip || '127.0.0.1'
      });
    } catch (auditErr) {
      console.warn('Audit log notice:', auditErr.message);
    }

    res.status(201).json({ success: true, message: 'Loan application submitted successfully!', data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, memberId, branchId, organizationId, groupId, search } = req.query;
    const activeHeaderGroupRole = req.headers?.['x-active-group-role'];
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderGroupRole || roleName;
    const isSuperAdmin = effectiveRole === 'Super Admin' || req.user.role === 'Super Admin';
    const isExecutive = ['President', 'Secretary', 'Treasurer'].includes(effectiveRole);
    const isRegularMember = effectiveRole === 'Member';
    const query = {};
    
    if (!isSuperAdmin) {
      if (req.user.organizationId) query.organizationId = req.user.organizationId;
    } else if (organizationId && organizationId !== 'All') {
      query.organizationId = organizationId;
    }

    if (status && status !== 'All') query.status = status;

    // Branch scoping
    if (!isSuperAdmin && req.user.role !== 'Organization Admin' && !isExecutive && !isRegularMember) {
      if (req.user.branchId) query.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    }

    // 1. Explicit Personal Loans query (myOnly === 'true') OR Regular Member
    if (req.query.myOnly === 'true' || isRegularMember) {
      delete query.branchId;
      const filters = [];
      if (req.user._id) filters.push({ userId: req.user._id });
      if (req.user.phone) filters.push({ phone: req.user.phone });
      if (req.user.email) filters.push({ email: req.user.email });
      if (req.user.name) filters.push({ fullName: req.user.name });

      const myMember = await Member.findOne({ $or: filters, isDeleted: false });
      if (myMember) {
        query.memberId = myMember._id;
      } else {
        query.memberId = new mongoose.Types.ObjectId();
      }

      if (groupId && groupId !== 'All') {
        query.groupId = groupId;
      }
    } 
    // 2. Member filtering by explicit memberId (Staff / Executive)
    else if (memberId && memberId !== 'All') {
      let resolvedMemberId = memberId;
      if (mongoose.Types.ObjectId.isValid(memberId)) {
        const mem = await Member.findById(memberId);
        if (mem) {
          resolvedMemberId = mem._id;
        } else {
          const memByUserId = await Member.findOne({ userId: memberId, isDeleted: false });
          if (memByUserId) resolvedMemberId = memByUserId._id;
        }
      } else {
        const mem = await Member.findOne({ memberId: memberId, isDeleted: false });
        if (mem) resolvedMemberId = mem._id;
      }
      query.memberId = resolvedMemberId;
      delete query.branchId;
    } 
    // 3. Group Executive viewing Group Loan Applications (Roster Review)
    else if (isExecutive) {
      delete query.branchId;
      const activeGrpId = (groupId && groupId !== 'All') 
        ? groupId 
        : (req.user.groupId || req.headers?.['x-active-group']);

      if (activeGrpId) {
        const groupDoc = await Group.findById(activeGrpId);
        const groupMemberIds = groupDoc?.memberIds || [];
        if (groupMemberIds.length > 0) {
          query.memberId = { $in: groupMemberIds };
        } else {
          query.memberId = new mongoose.Types.ObjectId();
        }
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
          const groupDocs = await Group.find({ _id: { $in: assignedGroupIds } });
          const allMemberIds = groupDocs.flatMap(g => g.memberIds || []);
          query.memberId = { $in: allMemberIds };
        } else {
          query.memberId = new mongoose.Types.ObjectId();
        }
      }
    } 
    // 4. Staff filtering by group
    else if (groupId && groupId !== 'All') {
      const groupDoc = await Group.findById(groupId);
      if (groupDoc && groupDoc.memberIds?.length > 0) {
        query.memberId = { $in: groupDoc.memberIds };
      } else {
        query.memberId = new mongoose.Types.ObjectId();
      }
    }

    if (search) {
      query.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
      ];
    }

    const loans = await Loan.find(query)
      .populate('memberId', 'fullName memberId phone category')
      .populate('loanTypeId', 'name interestRate')
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name code')
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
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const isExecutive = ['President', 'Secretary', 'Treasurer'].includes(roleName);
    const isRegularMember = roleName === 'Member';
    const query = { _id: req.params.id };
    
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const loan = await Loan.findOne(query)
      .populate('memberId')
      .populate('loanTypeId')
      .populate('branchId', 'branchName branchCode address')
      .populate('organizationId', 'name code address email phone')
      .populate('approvedBy', 'name username')
      .populate('disbursedBy', 'name username')
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username');

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (isRegularMember) {
      const myMember = await Member.findOne({ 
        $or: [{ userId: req.user._id }, { phone: req.user.phone }, { email: req.user.email }] 
      });
      if (!myMember || loan.memberId?._id?.toString() !== myMember._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this loan.' });
      }
    } else if (isExecutive) {
      const activeGrpId = req.headers?.['x-active-group'] || req.query.groupId || req.user.groupId;
      let isAllowed = false;
      if (activeGrpId) {
        const groupDoc = await Group.findById(activeGrpId);
        if (groupDoc && groupDoc.memberIds?.some(mId => mId.toString() === loan.memberId?._id?.toString())) {
          isAllowed = true;
        }
      }
      const myMember = await Member.findOne({ 
        $or: [{ userId: req.user._id }, { phone: req.user.phone }, { email: req.user.email }] 
      });
      if (myMember && loan.memberId?._id?.toString() === myMember._id.toString()) {
        isAllowed = true;
      }
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: 'Access denied to loans outside your group.' });
      }
    }

    // Auto-populate CIBIL score and report if not yet attached
    if (!loan.cibilScore || !loan.cibilReport) {
      try {
        const mem = loan.memberId;
        const report = generateCibilReport({
          memberId: mem?._id,
          name: mem?.fullName,
          phone: mem?.phone,
          pan: mem?.panNumber,
          requestedAmount: loan.requestedAmount || loan.principalAmount
        });
        loan.cibilScore = report.score;
        loan.cibilReport = report;
        await Loan.updateOne({ _id: loan._id }, { cibilScore: report.score, cibilReport: report });
      } catch (cibilErr) {
        console.warn('CIBIL generation notice:', cibilErr.message);
      }
    }

    const reviews = await LoanReview.find({ loanId: loan._id }).populate('reviewerId', 'name username').sort({ createdAt: -1 });
    const documents = await LoanDocument.find({ loanId: loan._id }).populate('uploadedBy', 'name username');

    // Calculate dynamic eligibility snapshot for the frontend details page
    let eligibilitySnapshot = null;
    try {
      if (loan.status === 'Pending' || loan.status === 'Under Review' || loan.status === 'Returned') {
        const memId = loan.memberId?._id || loan.memberId;
        const ltId = loan.loanTypeId?._id || loan.loanTypeId;
        const orgId = loan.organizationId?._id || loan.organizationId || req.user.organizationId;
        if (memId && ltId) {
          eligibilitySnapshot = await checkEligibility(orgId, memId, ltId, loan.requestedAmount || loan.principalAmount || 0);
        }
      }
    } catch (eligErr) {
      console.warn('Eligibility calculation error:', eligErr.message);
    }

    res.status(200).json({ 
      success: true, 
      data: { loan, reviews, documents, eligibilitySnapshot } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch / Refresh CIBIL Score & Credit Bureau Report
// @route   GET /api/v1/loans/:id/cibil
// @access  Private
exports.getCibilReport = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('memberId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const mem = loan.memberId;
    const report = generateCibilReport({
      memberId: mem?._id,
      name: mem?.fullName,
      phone: mem?.phone,
      pan: mem?.panNumber,
      requestedAmount: loan.requestedAmount || loan.principalAmount
    });

    loan.cibilScore = report.score;
    loan.cibilReport = report;
    await loan.save();

    res.status(200).json({ success: true, data: report });
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
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';
    
    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    if (!isOrgLevel && req.user.branchId) {
      query.branchId = req.user.branchId;
    }

    const loan = await Loan.findOne(query).populate('memberId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    // Ensure CIBIL report is attached
    if (!loan.cibilScore) {
      const report = generateCibilReport({
        memberId: loan.memberId?._id,
        name: loan.memberId?.fullName,
        phone: loan.memberId?.phone,
        pan: loan.memberId?.panNumber,
        requestedAmount: loan.requestedAmount
      });
      loan.cibilScore = report.score;
      loan.cibilReport = report;
    }

    if (action === 'Recommended' || action === 'Forwarded to Branch Manager' || action === 'Forward to Branch Manager') {
      loan.status = 'Recommended';
    } else if (action === 'Started Review' && (loan.status === 'Pending' || loan.status === 'Draft')) {
      loan.status = 'Under Review';
    } else if (action === 'Returned for Correction' || action === 'Return for Correction') {
      loan.status = 'Returned';
      loan.returnReason = remarks || 'Returned for correction. Please review details and resubmit.';
      loan.returnedBy = req.user._id;
      loan.returnedDate = new Date();
    } else if (action === 'Rejected') {
      loan.status = 'Rejected';
      loan.rejectionReason = remarks || 'Rejected during executive review.';
    }

    loan.updatedBy = req.user._id;
    if (remarks) loan.remarks = remarks;
    await loan.save();

    const targetOrgId = loan.organizationId;

    await LoanReview.create({
      organizationId: targetOrgId,
      loanId: loan._id,
      reviewerId: req.user._id,
      action: action || 'Recommended',
      remarks: remarks || (action === 'Returned for Correction' ? 'Returned to applicant for correction.' : 'Forwarded with recommendation.')
    });

    const performerName = req.user.name || req.user.username || 'Staff';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';

    await AuditLog.create({
      organizationId: targetOrgId,
      branchId: loan.branchId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: action === 'Returned for Correction' ? 'RETURN_LOAN_FOR_CORRECTION' : 'REVIEW_LOAN',
      module: 'Loan Management',
      details: `${action === 'Returned for Correction' ? 'Returned for correction' : 'Reviewed'} loan application ${loan.applicationId}`,
      description: `Action: ${action} on loan application ${loan.applicationId}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(200).json({ 
      success: true, 
      message: action === 'Returned for Correction' 
        ? 'Loan application returned for correction successfully! Member has been notified.' 
        : 'Loan application review recorded successfully!', 
      data: loan 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const { approvedAmount, remarks } = req.body;
    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';

    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    if (!isOrgLevel && req.user.branchId) {
      query.branchId = req.user.branchId;
    }

    const loan = await Loan.findOne(query).populate('memberId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (loan.status === 'Approved' || loan.status === 'Rejected' || loan.status === 'Disbursed' || loan.status === 'Active' || loan.status === 'Closed') {
      return res.status(400).json({ success: false, message: `Cannot approve loan in ${loan.status} status` });
    }

    // Ensure CIBIL report is attached
    if (!loan.cibilScore) {
      const report = generateCibilReport({
        memberId: loan.memberId?._id,
        name: loan.memberId?.fullName,
        phone: loan.memberId?.phone,
        pan: loan.memberId?.panNumber,
        requestedAmount: loan.requestedAmount
      });
      loan.cibilScore = report.score;
      loan.cibilReport = report;
    }

    loan.status = 'Approved';
    loan.approvedAmount = Number(approvedAmount) || loan.requestedAmount;
    loan.approvalDate = new Date();
    loan.approvedBy = req.user._id;
    loan.updatedBy = req.user._id;
    
    await loan.save();

    const targetOrgId = loan.organizationId;

    await LoanReview.create({
      organizationId: targetOrgId,
      loanId: loan._id,
      reviewerId: req.user._id,
      action: 'Approved',
      remarks
    });

    const performerName = req.user.name || req.user.username || 'Staff';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';

    await AuditLog.create({
      organizationId: targetOrgId,
      branchId: loan.branchId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: 'Approve',
      module: 'Loan Management',
      details: `Approved loan application ${loan.applicationId} for ₹${loan.approvedAmount}`,
      description: `Approved loan application ${loan.applicationId} for ₹${loan.approvedAmount}`,
      ipAddress: req.ip || '127.0.0.1'
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

    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';

    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    if (!isOrgLevel && req.user.branchId) {
      query.branchId = req.user.branchId;
    }

    const loan = await Loan.findOne(query).populate('memberId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (loan.status === 'Disbursed' || loan.status === 'Active' || loan.status === 'Closed') {
      return res.status(400).json({ success: false, message: `Cannot reject loan in ${loan.status} status` });
    }

    // Ensure CIBIL report is attached
    if (!loan.cibilScore) {
      const report = generateCibilReport({
        memberId: loan.memberId?._id,
        name: loan.memberId?.fullName,
        phone: loan.memberId?.phone,
        pan: loan.memberId?.panNumber,
        requestedAmount: loan.requestedAmount
      });
      loan.cibilScore = report.score;
      loan.cibilReport = report;
    }

    loan.status = 'Rejected';
    loan.rejectionReason = remarks;
    loan.updatedBy = req.user._id;
    await loan.save();

    const targetOrgId = loan.organizationId;

    await LoanReview.create({
      organizationId: targetOrgId,
      loanId: loan._id,
      reviewerId: req.user._id,
      action: 'Rejected',
      remarks
    });

    const performerName = req.user.name || req.user.username || 'Staff';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';

    await AuditLog.create({
      organizationId: targetOrgId,
      branchId: loan.branchId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: 'Reject',
      module: 'Loan Management',
      details: `Rejected loan application ${loan.applicationId}. Reason: ${remarks}`,
      description: `Rejected loan application ${loan.applicationId}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(200).json({ success: true, message: 'Loan rejected successfully', data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resubmit a Returned Loan Application after Member Correction
// @route   PUT /api/v1/loans/:id/resubmit
// @access  Private (Member or Submitter)
exports.resubmitLoan = async (req, res) => {
  try {
    const { requestedAmount, tenure, purpose, remarks, loanTypeId } = req.body;
    const loan = await Loan.findById(req.params.id).populate('memberId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (loan.status !== 'Returned') {
      return res.status(400).json({ success: false, message: `Only loans in "Returned" status can be resubmitted. Current status: ${loan.status}` });
    }

    if (requestedAmount) {
      loan.requestedAmount = Number(requestedAmount);
      loan.principalAmount = Number(requestedAmount);
    }
    if (tenure) {
      loan.tenure = Number(tenure);
      loan.tenureMonths = Number(tenure);
    }
    if (purpose) loan.purpose = purpose;
    if (remarks) loan.remarks = remarks;
    if (loanTypeId) loan.loanTypeId = loanTypeId;

    loan.status = 'Pending';
    loan.resubmissionCount = (loan.resubmissionCount || 0) + 1;
    loan.lastResubmittedAt = new Date();
    loan.updatedBy = req.user._id;

    // Refresh eligibility
    try {
      const eligibility = await checkEligibility(loan.organizationId, loan.memberId?._id || loan.memberId, loan.loanTypeId, loan.requestedAmount);
      loan.eligibilityDetails = eligibility.details;
    } catch (eligErr) {
      console.warn('Resubmission eligibility check:', eligErr.message);
    }

    await loan.save();

    const targetOrgId = loan.organizationId;

    await LoanReview.create({
      organizationId: targetOrgId,
      loanId: loan._id,
      reviewerId: req.user._id,
      action: 'Resubmitted after Correction',
      remarks: remarks || `Applicant submitted corrections (Resubmission Cycle #${loan.resubmissionCount})`
    });

    const performerName = req.user.name || req.user.username || 'Member';
    const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Member';

    await AuditLog.create({
      organizationId: targetOrgId,
      branchId: loan.branchId,
      performedBy: req.user._id,
      userId: req.user._id,
      performerName,
      performerRole,
      action: 'RESUBMIT_LOAN',
      module: 'Loan Management',
      details: `Resubmitted loan application ${loan.applicationId} after correction (Cycle #${loan.resubmissionCount})`,
      description: `Resubmitted loan application ${loan.applicationId} after correction`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(200).json({ 
      success: true, 
      message: 'Loan application corrected and resubmitted successfully! It has been returned to the executive review queue.', 
      data: loan 
    });
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
      const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
      const isSuperAdmin = roleName === 'Super Admin';
      const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';

      const query = { _id: req.params.id };
      if (!isSuperAdmin && req.user.organizationId) {
        query.organizationId = req.user.organizationId;
      }
      if (!isOrgLevel && req.user.branchId) {
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

      const targetOrgId = loan.organizationId;

      loan.status = 'Active';
      loan.disbursedAmount = dAmount;
      loan.principalAmount = dAmount;
      loan.disbursementDate = new Date();
      loan.disbursedBy = req.user._id;
      loan.paymentMethod = paymentMethod || 'Bank Transfer';
      loan.referenceNumber = referenceNumber;
      loan.disbursementRemarks = remarks;
      
      // Calculate EMI and initial outstanding
      const P = dAmount;
      const r = (loan.interestRate / 12) / 100;
      const n = loan.tenure;
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      loan.emiAmount = Math.round(emi);
      loan.totalInterest = Math.round((emi * n) - P);
      loan.totalRepaymentAmount = Math.round(emi * n);
      loan.outstandingAmount = Math.round(emi * n);
      loan.remainingTenure = n;
      loan.updatedBy = req.user._id;

      await loan.save({ session });

      const performerName = req.user.name || req.user.username || 'Staff';
      const performerRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || 'Staff';

      await AuditLog.create([{
        organizationId: targetOrgId,
        branchId: loan.branchId,
        performedBy: req.user._id,
        userId: req.user._id,
        performerName,
        performerRole,
        action: 'Disburse',
        module: 'Loan Management',
        details: `Disbursed loan ${loan.applicationId} amount ₹${dAmount}`,
        description: `Disbursed loan ${loan.applicationId} amount ₹${dAmount}`,
        ipAddress: req.ip || '127.0.0.1'
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // ----------------------------------------------------
      // Post to Accounting (Module 13 Integration)
      // ----------------------------------------------------
      try {
        const cashAcc = await getAccountByCode(targetOrgId, '1010');
        const loanAssetAcc = await getAccountByCode(targetOrgId, '1030');
        if (cashAcc && loanAssetAcc) {
          await recordTransaction({
            organizationId: targetOrgId,
            branchId: loan.branchId,
            description: `Loan Disbursement: ${loan.applicationId}`,
            referenceType: 'LoanDisbursement',
            referenceId: loan._id,
            date: new Date(),
            entries: [
              {
                accountId: loanAssetAcc._id,
                type: 'Debit',
                amount: dAmount,
                description: `Loan asset created for ${loan.applicationId}`
              },
              {
                accountId: cashAcc._id,
                type: 'Credit',
                amount: dAmount,
                description: `Cash outflow for loan disbursement ${loan.applicationId}`
              }
            ],
            createdBy: req.user._id
          });
        }
      } catch (accErr) {
        console.warn('[Accounting Posting Warning]', accErr.message);
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

    const roleName = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const isSuperAdmin = roleName === 'Super Admin';
    const isOrgLevel = isSuperAdmin || roleName === 'Organization Admin' || roleName === 'President' || roleName === 'Secretary' || roleName === 'Treasurer';

    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    if (!isOrgLevel && req.user.branchId) {
      query.branchId = req.user.branchId;
    }

    const loan = await Loan.findOne(query);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await LoanDocument.create({
      organizationId: loan.organizationId,
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

exports.getDashboardStats = async (req, res) => {
  try {
    const { organizationId, branchId, groupId, memberId } = req.query;
    const isSuperAdmin = req.user.role === 'Super Admin';
    const query = {};

    if (!isSuperAdmin) {
      if (req.user.organizationId) query.organizationId = req.user.organizationId;
    } else if (organizationId && organizationId !== 'All') {
      query.organizationId = organizationId;
    }

    if (!isSuperAdmin && req.user.role !== 'Organization Admin') {
      if (req.user.branchId) query.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    }

    if (groupId && groupId !== 'All') {
      const groupDoc = await Group.findById(groupId);
      if (groupDoc && groupDoc.memberIds?.length > 0) {
        query.memberId = { $in: groupDoc.memberIds };
      }
    }

    if (memberId && memberId !== 'All') {
      query.memberId = memberId;
    }

    const totalLoans = await Loan.countDocuments(query);
    const pendingApps = await Loan.countDocuments({ ...query, status: 'Pending' });
    const activeLoans = await Loan.countDocuments({ ...query, status: 'Active' });
    const approvedLoans = await Loan.countDocuments({ ...query, status: 'Approved' });
    const rejectedLoans = await Loan.countDocuments({ ...query, status: 'Rejected' });

    const matchStage = {};
    if (query.organizationId) matchStage.organizationId = new mongoose.Types.ObjectId(query.organizationId);
    if (query.branchId) matchStage.branchId = new mongoose.Types.ObjectId(query.branchId);
    if (query.memberId) {
      if (typeof query.memberId === 'object' && query.memberId.$in) {
        matchStage.memberId = { $in: query.memberId.$in.map(id => new mongoose.Types.ObjectId(id)) };
      } else {
        matchStage.memberId = new mongoose.Types.ObjectId(query.memberId);
      }
    }

    const statsAgg = await Loan.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalApprovedAmount: { $sum: "$approvedAmount" },
          totalDisbursedAmount: { $sum: "$disbursedAmount" },
          totalOutstandingAmount: { $sum: "$outstandingAmount" },
          totalPrincipalAmount: { $sum: "$principalAmount" }
        }
      }
    ]);

    const financialStats = statsAgg[0] || { 
      totalApprovedAmount: 0, 
      totalDisbursedAmount: 0, 
      totalOutstandingAmount: 0, 
      totalPrincipalAmount: 0 
    };

    res.status(200).json({ 
      success: true, 
      data: {
        totalLoans,
        pendingApps,
        activeLoans,
        approvedLoans,
        rejectedLoans,
        financialStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
