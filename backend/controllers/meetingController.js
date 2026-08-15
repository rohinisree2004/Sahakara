const Meeting = require('../models/Meeting');
const MeetingAgenda = require('../models/MeetingAgenda');
const MeetingParticipant = require('../models/MeetingParticipant');
const MeetingAttendance = require('../models/MeetingAttendance');
const MeetingMinute = require('../models/MeetingMinute');
const MeetingActionItem = require('../models/MeetingActionItem');
const MeetingDocument = require('../models/MeetingDocument');
const User = require('../models/User');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// Helper for Audit Logging
const logAction = async (req, action, resourceType, resourceId, details) => {
  try {
    await AuditLog.create({
      organizationId: req.user.organizationId,
      branchId: req.body.branchId || req.query.branchId || null,
      userId: req.user._id,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

// @desc    Get Meeting Dashboard Stats
// @route   GET /api/v1/meetings/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalMeetings,
      upcomingCount,
      completedCount,
      cancelledCount,
      todaysCount,
      thisMonthCount,
      recentMeetings,
      upcomingMeetings,
      attendanceStats
    ] = await Promise.all([
      Meeting.countDocuments({ organizationId }),
      Meeting.countDocuments({ organizationId, status: 'Scheduled', date: { $gte: startOfToday } }),
      Meeting.countDocuments({ organizationId, status: 'Completed' }),
      Meeting.countDocuments({ organizationId, status: 'Cancelled' }),
      Meeting.countDocuments({ organizationId, date: { $gte: startOfToday, $lte: endOfToday } }),
      Meeting.countDocuments({ organizationId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Meeting.find({ organizationId })
        .sort({ date: -1 })
        .limit(5)
        .populate('organizerId', 'firstName lastName')
        .populate('branchId', 'name'),
      Meeting.find({ organizationId, status: 'Scheduled', date: { $gte: startOfToday } })
        .sort({ date: 1 })
        .limit(5)
        .populate('organizerId', 'firstName lastName')
        .populate('branchId', 'name'),
      MeetingAttendance.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
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
    const { organizationId } = req.user;
    const { startDate, endDate, status, meetingType } = req.query;

    const query = { organizationId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (status) query.status = status;
    if (meetingType) query.meetingType = meetingType;

    const meetings = await Meeting.find(query)
      .populate('branchId', 'name')
      .populate('groupId', 'name')
      .populate('organizerId', 'firstName lastName')
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
    const { organizationId } = req.user;
    const {
      search,
      meetingType,
      branchId,
      groupId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const query = { organizationId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { meetingId: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (meetingType) query.meetingType = meetingType;
    if (branchId) query.branchId = branchId;
    if (groupId) query.groupId = groupId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .populate('organizerId', 'firstName lastName')
      .populate('branchId', 'name code')
      .populate('groupId', 'name code')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: meetings.length,
      total,
      totalPages: Math.ceil(total / limit),
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
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .populate('organizerId', 'firstName lastName email')
      .populate('branchId', 'name code')
      .populate('groupId', 'name code')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    const [agendas, rawParticipants, attendanceRecords, minutes, actionItems, documents] = await Promise.all([
      MeetingAgenda.find({ meetingId: meeting._id }).sort({ order: 1 }),
      MeetingParticipant.find({ meetingId: meeting._id }),
      MeetingAttendance.find({ meetingId: meeting._id }),
      MeetingMinute.findOne({ meetingId: meeting._id })
        .populate('finalizedBy', 'firstName lastName')
        .populate('createdBy', 'firstName lastName'),
      MeetingActionItem.find({ meetingId: meeting._id }),
      MeetingDocument.find({ meetingId: meeting._id })
        .populate('uploadedBy', 'firstName lastName')
    ]);

    // Populate participants manually for polymorphic ref
    const participants = await Promise.all(
      rawParticipants.map(async (p) => {
        let details = null;
        if (p.participantType === 'User') {
          details = await User.findById(p.participantId, 'firstName lastName email role');
        } else if (p.participantType === 'Member') {
          details = await Member.findById(p.participantId, 'firstName lastName memberId phone');
        }
        return {
          ...p.toObject(),
          participantDetails: details
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        meeting,
        agendas,
        participants,
        attendance: attendanceRecords,
        minutes,
        actionItems,
        documents
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
      title,
      meetingType,
      branchId,
      groupId,
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

    if (!title || !date || !startTime || !endTime || !venue) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const count = await Meeting.countDocuments({ organizationId: req.user.organizationId });
    const meetingId = `MTG-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const meeting = await Meeting.create({
      organizationId: req.user.organizationId,
      branchId: branchId || null,
      groupId: groupId || null,
      meetingId,
      title,
      meetingType: meetingType || 'General Meeting',
      description,
      date,
      startTime,
      endTime,
      venue,
      organizerId: organizerId || req.user._id,
      priority: priority || 'Medium',
      status: 'Scheduled',
      createdBy: req.user._id
    });

    // Add Agendas
    if (agendas.length > 0) {
      const agendaDocs = agendas.map((ag, idx) => ({
        organizationId: req.user.organizationId,
        meetingId: meeting._id,
        title: ag.title,
        description: ag.description || '',
        order: idx + 1,
        responsiblePersonId: ag.responsiblePersonId || null,
        responsiblePersonModel: ag.responsiblePersonModel || 'User'
      }));
      await MeetingAgenda.insertMany(agendaDocs);
    }

    // Add Participants
    if (participants.length > 0) {
      const participantDocs = participants.map(p => ({
        organizationId: req.user.organizationId,
        meetingId: meeting._id,
        participantType: p.participantType || 'User',
        participantId: p.participantId,
        invitationStatus: 'Invited'
      }));
      await MeetingParticipant.insertMany(participantDocs);
    }

    await logAction(req, 'CREATE_MEETING', 'Meeting', meeting._id, `Scheduled meeting ${meeting.meetingId}: ${meeting.title}`);

    res.status(201).json({
      success: true,
      data: meeting,
      message: 'Meeting scheduled successfully'
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
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    // Check if minutes are finalized
    const minutes = await MeetingMinute.findOne({ meetingId: meeting._id });
    if (minutes && minutes.finalized) {
      return res.status(400).json({ success: false, error: 'Cannot modify meeting details after minutes are finalized' });
    }

    const allowedUpdates = [
      'title', 'meetingType', 'branchId', 'groupId', 'date',
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
      message: 'Meeting updated successfully'
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
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    meeting.status = 'Cancelled';
    meeting.updatedBy = req.user._id;
    await meeting.save();

    await logAction(req, 'CANCEL_MEETING', 'Meeting', meeting._id, `Cancelled meeting ${meeting.meetingId}`);

    res.status(200).json({
      success: true,
      message: 'Meeting cancelled successfully',
      data: meeting
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
    const count = await MeetingAgenda.countDocuments({ meetingId: req.params.id });

    const item = await MeetingAgenda.create({
      organizationId: req.user.organizationId,
      meetingId: req.params.id,
      title,
      description,
      order: count + 1,
      responsiblePersonId: responsiblePersonId || null,
      responsiblePersonModel: responsiblePersonModel || 'User'
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateAgendaItem = async (req, res, next) => {
  try {
    const item = await MeetingAgenda.findOneAndUpdate(
      { _id: req.params.agendaId, organizationId: req.user.organizationId },
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteAgendaItem = async (req, res, next) => {
  try {
    await MeetingAgenda.deleteOne({ _id: req.params.agendaId, organizationId: req.user.organizationId });
    res.status(200).json({ success: true, message: 'Agenda item deleted' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PARTICIPANT MANAGEMENT
// ==========================================
exports.searchParticipants = async (req, res, next) => {
  try {
    const { query } = req.query;
    const { organizationId } = req.user;

    const regex = new RegExp(query || '', 'i');

    const [users, members] = await Promise.all([
      User.find({
        organizationId,
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
      }).select('firstName lastName email role'),
      Member.find({
        organizationId,
        $or: [{ firstName: regex }, { lastName: regex }, { memberId: regex }]
      }).select('firstName lastName memberId phone')
    ]);

    const formattedUsers = users.map(u => ({
      participantId: u._id,
      participantType: 'User',
      name: `${u.firstName} ${u.lastName}`,
      subText: `${u.role} (${u.email})`
    }));

    const formattedMembers = members.map(m => ({
      participantId: m._id,
      participantType: 'Member',
      name: `${m.firstName} ${m.lastName}`,
      subText: `Member ${m.memberId}`
    }));

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
    const { participants } = req.body; // Array of { participantType, participantId }
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ success: false, error: 'Participants array required' });
    }

    const docs = participants.map(p => ({
      organizationId: req.user.organizationId,
      meetingId: req.params.id,
      participantType: p.participantType,
      participantId: p.participantId,
      invitationStatus: 'Invited'
    }));

    // Ignore duplicates if any
    await MeetingParticipant.insertMany(docs, { ordered: false }).catch(() => {});

    res.status(200).json({ success: true, message: 'Participants added successfully' });
  } catch (error) {
    next(error);
  }
};

exports.removeParticipant = async (req, res, next) => {
  try {
    await MeetingParticipant.deleteOne({
      meetingId: req.params.id,
      participantId: req.params.participantId,
      organizationId: req.user.organizationId
    });
    res.status(200).json({ success: true, message: 'Participant removed' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ATTENDANCE MANAGEMENT
// ==========================================
exports.getAttendance = async (req, res, next) => {
  try {
    const records = await MeetingAttendance.find({
      meetingId: req.params.id,
      organizationId: req.user.organizationId
    });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { attendanceRecords } = req.body; // Array of { participantType, participantId, attendanceStatus, remarks }
    if (!Array.isArray(attendanceRecords)) {
      return res.status(400).json({ success: false, error: 'attendanceRecords array is required' });
    }

    const bulkOps = attendanceRecords.map(rec => ({
      updateOne: {
        filter: {
          organizationId: req.user.organizationId,
          meetingId: req.params.id,
          participantId: rec.participantId
        },
        update: {
          $set: {
            participantType: rec.participantType,
            attendanceStatus: rec.attendanceStatus,
            remarks: rec.remarks || '',
            markedBy: req.user._id,
            checkInTime: rec.attendanceStatus === 'Present' || rec.attendanceStatus === 'Late' ? new Date() : null
          }
        },
        upsert: true
      }
    }));

    await MeetingAttendance.bulkWrite(bulkOps);

    await logAction(req, 'MARK_ATTENDANCE', 'Meeting', req.params.id, `Marked attendance for meeting`);

    res.status(200).json({ success: true, message: 'Attendance updated successfully' });
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

    let minutes = await MeetingMinute.findOne({
      meetingId: req.params.id,
      organizationId: req.user.organizationId
    });

    if (minutes && minutes.finalized) {
      return res.status(400).json({ success: false, error: 'Minutes are finalized and cannot be modified' });
    }

    if (!minutes) {
      minutes = await MeetingMinute.create({
        organizationId: req.user.organizationId,
        meetingId: req.params.id,
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

    res.status(200).json({ success: true, data: minutes, message: 'Minutes saved' });
  } catch (error) {
    next(error);
  }
};

exports.finalizeMinutes = async (req, res, next) => {
  try {
    const minutes = await MeetingMinute.findOne({
      meetingId: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!minutes) {
      return res.status(404).json({ success: false, error: 'No draft minutes found to finalize' });
    }

    minutes.finalized = true;
    minutes.finalizedBy = req.user._id;
    minutes.finalizedAt = new Date();
    await minutes.save();

    // Mark meeting status as Completed
    await Meeting.findByIdAndUpdate(req.params.id, { status: 'Completed' });

    await logAction(req, 'FINALIZE_MINUTES', 'MeetingMinute', minutes._id, `Finalized minutes for meeting`);

    res.status(200).json({ success: true, data: minutes, message: 'Meeting minutes finalized and locked' });
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
    const item = await MeetingActionItem.create({
      organizationId: req.user.organizationId,
      meetingId: req.params.id,
      task,
      assignedTo: assignedTo || null,
      assignedToModel: assignedToModel || 'User',
      dueDate,
      remarks
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateActionItem = async (req, res, next) => {
  try {
    const item = await MeetingActionItem.findOneAndUpdate(
      { _id: req.params.itemId, organizationId: req.user.organizationId },
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, data: item });
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
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { documentType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await MeetingDocument.create({
      organizationId: req.user.organizationId,
      meetingId: req.params.id,
      documentType: documentType || 'Supporting Document',
      fileUrl,
      fileName: req.file.originalname,
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MEETING REPORTS
// ==========================================
exports.getMeetingReports = async (req, res, next) => {
  try {
    const { organizationId } = req.user;

    const [typeStats, statusStats, totalCount] = await Promise.all([
      Meeting.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        { $group: { _id: '$meetingType', count: { $sum: 1 } } }
      ]),
      Meeting.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Meeting.countDocuments({ organizationId })
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
