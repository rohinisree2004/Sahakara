const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');

// Helper: Determine if user has Super Admin authority
const isSuperAdminUser = (user) => {
  if (!user) return false;
  const roleName = user.role?.name || user.role;
  return roleName === 'Super Admin';
};

// Helper: Generate unique ticket ID, e.g. TKT-2026-8942
const generateTicketId = async (orgId) => {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let ticketId = `TKT-${currentYear}-${randomSuffix}`;
  let exists = await Complaint.findOne({ ticketId });
  while (exists) {
    const newRandom = Math.floor(1000 + Math.random() * 9000);
    ticketId = `TKT-${currentYear}-${newRandom}`;
    exists = await Complaint.findOne({ ticketId });
  }
  return ticketId;
};

// Helper: Audit Logging
const logAction = async (req, action, targetId, details) => {
  try {
    await AuditLog.create({
      organizationId: req.user.organizationId || null,
      branchId: req.user.branchId || null,
      userId: req.user._id,
      action,
      resourceType: 'Complaint',
      resourceId: targetId,
      details,
      ipAddress: req.ip || '127.0.0.1',
    });
  } catch (err) {
    console.warn('Complaint audit log failed:', err.message);
  }
};

// Helper: Resolve member document for the logged-in user
const resolveUserMember = async (user) => {
  if (!user) return null;
  const filters = [];
  if (user._id) filters.push({ userId: user._id });
  if (user.phone) filters.push({ phone: user.phone });
  if (user.email) filters.push({ email: user.email });
  if (user.name) filters.push({ fullName: user.name });
  return await Member.findOne({ $or: filters, isDeleted: false });
};

// @desc    Submit a Complaint / Grievance Ticket
// @route   POST /api/v1/complaints
// @access  Private (Members, Group Executives, Branch Managers, Admins)
exports.createComplaint = async (req, res) => {
  try {
    const {
      organizationId,
      branchId,
      groupId,
      memberId,
      subject,
      category,
      priority,
      description,
      targetAuthority = 'Group President',
      attachments = []
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, error: 'Subject and detailed description are required.' });
    }

    const myMember = await resolveUserMember(req.user);

    // Resolve Group, Branch, and Organization
    const activeHeaderGrp = req.headers?.['x-active-group'];
    const resolvedGroupId = groupId || activeHeaderGrp || req.user.groupId || (myMember ? myMember.groupId : null);

    let groupDoc = null;
    if (resolvedGroupId && mongoose.Types.ObjectId.isValid(resolvedGroupId)) {
      groupDoc = await Group.findById(resolvedGroupId);
    }

    const resolvedBranchId = branchId || (groupDoc ? groupDoc.branchId : (myMember ? myMember.branchId : req.user.branchId));
    const resolvedOrgId = organizationId || (groupDoc ? groupDoc.organizationId : (myMember ? myMember.organizationId : req.user.organizationId));

    if (!resolvedOrgId) {
      return res.status(400).json({ success: false, error: 'Organization / Society ID is required.' });
    }

    const ticketId = await generateTicketId(resolvedOrgId);

    // If targetAuthority is Group President, resolve the president's user ID if available
    let targetUserId = null;
    if (targetAuthority === 'Group President' && groupDoc) {
      const presMemberId = groupDoc.presidentId || groupDoc.leaderId;
      if (presMemberId) {
        const presMember = await Member.findById(presMemberId);
        if (presMember && presMember.userId) {
          targetUserId = presMember.userId;
        }
      }
    }

    const activeRole = req.headers?.['x-active-group-role'] || req.user.role || 'Member';

    const complaint = await Complaint.create({
      organizationId: resolvedOrgId,
      branchId: resolvedBranchId || null,
      groupId: resolvedGroupId || null,
      memberId: memberId || (myMember ? myMember._id : null),
      userId: req.user._id,
      ticketId,
      subject: subject.trim(),
      category: category || 'Account Service',
      priority: priority || 'Medium',
      description: description.trim(),
      status: 'Submitted',
      targetAuthority: targetAuthority || 'Group President',
      targetUserId: targetUserId || null,
      escalationLevel: targetAuthority === 'Super Admin' ? 'Super Admin' : (targetAuthority === 'Group President' ? 'Group' : 'Branch / Society'),
      raisedByType: activeRole,
      raisedByName: req.user.name || req.user.username || 'Member',
      attachments
    });

    await logAction(req, 'CREATE_COMPLAINT', complaint._id, `Filed complaint ticket ${ticketId} addressed to ${targetAuthority}: ${subject}`);

    res.status(201).json({
      success: true,
      data: complaint,
      message: `Complaint ticket ${ticketId} registered and submitted to ${targetAuthority}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Complaints List with Strict Sender & Receiver Privacy
// @route   GET /api/v1/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    const isSuperAdmin = isSuperAdminUser(req.user);
    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || userRole;

    const activeHeaderGrp = req.headers?.['x-active-group'];
    const activeGrpId = req.query.groupId || activeHeaderGrp || req.user.groupId;

    const {
      organizationId,
      branchId,
      status,
      category,
      priority,
      targetAuthority,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const myMember = await resolveUserMember(req.user);
    let query = {};

    // 1. Super Admin: Global access
    if (isSuperAdmin) {
      if (organizationId && organizationId !== 'All') {
        query.organizationId = new mongoose.Types.ObjectId(organizationId);
      }
    }
    // 2. Organization Admin: Society-wide access
    else if (['Organization Admin', 'Org Admin'].includes(effectiveRole) || ['Organization Admin', 'Org Admin'].includes(userRole)) {
      query.organizationId = req.user.organizationId;
      // Sees tickets addressed to Org Admin or transferred to Org Admin or raised by members in org
    }
    // 3. Branch Manager: Branch-level access
    else if (effectiveRole === 'Branch Manager' || userRole === 'Branch Manager') {
      query.organizationId = req.user.organizationId;
      if (req.user.branchId) query.branchId = req.user.branchId;
      // Sees complaints addressed to Branch Manager, transferred to Branch Manager, or raised by self
      query.$or = [
        { targetAuthority: 'Branch Manager' },
        { transferredTo: 'Branch Manager' },
        { userId: req.user._id }
      ];
      if (myMember) query.$or.push({ memberId: myMember._id });
    }
    // 4. Group President: Group-level executive access
    else if (effectiveRole === 'President') {
      const presConditions = [
        { userId: req.user._id } // Complaints filed by president personally
      ];
      if (myMember) presConditions.push({ memberId: myMember._id });

      // Complaints addressed to President for the president's active group
      if (activeGrpId) {
        presConditions.push({
          groupId: new mongoose.Types.ObjectId(activeGrpId),
          targetAuthority: 'Group President'
        });
        // Also if transferred by this president
        presConditions.push({
          groupId: new mongoose.Types.ObjectId(activeGrpId),
          transferredBy: req.user._id
        });
      }

      query.$or = presConditions;
    }
    // 5. Group Secretary / Treasurer: Sees their own filed complaints + group oversight if assigned
    else if (['Secretary', 'Treasurer'].includes(effectiveRole)) {
      const execConditions = [
        { userId: req.user._id }
      ];
      if (myMember) execConditions.push({ memberId: myMember._id });
      query.$or = execConditions;
    }
    // 6. Regular Member: ONLY sees their OWN filed complaints for their active group/account
    else {
      const memberConditions = [
        { userId: req.user._id }
      ];
      if (myMember) memberConditions.push({ memberId: myMember._id });
      query.$or = memberConditions;

      if (activeGrpId && activeGrpId !== 'All') {
        query.groupId = new mongoose.Types.ObjectId(activeGrpId);
      }
    }

    // Apply standard filters
    if (branchId && branchId !== 'All' && isSuperAdmin) {
      query.branchId = new mongoose.Types.ObjectId(branchId);
    }
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (targetAuthority && targetAuthority !== 'All') query.targetAuthority = targetAuthority;

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      const searchConds = [
        { ticketId: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
        { raisedByName: searchRegex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConds }];
        delete query.$or;
      } else {
        query.$or = searchConds;
      }
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .populate('groupId', 'groupName groupCode leaderId presidentId secretaryId treasurerId')
      .populate('memberId', 'fullName memberId phone email')
      .populate('userId', 'name email role phone username')
      .populate('resolvedBy', 'name role')
      .populate('transferredBy', 'name role')
      .populate('escalatedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
      currentPage: Number(page),
      data: complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Complaint Details by ID
// @route   GET /api/v1/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const isSuperAdmin = isSuperAdminUser(req.user);
    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || userRole;

    const complaint = await Complaint.findById(req.params.id)
      .populate('organizationId', 'name code email phone address')
      .populate('branchId', 'branchName branchCode address phone')
      .populate('groupId', 'groupName groupCode leaderId presidentId secretaryId treasurerId')
      .populate('memberId', 'fullName memberId phone email profilePicture')
      .populate('userId', 'name email role phone username')
      .populate('resolvedBy', 'name role email')
      .populate('transferredBy', 'name role email')
      .populate('escalatedBy', 'name role email')
      .populate('transferHistory.transferredBy', 'name role')
      .populate('internalNotes.author', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }

    // Access Control Validation
    const myMember = await resolveUserMember(req.user);
    const isSender = (complaint.userId && complaint.userId._id.toString() === req.user._id.toString()) ||
                     (myMember && complaint.memberId && complaint.memberId._id.toString() === myMember._id.toString());

    let hasAccess = false;
    if (isSuperAdmin) {
      hasAccess = true;
    } else if (['Organization Admin', 'Org Admin'].includes(effectiveRole) || ['Organization Admin', 'Org Admin'].includes(userRole)) {
      hasAccess = complaint.organizationId && complaint.organizationId._id.toString() === req.user.organizationId?.toString();
    } else if (effectiveRole === 'Branch Manager' || userRole === 'Branch Manager') {
      hasAccess = isSender || (complaint.branchId && complaint.branchId._id.toString() === req.user.branchId?.toString() &&
                   ['Branch Manager', 'Organization Admin'].includes(complaint.targetAuthority));
    } else if (effectiveRole === 'President') {
      const activeHeaderGrp = req.headers?.['x-active-group'];
      const activeGrpId = activeHeaderGrp || req.user.groupId;
      hasAccess = isSender || (activeGrpId && complaint.groupId && complaint.groupId._id.toString() === activeGrpId.toString());
    } else {
      hasAccess = isSender;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to view this complaint ticket.' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Transfer Complaint to Higher Authority (President -> Branch Manager / Org Admin)
// @route   PUT /api/v1/complaints/:id/transfer
// @access  Private (President, Branch Manager, Org Admin)
exports.transferComplaint = async (req, res) => {
  try {
    const { transferredTo, transferRemarks } = req.body;
    if (!transferredTo || !['Branch Manager', 'Organization Admin', 'Super Admin'].includes(transferredTo)) {
      return res.status(400).json({ success: false, error: 'Invalid target authority for transfer.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }

    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || userRole;

    const fromAuthority = complaint.targetAuthority || 'Group President';
    const remarks = transferRemarks ? transferRemarks.trim() : `Transferred from ${fromAuthority} to ${transferredTo} for official administrative action.`;

    complaint.targetAuthority = transferredTo;
    complaint.transferredTo = transferredTo;
    complaint.status = `Transferred to ${transferredTo}`;
    complaint.transferredBy = req.user._id;
    complaint.transferredAt = new Date();
    complaint.transferRemarks = remarks;

    complaint.transferHistory.push({
      fromAuthority,
      toAuthority: transferredTo,
      transferredBy: req.user._id,
      transferDate: new Date(),
      remarks
    });

    complaint.internalNotes.push({
      note: `Ticket transferred from ${fromAuthority} to ${transferredTo} by ${req.user.name} (${effectiveRole}). Remarks: ${remarks}`,
      author: req.user._id,
      authorName: req.user.name || 'Executive',
      authorRole: effectiveRole,
      createdAt: new Date()
    });

    await complaint.save();

    await logAction(req, 'TRANSFER_COMPLAINT', complaint._id, `Transferred ticket ${complaint.ticketId} from ${fromAuthority} to ${transferredTo}`);

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .populate('groupId', 'groupName groupCode')
      .populate('memberId', 'fullName memberId phone email')
      .populate('userId', 'name email role')
      .populate('transferredBy', 'name role')
      .populate('transferHistory.transferredBy', 'name role')
      .populate('internalNotes.author', 'name role');

    res.status(200).json({
      success: true,
      data: updatedComplaint,
      message: `Complaint ticket ${complaint.ticketId} successfully transferred to ${transferredTo}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Escalate Complaint to Super Admin
// @route   PUT /api/v1/complaints/:id/escalate
// @access  Private (Org Admins, Branch Managers, Super Admin)
exports.escalateComplaint = async (req, res) => {
  try {
    const { escalationReason } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }

    complaint.status = 'Escalated to Super Admin';
    complaint.targetAuthority = 'Super Admin';
    complaint.escalationLevel = 'Super Admin';
    complaint.escalationReason = escalationReason || 'Escalated for Super Administrator final intervention.';
    complaint.escalatedBy = req.user._id;
    complaint.escalatedAt = new Date();

    complaint.transferHistory.push({
      fromAuthority: complaint.targetAuthority || 'Organization Admin',
      toAuthority: 'Super Admin',
      transferredBy: req.user._id,
      transferDate: new Date(),
      remarks: complaint.escalationReason
    });

    complaint.internalNotes.push({
      note: `Ticket escalated to Super Admin. Reason: ${complaint.escalationReason}`,
      author: req.user._id,
      authorName: req.user.name || 'Admin',
      authorRole: req.user.role || 'Organization Admin',
      createdAt: new Date()
    });

    await complaint.save();

    await logAction(req, 'ESCALATE_COMPLAINT', complaint._id, `Escalated ticket ${complaint.ticketId} to Super Admin`);

    res.status(200).json({
      success: true,
      data: complaint,
      message: `Complaint ${complaint.ticketId} has been escalated to Super Admin for resolution.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add Internal Investigation / Communication Note
// @route   POST /api/v1/complaints/:id/notes
// @access  Private
exports.addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note content is required.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }

    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || userRole;

    complaint.internalNotes.push({
      note: note.trim(),
      author: req.user._id,
      authorName: req.user.name || req.user.username,
      authorRole: effectiveRole || 'Officer',
      createdAt: new Date()
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      data: complaint.internalNotes,
      message: 'Investigation memo / note added.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resolve or Update Complaint Status
// @route   PUT /api/v1/complaints/:id/resolve
// @access  Private (Super Admin, Organization Admin, Branch Manager, President)
exports.resolveComplaint = async (req, res) => {
  try {
    const { status, resolutionRemarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint ticket not found.' });
    }

    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || userRole;

    complaint.status = status || 'Resolved';
    if (resolutionRemarks) {
      complaint.resolutionRemarks = resolutionRemarks.trim();
    }
    complaint.resolvedBy = req.user._id;
    complaint.resolvedAt = new Date();

    complaint.internalNotes.push({
      note: `Status updated to ${complaint.status} by ${req.user.name} (${effectiveRole}). Resolution decree: ${complaint.resolutionRemarks || 'None specified'}`,
      author: req.user._id,
      authorName: req.user.name,
      authorRole: effectiveRole,
      createdAt: new Date()
    });

    await complaint.save();

    await logAction(req, 'RESOLVE_COMPLAINT', complaint._id, `Resolved ticket ${complaint.ticketId} with status ${complaint.status}`);

    const updated = await Complaint.findById(complaint._id)
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .populate('groupId', 'groupName groupCode')
      .populate('memberId', 'fullName memberId phone email')
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name role')
      .populate('transferredBy', 'name role')
      .populate('internalNotes.author', 'name role');

    res.status(200).json({
      success: true,
      data: updated,
      message: `Complaint ticket ${complaint.ticketId} updated to ${complaint.status}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Complaint Summary KPI Stats
// @route   GET /api/v1/complaints/stats
// @access  Private
exports.getComplaintStats = async (req, res) => {
  try {
    const isSuperAdmin = isSuperAdminUser(req.user);
    const activeHeaderRole = req.headers?.['x-active-group-role'];
    const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || '';
    const effectiveRole = activeHeaderRole || userRole;
    const activeHeaderGrp = req.headers?.['x-active-group'];
    const activeGrpId = req.query.groupId || activeHeaderGrp || req.user.groupId;

    const myMember = await resolveUserMember(req.user);
    const baseFilter = {};

    if (isSuperAdmin) {
      if (req.query.organizationId && req.query.organizationId !== 'All') {
        baseFilter.organizationId = new mongoose.Types.ObjectId(req.query.organizationId);
      }
    } else if (['Organization Admin', 'Org Admin'].includes(effectiveRole) || ['Organization Admin', 'Org Admin'].includes(userRole)) {
      baseFilter.organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    } else if (effectiveRole === 'Branch Manager' || userRole === 'Branch Manager') {
      baseFilter.organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
      if (req.user.branchId) baseFilter.branchId = new mongoose.Types.ObjectId(req.user.branchId);
      baseFilter.$or = [
        { targetAuthority: 'Branch Manager' },
        { transferredTo: 'Branch Manager' },
        { userId: req.user._id }
      ];
    } else if (effectiveRole === 'President') {
      const presConditions = [{ userId: req.user._id }];
      if (myMember) presConditions.push({ memberId: myMember._id });
      if (activeGrpId) {
        presConditions.push({ groupId: new mongoose.Types.ObjectId(activeGrpId), targetAuthority: 'Group President' });
      }
      baseFilter.$or = presConditions;
    } else {
      const memberConditions = [{ userId: req.user._id }];
      if (myMember) memberConditions.push({ memberId: myMember._id });
      baseFilter.$or = memberConditions;
      if (activeGrpId && activeGrpId !== 'All') {
        baseFilter.groupId = new mongoose.Types.ObjectId(activeGrpId);
      }
    }

    const totalTickets = await Complaint.countDocuments(baseFilter);
    const openTickets = await Complaint.countDocuments({ ...baseFilter, status: 'Submitted' });
    const inProgressTickets = await Complaint.countDocuments({ ...baseFilter, status: { $in: ['Under Review', 'In Progress', 'Transferred to Branch Manager', 'Transferred to Org Admin'] } });
    const escalatedTickets = await Complaint.countDocuments({ ...baseFilter, status: 'Escalated to Super Admin' });
    const resolvedTickets = await Complaint.countDocuments({ ...baseFilter, status: { $in: ['Resolved', 'Closed'] } });
    const criticalTickets = await Complaint.countDocuments({ ...baseFilter, priority: 'Critical' });

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        escalatedTickets,
        resolvedTickets,
        criticalTickets,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
