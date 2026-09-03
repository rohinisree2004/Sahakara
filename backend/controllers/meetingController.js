const Meeting = require('../models/Meeting');
const MeetingAgenda = require('../models/MeetingAgenda');
const MeetingParticipant = require('../models/MeetingParticipant');
const MeetingAttendance = require('../models/MeetingAttendance');
const MeetingMinute = require('../models/MeetingMinute');
const MeetingActionItem = require('../models/MeetingActionItem');
const MeetingDocument = require('../models/MeetingDocument');
const User = require('../models/User');
const Member = require('../models/Member');
const Group = require('../models/Group');
const GroupMembership = require('../models/GroupMembership');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// Helper to determine active organization scope
const getEffectiveOrgId = (req) => {
  const isSuperAdmin = req.user?.role === 'Super Admin' || req.user?.role?.name === 'Super Admin';
  if (isSuperAdmin) {
    return req.body?.organizationId || req.query?.organizationId || null;
  }
  return req.user?.organizationId || null;
};

// Helper to determine active branch scope with strict isolation
const getEffectiveBranchId = (req) => {
  const roleName = typeof req.user?.role === 'string' ? req.user?.role : req.user?.role?.name || '';
  if (['Branch Manager', 'Employee'].includes(roleName) || (req.user?.branchId && roleName !== 'Organization Admin' && roleName !== 'Super Admin')) {
    return req.user?.branchId || null;
  }
  const raw = req.body?.branchId || req.query?.branchId;
  return raw && raw !== 'All' ? raw : null;
};

// Helper for Audit Logging
const logAction = async (req, action, resourceType, resourceId, details) => {
  try {
    const orgId = getEffectiveOrgId(req) || req?.user?.organizationId;
    await AuditLog.create({
      organizationId: orgId,
      branchId: req?.body?.branchId || req?.query?.branchId || null,
      userId: req?.user?._id || null,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req?.ip || '127.0.0.1',
    });
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

// Helper to auto-mark past meetings as Completed/Ended
const autoUpdateEndedMeetings = async (filter = {}) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Mark meetings scheduled before today as Completed
    await Meeting.updateMany(
      {
        ...filter,
        status: { $in: ['Scheduled', 'Ongoing'] },
        date: { $lt: startOfToday }
      },
      {
        $set: { status: 'Completed' }
      }
    );

    // 2. Mark today's meetings where endTime has already passed as Completed
    const todaysMeetings = await Meeting.find({
      ...filter,
      status: { $in: ['Scheduled', 'Ongoing'] },
      date: { $gte: startOfToday, $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) }
    });

    for (const m of todaysMeetings) {
      if (m.endTime) {
        try {
          let [timePart, modifier] = m.endTime.trim().split(' ');
          let [hours, minutes] = timePart.split(':').map(Number);
          if (modifier) {
            if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
          }
          const meetingEndTime = new Date(m.date);
          meetingEndTime.setHours(hours || 0, minutes || 0, 0, 0);
          if (now > meetingEndTime) {
            m.status = 'Completed';
            await m.save();
          }
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Auto update ended meetings error:', err.message);
  }
};

// @desc    Get Meeting Dashboard Stats
// @route   GET /api/v1/meetings/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const orgId = getEffectiveOrgId(req);
    const branchId = getEffectiveBranchId(req);
    const { groupId } = req.query;
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const baseFilter = {};
    if (orgId && orgId !== 'All') {
      baseFilter.organizationId = new mongoose.Types.ObjectId(orgId);
    }
    if (branchId && branchId !== 'All') {
      baseFilter.branchId = new mongoose.Types.ObjectId(branchId);
    }
    if (groupId && groupId !== 'All') {
      baseFilter.groupId = new mongoose.Types.ObjectId(groupId);
    }

    // Auto mark ended meetings in background
    await autoUpdateEndedMeetings(baseFilter);

    const [
      totalMeetings,
      upcomingCount,
      completedCount,
      cancelledCount,
      todaysCount,
      thisMonthCount,
      agmCount,
      groupMeetingsCount,
      boardMeetingsCount,
      recentMeetings,
      upcomingMeetings,
      attendanceStats
    ] = await Promise.all([
      Meeting.countDocuments(baseFilter),
      Meeting.countDocuments({ ...baseFilter, status: 'Scheduled', date: { $gte: startOfToday } }),
      Meeting.countDocuments({ ...baseFilter, status: 'Completed' }),
      Meeting.countDocuments({ ...baseFilter, status: 'Cancelled' }),
      Meeting.countDocuments({ ...baseFilter, date: { $gte: startOfToday, $lte: endOfToday } }),
      Meeting.countDocuments({ ...baseFilter, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Meeting.countDocuments({ ...baseFilter, meetingType: { $in: ['Annual General Meeting (AGM)', 'Special General Meeting (SGM)'] } }),
      Meeting.countDocuments({ ...baseFilter, meetingType: 'Group Meeting' }),
      Meeting.countDocuments({ ...baseFilter, meetingType: { $in: ['Board Meeting', 'Executive Committee'] } }),
      Meeting.find(baseFilter)
        .sort({ date: -1 })
        .limit(6)
        .populate('organizationId', 'name code')
        .populate('branchId', 'branchName branchCode')
        .populate('groupId', 'groupName groupCode')
        .populate('organizerId', 'name email username'),
      Meeting.find({ ...baseFilter, status: 'Scheduled', date: { $gte: startOfToday } })
        .sort({ date: 1 })
        .limit(6)
        .populate('organizationId', 'name code')
        .populate('branchId', 'branchName branchCode')
        .populate('groupId', 'groupName groupCode')
        .populate('organizerId', 'name email username'),
      MeetingAttendance.aggregate([
        ...(orgId && orgId !== 'All' ? [{ $match: { organizationId: new mongoose.Types.ObjectId(orgId) } }] : []),
        {
          $group: {
            _id: '$attendanceStatus',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    let present = 0, totalAttended = 0;
    attendanceStats.forEach(stat => {
      totalAttended += stat.count;
      if (stat._id === 'Present' || stat._id === 'Late') present += stat.count;
    });

    const attendancePercentage = totalAttended > 0 ? Math.round((present / totalAttended) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalMeetings,
          upcomingMeetings: upcomingCount,
          completedMeetings: completedCount,
          cancelledMeetings: cancelledCount,
          todaysMeetings: todaysCount,
          thisMonthMeetings: thisMonthCount,
          agmCount,
          groupMeetingsCount,
          boardMeetingsCount,
          attendancePercentage
        },
        recentMeetings,
        upcomingMeetingsList: upcomingMeetings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Calendar Meetings
// @route   GET /api/v1/meetings/calendar
// @access  Private
exports.getCalendarMeetings = async (req, res, next) => {
  try {
    const orgId = getEffectiveOrgId(req);
    const branchId = getEffectiveBranchId(req);
    const { groupId, startDate, endDate, status, meetingType } = req.query;

    const query = {};
    if (orgId && orgId !== 'All') query.organizationId = orgId;
    if (branchId && branchId !== 'All') query.branchId = branchId;
    if (groupId && groupId !== 'All') query.groupId = groupId;

    await autoUpdateEndedMeetings(query);

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (status && status !== 'All') query.status = status;
    if (meetingType && meetingType !== 'All') query.meetingType = meetingType;

    const meetings = await Meeting.find(query)
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .populate('groupId', 'groupName groupCode')
      .populate('organizerId', 'name email username')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Meetings (List View with filters)
// @route   GET /api/v1/meetings
// @access  Private
exports.getMeetingsList = async (req, res, next) => {
  try {
    const orgId = getEffectiveOrgId(req);
    const branchId = getEffectiveBranchId(req);
    const {
      organizationId,
      groupId,
      search,
      meetingType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    const targetOrgId = organizationId || orgId;
    if (targetOrgId && targetOrgId !== 'All') {
      query.organizationId = targetOrgId;
    }
    if (branchId && branchId !== 'All') {
      query.branchId = branchId;
    }
    if (groupId && groupId !== 'All') {
      query.groupId = groupId;
    }

    await autoUpdateEndedMeetings(query);

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { meetingId: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (meetingType && meetingType !== 'All') query.meetingType = meetingType;
    if (status && status !== 'All') query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .populate('organizationId', 'name code')
      .populate('branchId', 'branchName branchCode')
      .populate('groupId', 'groupName groupCode')
      .populate('organizerId', 'name email username')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: meetings.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: Number(page),
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Meeting Details
// @route   GET /api/v1/meetings/:id
// @access  Private
exports.getMeetingDetails = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role === 'Super Admin' || req.user?.role?.name === 'Super Admin';
    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user?.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const meeting = await Meeting.findOne(query)
      .populate('organizationId', 'name code email phone address')
      .populate('organizerId', 'name email username phone')
      .populate('branchId', 'branchName branchCode city address')
      .populate('groupId', 'groupName groupCode description leaderId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    const [agendas, rawParticipants, attendanceRecords, minutes, actionItems, documents] = await Promise.all([
      MeetingAgenda.find({ meetingId: meeting._id }).sort({ order: 1 }),
      MeetingParticipant.find({ meetingId: meeting._id }),
      MeetingAttendance.find({ meetingId: meeting._id }),
      MeetingMinute.findOne({ meetingId: meeting._id })
        .populate('finalizedBy', 'name email')
        .populate('createdBy', 'name email'),
      MeetingActionItem.find({ meetingId: meeting._id }),
      MeetingDocument.find({ meetingId: meeting._id })
        .populate('uploadedBy', 'name email')
    ]);

    // Build attendance map for quick lookup
    const attMap = {};
    attendanceRecords.forEach(att => {
      attMap[String(att.participantId)] = att;
    });

    // Populate participants manually for polymorphic ref
    const participants = await Promise.all(
      rawParticipants.map(async (p) => {
        let details = null;
        if (p.participantType === 'User') {
          details = await User.findById(p.participantId, 'name email role phone username');
        } else if (p.participantType === 'Member') {
          details = await Member.findById(p.participantId, 'fullName firstName lastName memberId phone email memberNumber status');
        }
        const attendance = attMap[String(p.participantId)] || null;
        return {
          ...p.toObject(),
          participantDetails: details,
          attendanceStatus: attendance ? attendance.attendanceStatus : 'Invited',
          checkInTime: attendance ? attendance.checkInTime : null,
          remarks: attendance ? attendance.remarks : ''
        };
      })
    );

    // Calculate Quorum Stats
    const totalInvited = participants.length;
    const presentCount = attendanceRecords.filter(a => a.attendanceStatus === 'Present' || a.attendanceStatus === 'Late').length;
    const absentCount = attendanceRecords.filter(a => a.attendanceStatus === 'Absent').length;
    const excusedCount = attendanceRecords.filter(a => a.attendanceStatus === 'Excused').length;
    const quorumPercentage = totalInvited > 0 ? Math.round((presentCount / totalInvited) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        meeting,
        agendas,
        participants,
        attendance: attendanceRecords,
        minutes,
        actionItems,
        documents,
        quorumStats: {
          totalInvited,
          presentCount,
          absentCount,
          excusedCount,
          quorumPercentage,
          isQuorumMet: quorumPercentage >= 50
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Meeting
// @route   POST /api/v1/meetings
// @access  Private
exports.createMeeting = async (req, res, next) => {
  try {
    const {
      organizationId,
      branchId,
      groupId,
      title,
      meetingType,
      audienceTargetType = 'CustomSelection',
      date,
      startTime,
      endTime,
      venue,
      description,
      priority,
      organizerId,
      agendas = [],
      participants = []
    } = req.body;

    const targetOrgId = organizationId || req.user.organizationId;
    if (!targetOrgId) {
      return res.status(400).json({ success: false, error: 'Target Organization / Society is required' });
    }

    if (!title || !date || !startTime || !endTime || !venue) {
      return res.status(400).json({ success: false, error: 'Please fill in all mandatory meeting fields (Title, Date, Time, Venue).' });
    }

    const count = await Meeting.countDocuments({ organizationId: targetOrgId });
    const year = new Date(date || Date.now()).getFullYear();
    const meetingId = `MTG-${year}-${String(count + 1).padStart(3, '0')}`;

    const meeting = await Meeting.create({
      organizationId: targetOrgId,
      branchId: branchId && branchId !== 'All' ? branchId : null,
      groupId: groupId && groupId !== 'All' ? groupId : null,
      meetingId,
      title: title.trim(),
      meetingType: meetingType || 'General Meeting',
      audienceTargetType: audienceTargetType || 'CustomSelection',
      description,
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      organizerId: organizerId || req.user._id,
      priority: priority || 'Medium',
      status: 'Scheduled',
      createdBy: req.user._id
    });

    // 1. Add Agendas
    if (agendas.length > 0) {
      const agendaDocs = agendas.filter(ag => ag.title && ag.title.trim()).map((ag, idx) => ({
        organizationId: targetOrgId,
        meetingId: meeting._id,
        title: ag.title.trim(),
        description: ag.description || '',
        order: idx + 1,
        responsiblePersonId: ag.responsiblePersonId || null,
        responsiblePersonModel: ag.responsiblePersonModel || 'User'
      }));
      if (agendaDocs.length > 0) {
        await MeetingAgenda.insertMany(agendaDocs);
      }
    }

    // 2. Resolve and Auto-Populate Participants based on Audience Target
    const participantMap = new Map(); // key: `${participantType}_${participantId}`

    // Helper to add to participant map
    const addInvitee = async (participantType, rawParticipantId) => {
      if (!rawParticipantId) return;
      let validObjectId = null;

      if (mongoose.Types.ObjectId.isValid(rawParticipantId)) {
        validObjectId = rawParticipantId;
      } else if (participantType === 'Member') {
        const found = await Member.findOne({ memberId: String(rawParticipantId) }).select('_id');
        if (found) validObjectId = found._id;
      } else if (participantType === 'User') {
        const found = await User.findOne({ username: String(rawParticipantId) }).select('_id');
        if (found) validObjectId = found._id;
      }

      if (!validObjectId) return;

      const key = `${participantType}_${String(validObjectId)}`;
      if (!participantMap.has(key)) {
        participantMap.set(key, {
          organizationId: targetOrgId,
          meetingId: meeting._id,
          participantType,
          participantId: validObjectId,
          invitationStatus: 'Invited'
        });
      }
    };

    // A. If All Society Members (e.g. AGM, SGM, General Body)
    if (audienceTargetType === 'AllMembers' || meetingType === 'Annual General Meeting (AGM)' || meetingType === 'Special General Meeting (SGM)') {
      const memberQuery = { organizationId: targetOrgId, status: { $ne: 'Inactive' } };
      if (branchId && branchId !== 'All') {
        memberQuery.branchId = branchId;
      }
      const allMembers = await Member.find(memberQuery).select('_id');
      for (const m of allMembers) {
        await addInvitee('Member', m._id);
      }

      // Also add Society Executive Users to AGM
      const executives = await User.find({
        organizationId: targetOrgId,
        isActive: { $ne: false }
      }).select('_id');
      for (const u of executives) {
        await addInvitee('User', u._id);
      }
    }
    // B. If All Organization Executives / Board of Directors
    else if (audienceTargetType === 'AllExecutives' || meetingType === 'Board Meeting' || meetingType === 'Executive Committee') {
      const executives = await User.find({
        organizationId: targetOrgId,
        isActive: { $ne: false }
      }).select('_id role');
      for (const u of executives) {
        await addInvitee('User', u._id);
      }
    }
    // C. If Entire Branch Staff & Members
    else if (audienceTargetType === 'EntireBranch' && branchId && branchId !== 'All') {
      const branchMembers = await Member.find({ organizationId: targetOrgId, branchId, status: { $ne: 'Inactive' } }).select('_id');
      for (const m of branchMembers) {
        await addInvitee('Member', m._id);
      }

      const branchUsers = await User.find({ organizationId: targetOrgId, branchId, isActive: { $ne: false } }).select('_id');
      for (const u of branchUsers) {
        await addInvitee('User', u._id);
      }
    }
    // D. If Entire SHG / JLG Group
    else if (audienceTargetType === 'EntireGroup' && groupId && groupId !== 'All') {
      const grp = await Group.findById(groupId);
      if (grp) {
        if (Array.isArray(grp.memberIds)) {
          for (const mId of grp.memberIds) {
            const rawId = mId?._id || mId?.memberId || mId;
            if (rawId) await addInvitee('Member', rawId);
          }
        }
        if (grp.leaderId) await addInvitee('Member', grp.leaderId?._id || grp.leaderId);
        if (grp.presidentId) await addInvitee('Member', grp.presidentId?._id || grp.presidentId);
        if (grp.secretaryId) await addInvitee('Member', grp.secretaryId?._id || grp.secretaryId);
        if (grp.treasurerId) await addInvitee('Member', grp.treasurerId?._id || grp.treasurerId);
      }
      // Also check GroupMembership collection
      const memberships = await GroupMembership.find({ groupId }).select('memberId');
      for (const gm of memberships) {
        if (gm?.memberId) await addInvitee('Member', gm.memberId?._id || gm.memberId);
      }
    }

    // E. Add any manual/custom participants provided in the request
    if (Array.isArray(participants) && participants.length > 0) {
      for (const p of participants) {
        if (p.participantId) {
          await addInvitee(p.participantType || 'User', p.participantId);
        }
      }
    }

    const participantDocs = Array.from(participantMap.values());
    if (participantDocs.length > 0) {
      await MeetingParticipant.insertMany(participantDocs);

      // Initialize attendance records
      const attendanceDocs = participantDocs.map(p => ({
        organizationId: targetOrgId,
        meetingId: meeting._id,
        participantType: p.participantType,
        participantId: p.participantId,
        attendanceStatus: 'Absent',
        markedBy: req.user._id
      }));
      await MeetingAttendance.insertMany(attendanceDocs);
    }

    await logAction(req, 'CREATE_MEETING', 'Meeting', meeting._id, `Scheduled ${meeting.meetingType} ${meeting.meetingId}: ${meeting.title} with ${participantDocs.length} invitees`);

    res.status(201).json({
      success: true,
      data: meeting,
      inviteeCount: participantDocs.length,
      message: `Meeting ${meeting.meetingId} scheduled successfully with ${participantDocs.length} invited participants.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Meeting
// @route   PUT /api/v1/meetings/:id
// @access  Private
exports.updateMeeting = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role === 'Super Admin' || req.user?.role?.name === 'Super Admin';
    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user?.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const meeting = await Meeting.findOne(query);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    const minutes = await MeetingMinute.findOne({ meetingId: meeting._id });
    if (minutes && minutes.finalized) {
      return res.status(400).json({ success: false, error: 'Cannot modify meeting details after minutes are finalized and locked.' });
    }

    const allowedUpdates = [
      'title', 'meetingType', 'audienceTargetType', 'branchId', 'groupId', 'date',
      'startTime', 'endTime', 'venue', 'description', 'priority', 'status', 'organizerId'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    meeting.updatedBy = req.user._id;
    await meeting.save();

    await logAction(req, 'UPDATE_MEETING', 'Meeting', meeting._id, `Updated meeting ${meeting.meetingId}`);

    res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting details updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Meeting
// @route   POST /api/v1/meetings/:id/cancel
// @access  Private
exports.cancelMeeting = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role === 'Super Admin' || req.user?.role?.name === 'Super Admin';
    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user?.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const meeting = await Meeting.findOne(query);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    meeting.status = 'Cancelled';
    meeting.updatedBy = req.user._id;
    await meeting.save();

    await logAction(req, 'CANCEL_MEETING', 'Meeting', meeting._id, `Cancelled meeting ${meeting.meetingId}`);

    res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark meeting as Ended / Completed
// @route   POST /api/v1/meetings/:id/end
// @access  Private
exports.endMeeting = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role === 'Super Admin' || req.user?.role?.name === 'Super Admin';
    const query = { _id: req.params.id };
    if (!isSuperAdmin && req.user?.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    const meeting = await Meeting.findOne(query);
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    if (meeting.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot end a cancelled assembly.' });
    }

    meeting.status = 'Completed';
    meeting.updatedBy = req.user._id;
    await meeting.save();

    await logAction(req, 'END_MEETING', 'Meeting', meeting._id, `Marked meeting ${meeting.meetingId} as Ended / Completed`);

    res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting has been marked as ended successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// AGENDA MANAGEMENT
// ==========================================
exports.addAgendaItem = async (req, res, next) => {
  try {
    const { title, description, responsiblePersonId, responsiblePersonModel } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    const count = await MeetingAgenda.countDocuments({ meetingId: meeting._id });

    const agenda = await MeetingAgenda.create({
      organizationId: meeting.organizationId,
      meetingId: meeting._id,
      title: title.trim(),
      description: description || '',
      order: count + 1,
      responsiblePersonId: responsiblePersonId || null,
      responsiblePersonModel: responsiblePersonModel || 'User'
    });

    res.status(201).json({ success: true, data: agenda, message: 'Agenda item added' });
  } catch (error) {
    next(error);
  }
};

exports.updateAgendaItem = async (req, res, next) => {
  try {
    const agenda = await MeetingAgenda.findOneAndUpdate(
      { _id: req.params.agendaId, meetingId: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, data: agenda, message: 'Agenda item updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteAgendaItem = async (req, res, next) => {
  try {
    await MeetingAgenda.findOneAndDelete({ _id: req.params.agendaId, meetingId: req.params.id });
    res.status(200).json({ success: true, message: 'Agenda item deleted' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PARTICIPANT SEARCH & MANAGEMENT
// ==========================================
exports.searchParticipants = async (req, res, next) => {
  try {
    const { query = '', organizationId, branchId, type = 'all' } = req.query;
    const orgId = organizationId || getEffectiveOrgId(req);

    const userQuery = {};
    const memberQuery = {};

    if (orgId && orgId !== 'All') {
      userQuery.organizationId = orgId;
      memberQuery.organizationId = orgId;
    }
    if (branchId && branchId !== 'All') {
      userQuery.branchId = branchId;
      memberQuery.branchId = branchId;
    }

    if (query.trim()) {
      userQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ];
      memberQuery.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { memberId: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ];
    }

    let formattedUsers = [];
    let formattedMembers = [];

    if (type === 'all' || type === 'users') {
      const users = await User.find(userQuery).limit(20).select('name email role username branchId');
      formattedUsers = users.map(u => ({
        participantId: u._id,
        participantType: 'User',
        name: u.name,
        subText: `${u.role || 'Staff'} • ${u.email}`,
        email: u.email
      }));
    }

    if (type === 'all' || type === 'members') {
      const members = await Member.find(memberQuery).limit(30).select('fullName firstName lastName memberId phone branchId');
      formattedMembers = members.map(m => ({
        participantId: m._id,
        participantType: 'Member',
        name: m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        subText: `Member ID: ${m.memberId || 'N/A'} • Phone: ${m.phone || 'N/A'}`,
        phone: m.phone
      }));
    }

    res.status(200).json({
      success: true,
      data: [...formattedUsers, ...formattedMembers]
    });
  } catch (error) {
    next(error);
  }
};

exports.addParticipants = async (req, res, next) => {
  try {
    const { participants } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ success: false, error: 'Participants array is required' });
    }

    const docs = participants.map(p => ({
      organizationId: meeting.organizationId,
      meetingId: meeting._id,
      participantType: p.participantType || 'Member',
      participantId: p.participantId,
      invitationStatus: 'Invited'
    }));

    await MeetingParticipant.insertMany(docs, { ordered: false }).catch(() => {});

    // Also insert initial attendance
    const attendanceDocs = participants.map(p => ({
      organizationId: meeting.organizationId,
      meetingId: meeting._id,
      participantType: p.participantType || 'Member',
      participantId: p.participantId,
      attendanceStatus: 'Absent',
      markedBy: req.user._id
    }));
    await MeetingAttendance.insertMany(attendanceDocs, { ordered: false }).catch(() => {});

    res.status(200).json({ success: true, message: `${participants.length} participant(s) invited successfully` });
  } catch (error) {
    next(error);
  }
};

exports.removeParticipant = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    await Promise.all([
      MeetingParticipant.deleteOne({ meetingId: meeting._id, participantId: req.params.participantId }),
      MeetingAttendance.deleteOne({ meetingId: meeting._id, participantId: req.params.participantId })
    ]);

    res.status(200).json({ success: true, message: 'Participant removed from meeting' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ATTENDANCE MANAGEMENT & QUORUM
// ==========================================
exports.getAttendance = async (req, res, next) => {
  try {
    const records = await MeetingAttendance.find({ meetingId: req.params.id })
      .populate('markedBy', 'name email');
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { attendanceRecords } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    if (!Array.isArray(attendanceRecords)) {
      return res.status(400).json({ success: false, error: 'attendanceRecords array is required' });
    }

    const bulkOps = attendanceRecords.map(rec => ({
      updateOne: {
        filter: {
          meetingId: meeting._id,
          participantId: rec.participantId
        },
        update: {
          $set: {
            organizationId: meeting.organizationId,
            participantType: rec.participantType,
            attendanceStatus: rec.attendanceStatus,
            remarks: rec.remarks || '',
            markedBy: req.user._id,
            checkInTime: rec.attendanceStatus === 'Present' || rec.attendanceStatus === 'Late' ? (rec.checkInTime || new Date()) : null
          }
        },
        upsert: true
      }
    }));

    await MeetingAttendance.bulkWrite(bulkOps);

    // If meeting was Scheduled and attendance is marked, switch to Ongoing if not Completed
    if (meeting.status === 'Scheduled') {
      meeting.status = 'Ongoing';
      await meeting.save();
    }

    await logAction(req, 'MARK_ATTENDANCE', 'Meeting', meeting._id, `Recorded attendance roll-call for ${attendanceRecords.length} attendees`);

    res.status(200).json({ success: true, message: 'Attendance roll-call saved successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MINUTES MANAGEMENT
// ==========================================
exports.saveMinutes = async (req, res, next) => {
  try {
    const { summary, discussions, decisions, resolutions } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    let minutes = await MeetingMinute.findOne({ meetingId: meeting._id });
    if (minutes && minutes.finalized) {
      return res.status(400).json({ success: false, error: 'Minutes are already finalized and locked.' });
    }

    if (!minutes) {
      minutes = await MeetingMinute.create({
        organizationId: meeting.organizationId,
        meetingId: meeting._id,
        summary,
        discussions,
        decisions,
        resolutions,
        createdBy: req.user._id
      });
    } else {
      minutes.summary = summary;
      minutes.discussions = discussions;
      minutes.decisions = decisions;
      minutes.resolutions = resolutions;
      await minutes.save();
    }

    res.status(200).json({ success: true, data: minutes, message: 'Draft meeting minutes saved successfully' });
  } catch (error) {
    next(error);
  }
};

exports.finalizeMinutes = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    const minutes = await MeetingMinute.findOne({ meetingId: meeting._id });
    if (!minutes) {
      return res.status(404).json({ success: false, error: 'No draft minutes found to finalize. Please write minutes first.' });
    }

    minutes.finalized = true;
    minutes.finalizedBy = req.user._id;
    minutes.finalizedAt = new Date();
    await minutes.save();

    meeting.status = 'Completed';
    await meeting.save();

    await logAction(req, 'FINALIZE_MINUTES', 'MeetingMinute', minutes._id, `Finalized and locked minutes for meeting ${meeting.meetingId}`);

    res.status(200).json({ success: true, data: minutes, message: 'Meeting minutes officially adopted, signed, and locked.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ACTION ITEMS MANAGEMENT
// ==========================================
exports.addActionItem = async (req, res, next) => {
  try {
    const { task, assignedTo, assignedToModel, dueDate, remarks } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    const item = await MeetingActionItem.create({
      organizationId: meeting.organizationId,
      meetingId: meeting._id,
      task: task.trim(),
      assignedTo: assignedTo || null,
      assignedToModel: assignedToModel || 'User',
      dueDate,
      remarks
    });

    res.status(201).json({ success: true, data: item, message: 'Action item registered' });
  } catch (error) {
    next(error);
  }
};

exports.updateActionItem = async (req, res, next) => {
  try {
    const item = await MeetingActionItem.findOneAndUpdate(
      { _id: req.params.itemId, meetingId: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, data: item, message: 'Action item updated' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DOCUMENT MANAGEMENT
// ==========================================
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document file uploaded' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    const { documentType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await MeetingDocument.create({
      organizationId: meeting.organizationId,
      meetingId: meeting._id,
      documentType: documentType || 'Supporting Document',
      fileUrl,
      fileName: req.file.originalname,
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, data: doc, message: 'Document attached successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MEETING REPORTS
// ==========================================
exports.getMeetingReports = async (req, res, next) => {
  try {
    const orgId = getEffectiveOrgId(req);
    const branchId = getEffectiveBranchId(req);

    const match = {};
    if (orgId && orgId !== 'All') match.organizationId = new mongoose.Types.ObjectId(orgId);
    if (branchId && branchId !== 'All') match.branchId = new mongoose.Types.ObjectId(branchId);

    const [typeStats, statusStats, totalCount] = await Promise.all([
      Meeting.aggregate([
        { $match: Object.keys(match).length ? match : { _id: { $exists: true } } },
        { $group: { _id: '$meetingType', count: { $sum: 1 } } }
      ]),
      Meeting.aggregate([
        { $match: Object.keys(match).length ? match : { _id: { $exists: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Meeting.countDocuments(match)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCount,
        byType: typeStats,
        byStatus: statusStats
      }
    });
  } catch (error) {
    next(error);
  }
};
