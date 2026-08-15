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
  .post(authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), createMeeting);

// Single Meeting Operations
router.route('/:id')
  .get(getMeetingDetails)
  .put(authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), updateMeeting);

router.post('/:id/cancel', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), cancelMeeting);

// Agenda
router.post('/:id/agenda', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), addAgendaItem);
router.put('/:id/agenda/:agendaId', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), updateAgendaItem);
router.delete('/:id/agenda/:agendaId', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), deleteAgendaItem);

// Participants
router.post('/:id/participants', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), addParticipants);
router.delete('/:id/participants/:participantId', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), removeParticipant);

// Attendance
router.get('/:id/attendance', getAttendance);
router.post('/:id/attendance', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), markAttendance);

// Minutes
router.post('/:id/minutes', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), saveMinutes);
router.post('/:id/minutes/finalize', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), finalizeMinutes);

// Action Items
router.post('/:id/action-items', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), addActionItem);
router.put('/:id/action-items/:itemId', authorize('Super Admin', 'Org Admin', 'President', 'Secretary', 'Branch Manager'), updateActionItem);

// Documents
router.post('/:id/documents', upload.single('file'), uploadDocument);

module.exports = router;
