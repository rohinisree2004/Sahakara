const AccountClosureRequest = require('../models/AccountClosureRequest');
const SavingsAccount = require('../models/SavingsAccount');
const Loan = require('../models/Loan');
const Member = require('../models/Member');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// Helper to determine if user is Super Admin
const isSuperAdminUser = (user) => {
  const roleName = user?.role?.name || user?.role;
  return roleName === 'Super Admin';
};

// Helper to determine active organization scope
const getEffectiveOrgId = (req) => {
  if (isSuperAdminUser(req.user)) {
    return req.body?.organizationId || req.query?.organizationId || null;
  }
  return req.user?.organizationId || null;
};

// Generate unique Request ID: CLS-2026-0001
const generateClosureId = async (orgId) => {
  const currentYear = new Date().getFullYear();
  const prefix = `CLS-${currentYear}-`;
  const filter = orgId ? { organizationId: orgId } : {};
  const count = await AccountClosureRequest.countDocuments(filter);
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
};

// Helper for Audit Logging
const logAction = async (req, action, resourceId, details) => {
  try {
    const orgId = getEffectiveOrgId(req) || req.user?.organizationId;
    await AuditLog.create({
      organizationId: orgId || null,
      branchId: req.body?.branchId || req.query?.branchId || null,
      userId: req.user?._id || null,
      action,
      resourceType: 'AccountClosure',
      resourceId,
      details,
      ipAddress: req.ip || '127.0.0.1',
    });
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

// @desc    Calculate live closure financials for a member
// @route   GET /api/v1/account-closures/member-financials/:memberId
// @access  Private
exports.getMemberClosureFinancials = async (req, res) => {
  try {
    const { memberId } = req.params;
    let member = null;
    if (mongoose.Types.ObjectId.isValid(memberId)) {
      member = await Member.findById(memberId)
        .populate('organizationId', 'name code')
        .populate('branchId', 'branchName');
    }
    if (!member) {
      member = await Member.findOne({ userId: memberId })
        .populate('organizationId', 'name code')
        .populate('branchId', 'branchName');
    }
    if (!member) {
      member = await Member.findOne({ memberId: memberId })
        .populate('organizationId', 'name code')
        .populate('branchId', 'branchName');
    }

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found.' });
    }

    // Active Savings Accounts
    const savingsAccounts = await SavingsAccount.find({
      memberId: member._id,
      status: { $ne: 'Closed' }
    });
    const totalSavings = savingsAccounts.reduce((sum, s) => {
      const bal = s.currentBalance !== undefined ? s.currentBalance : (s.balance !== undefined ? s.balance : (s.openingBalance || 0));
      return sum + Number(bal || 0);
    }, 0);

    // Active / Disbursed / Approved Loans
    const activeLoans = await Loan.find({
      memberId: member._id,
      status: { $in: ['Active', 'Disbursed', 'Partially Paid', 'Approved', 'Pending', 'Under Review'] }
    });
    const totalLoans = activeLoans.reduce((sum, l) => {
      let val = 0;
      if (l.outstandingAmount !== undefined && l.outstandingAmount > 0) {
        val = l.outstandingAmount;
      } else if (l.disbursedAmount !== undefined && l.disbursedAmount > 0) {
        val = l.disbursedAmount;
      } else if (l.approvedAmount !== undefined && l.approvedAmount > 0) {
        val = l.approvedAmount;
      } else if (l.principalAmount !== undefined && l.principalAmount > 0) {
        val = l.principalAmount;
      } else if (l.requestedAmount !== undefined && l.requestedAmount > 0) {
        val = l.requestedAmount;
      } else if (l.amount !== undefined && l.amount > 0) {
        val = l.amount;
      }
      return sum + Number(val || 0);
    }, 0);

    // Member Share Capital
    const shareCapital = member.shareCapital !== undefined && member.shareCapital > 0
      ? member.shareCapital
      : (member.sharesAmount !== undefined && member.sharesAmount > 0 ? member.sharesAmount : 1000);

    const netSettlement = Math.max(0, (totalSavings + shareCapital) - totalLoans);

    res.status(200).json({
      success: true,
      data: {
        member: {
          _id: member._id,
          fullName: member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
          memberId: member.memberId,
          phone: member.phone,
          status: member.status || member.membershipStatus,
          shareCapital
        },
        savingsAccounts,
        totalSavings,
        activeLoans,
        totalLoans,
        shareCapital,
        netSettlement,
        hasOutstandingDebt: totalLoans > 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Submit an Account Closure Request
// @route   POST /api/v1/account-closures
// @access  Private (Members, Staff, Admins)
exports.submitClosureRequest = async (req, res) => {
  try {
    const {
      organizationId,
      branchId,
      memberId: customMemberId,
      closureType,
      reason,
      settlementDetails = {}
    } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'Reason for closure is required.' });
    }

    const isSuperAdmin = isSuperAdminUser(req.user);
    const roleName = req.user?.role?.name || req.user?.role;

    // Resolve Member
    let targetMember = null;
    if (roleName === 'Member') {
      targetMember = await Member.findOne({ userId: req.user._id });
    } else if (customMemberId) {
      if (mongoose.Types.ObjectId.isValid(customMemberId)) {
        targetMember = await Member.findById(customMemberId);
      }
      if (!targetMember) {
        targetMember = await Member.findOne({ userId: customMemberId });
      }
      if (!targetMember) {
        targetMember = await Member.findOne({ memberId: customMemberId });
      }
    }

    const targetOrgId = organizationId || targetMember?.organizationId || req.user.organizationId;
    if (!targetOrgId) {
      return res.status(400).json({ success: false, error: 'Organization / Society ID is required.' });
    }

    const targetBranchId = branchId || targetMember?.branchId || req.user.branchId || null;
    const targetMemberId = targetMember ? targetMember._id : null;

    let totalSavings = 0;
    let totalLoans = 0;
    let shareCapital = 0;

    if (targetMemberId) {
      const savingsAccounts = await SavingsAccount.find({
        memberId: targetMemberId,
        status: { $ne: 'Closed' },
      });
      totalSavings = savingsAccounts.reduce((sum, s) => {
        const bal = s.currentBalance !== undefined ? s.currentBalance : (s.balance !== undefined ? s.balance : (s.openingBalance || 0));
        return sum + Number(bal || 0);
      }, 0);

      const activeLoans = await Loan.find({
        memberId: targetMemberId,
        status: { $in: ['Active', 'Disbursed', 'Partially Paid', 'Approved', 'Pending', 'Under Review'] },
      });
      totalLoans = activeLoans.reduce((sum, l) => {
        let val = 0;
        if (l.outstandingAmount !== undefined && l.outstandingAmount > 0) {
          val = l.outstandingAmount;
        } else if (l.disbursedAmount !== undefined && l.disbursedAmount > 0) {
          val = l.disbursedAmount;
        } else if (l.approvedAmount !== undefined && l.approvedAmount > 0) {
          val = l.approvedAmount;
        } else if (l.principalAmount !== undefined && l.principalAmount > 0) {
          val = l.principalAmount;
        } else if (l.requestedAmount !== undefined && l.requestedAmount > 0) {
          val = l.requestedAmount;
        } else if (l.amount !== undefined && l.amount > 0) {
          val = l.amount;
        }
        return sum + Number(val || 0);
      }, 0);

      shareCapital = targetMember?.shareCapital !== undefined && targetMember.shareCapital > 0
        ? targetMember.shareCapital
        : (targetMember?.sharesAmount !== undefined && targetMember.sharesAmount > 0 ? targetMember.sharesAmount : 1000);
    }

    const requestId = await generateClosureId(targetOrgId);
    const netSettlement = Math.max(0, (totalSavings + (closureType === 'Savings Account Closure' ? 0 : shareCapital)) - totalLoans);

    const closure = await AccountClosureRequest.create({
      organizationId: targetOrgId,
      branchId: targetBranchId,
      memberId: targetMemberId,
      userId: req.user._id,
      requestId,
      closureType: closureType || 'Full Membership Closure',
      reason: reason.trim(),
      settlementDetails: {
        paymentMode: settlementDetails.paymentMode || 'Bank Transfer',
        bankName: settlementDetails.bankName || '',
        accountNumber: settlementDetails.accountNumber || '',
        ifscCode: settlementDetails.ifscCode || '',
        upiId: settlementDetails.upiId || '',
        referenceNumber: settlementDetails.referenceNumber || '',
      },
      refundableSavingsBalance: totalSavings,
      shareCapitalRefund: closureType === 'Savings Account Closure' ? 0 : shareCapital,
      outstandingLoanBalance: totalLoans,
      netSettlementAmount: netSettlement,
      status: 'Pending',
    });

    await logAction(req, 'SUBMIT_CLOSURE_REQUEST', closure._id, `Submitted ${closure.closureType} ${closure.requestId} for Member ${targetMember?.memberId || 'Self'}`);

    res.status(201).json({
      success: true,
      data: closure,
      message: `Account closure request ${requestId} submitted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Account Closure Requests List
// @route   GET /api/v1/account-closures
// @access  Private
exports.getClosureRequests = async (req, res) => {
  try {
    const isSuperAdmin = isSuperAdminUser(req.user);
    const roleName = req.user?.role?.name || req.user?.role;
    const {
      organizationId,
      branchId,
      status,
      closureType,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Role Scoping
    if (isSuperAdmin) {
      if (organizationId && organizationId !== 'All') {
        query.organizationId = organizationId;
      }
    } else if (['Organization Admin', 'President', 'Secretary', 'Treasurer'].includes(roleName)) {
      query.organizationId = req.user.organizationId;
    } else if (['Branch Manager', 'Employee'].includes(roleName)) {
      query.organizationId = req.user.organizationId;
      if (req.user.branchId) query.branchId = req.user.branchId;
    } else if (roleName === 'Member') {
      query.userId = req.user._id;
    } else {
      query.organizationId = req.user.organizationId;
    }

    if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    }

    if (status && status !== 'All') query.status = status;
    if (closureType && closureType !== 'All') query.closureType = closureType;

    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await AccountClosureRequest.countDocuments(query);
    const requests = await AccountClosureRequest.find(query)
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .populate('memberId', 'fullName memberId phone email')
      .populate('userId', 'name email role username phone')
      .populate('processedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
      currentPage: Number(page),
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Closure Request Details by ID
// @route   GET /api/v1/account-closures/:id
// @access  Private
exports.getClosureById = async (req, res) => {
  try {
    const isSuperAdmin = isSuperAdminUser(req.user);
    const roleName = req.user?.role?.name || req.user?.role;
    const query = { _id: req.params.id };

    if (!isSuperAdmin && roleName === 'Member') {
      query.userId = req.user._id;
    } else if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const request = await AccountClosureRequest.findOne(query)
      .populate('organizationId', 'name code address email phone')
      .populate('branchId', 'branchName branchCode address')
      .populate('memberId', 'fullName memberId phone email address status')
      .populate('userId', 'name email role phone username')
      .populate('processedBy', 'name role email');

    if (!request) {
      return res.status(404).json({ success: false, error: 'Account closure request not found.' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Process / Settle Account Closure Request
// @route   PUT /api/v1/account-closures/:id/process
// @access  Private (Admins, Branch Managers, Super Admin)
exports.processClosureRequest = async (req, res) => {
  try {
    const { status, remarks, paymentMode, referenceNumber } = req.body;
    const isSuperAdmin = isSuperAdminUser(req.user);

    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const request = await AccountClosureRequest.findOne(query);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Closure request not found.' });
    }

    const newStatus = status || 'Approved & Settled';
    request.status = newStatus;
    if (remarks) request.remarks = remarks.trim();
    if (paymentMode) request.settlementDetails.paymentMode = paymentMode;
    if (referenceNumber) request.settlementDetails.referenceNumber = referenceNumber.trim();

    request.processedBy = req.user._id;
    request.processedAt = new Date();

    await request.save();

    // If Approved & Settled, close active savings accounts and update member status
    if (newStatus === 'Approved & Settled' && request.memberId) {
      if (request.closureType === 'Full Membership Closure') {
        await Member.findByIdAndUpdate(request.memberId, {
          status: 'Inactive',
          resignationDate: new Date(),
          remarks: `Membership closed via settlement ${request.requestId}`
        });

        await SavingsAccount.updateMany(
          { memberId: request.memberId, status: 'Active' },
          { status: 'Closed', closedAt: new Date(), remarks: `Settled under ${request.requestId}` }
        );
      } else if (request.closureType === 'Savings Account Closure') {
        await SavingsAccount.updateMany(
          { memberId: request.memberId, status: 'Active' },
          { status: 'Closed', closedAt: new Date(), remarks: `Closed under ${request.requestId}` }
        );
      }
    }

    await logAction(req, 'PROCESS_CLOSURE_REQUEST', request._id, `Processed closure ${request.requestId}: Status ${newStatus}`);

    res.status(200).json({
      success: true,
      data: request,
      message: `Account closure ${request.requestId} updated to ${newStatus}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Account Closure Summary Stats
// @route   GET /api/v1/account-closures/stats
// @access  Private
exports.getClosureStats = async (req, res) => {
  try {
    const isSuperAdmin = isSuperAdminUser(req.user);
    const roleName = req.user?.role?.name || req.user?.role;
    const { organizationId, branchId } = req.query;

    const baseFilter = {};
    if (isSuperAdmin) {
      if (organizationId && organizationId !== 'All') {
        baseFilter.organizationId = organizationId;
      }
    } else if (req.user.organizationId) {
      baseFilter.organizationId = req.user.organizationId;
      if (req.user.branchId && !['Organization Admin', 'President', 'Secretary'].includes(roleName)) {
        baseFilter.branchId = req.user.branchId;
      }
    }

    if (branchId && branchId !== 'All') {
      baseFilter.branchId = branchId;
    }

    const [
      totalCount,
      pendingCount,
      underReviewCount,
      settledCount,
      rejectedCount,
      settledDocs
    ] = await Promise.all([
      AccountClosureRequest.countDocuments(baseFilter),
      AccountClosureRequest.countDocuments({ ...baseFilter, status: 'Pending' }),
      AccountClosureRequest.countDocuments({ ...baseFilter, status: 'Under Review' }),
      AccountClosureRequest.countDocuments({ ...baseFilter, status: 'Approved & Settled' }),
      AccountClosureRequest.countDocuments({ ...baseFilter, status: 'Rejected' }),
      AccountClosureRequest.find({ ...baseFilter, status: 'Approved & Settled' }).select('netSettlementAmount')
    ]);

    const totalDisbursed = settledDocs.reduce((sum, d) => sum + (d.netSettlementAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalRequests: totalCount,
        pendingRequests: pendingCount,
        underReviewRequests: underReviewCount,
        settledRequests: settledCount,
        rejectedRequests: rejectedCount,
        totalDisbursedSettlement: totalDisbursed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
