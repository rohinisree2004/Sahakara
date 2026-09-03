const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerUpload');
const {
  getDashboardStats,
  getCalendarMeetings,
  getMeetingsList,
  getMeetingDetails,
  createMeeting,
  updateMeeting,
  cancelMeeting,
  endMeeting,
  addAgendaItem,
  updateAgendaItem,
  deleteAgendaItem,
  searchParticipants,
  addParticipants,
  removeParticipant,
  getAttendance,
  markAttendance,
  saveMinutes,
  finalizeMinutes,
  addActionItem,
  updateActionItem,
  uploadDocument,
  getMeetingReports
} = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Dashboard & Reports & Calendar
router.get('/dashboard', getDashboardStats);
router.get('/calendar', getCalendarMeetings);
router.get('/reports', getMeetingReports);
router.get('/participants/search', searchParticipants);

// Meetings List & Create
router.route('/')
  .get(getMeetingsList)
  .post(authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), createMeeting);

// Single Meeting Operations
router.route('/:id')
  .get(getMeetingDetails)
  .put(authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), updateMeeting);

router.post('/:id/cancel', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), cancelMeeting);
router.post('/:id/end', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer', 'Employee'), endMeeting);

// Agenda
router.post('/:id/agenda', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), addAgendaItem);
router.put('/:id/agenda/:agendaId', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), updateAgendaItem);
router.delete('/:id/agenda/:agendaId', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), deleteAgendaItem);

// Participants
router.post('/:id/participants', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), addParticipants);
router.delete('/:id/participants/:participantId', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), removeParticipant);

// Attendance
router.get('/:id/attendance', getAttendance);
router.post('/:id/attendance', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), markAttendance);

// Minutes
router.post('/:id/minutes', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), saveMinutes);
router.post('/:id/minutes/finalize', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), finalizeMinutes);

// Action Items
router.post('/:id/action-items', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), addActionItem);
router.put('/:id/action-items/:itemId', authorize('Super Admin', 'Organization Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager', 'Treasurer'), updateActionItem);

// Documents
router.post('/:id/documents', upload.single('file'), uploadDocument);

module.exports = router;
