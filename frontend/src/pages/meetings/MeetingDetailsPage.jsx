import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  fetchMeetingDetails, 
  cancelMeeting, 
  addAgendaItem, 
  deleteAgendaItem, 
  addParticipants, 
  removeParticipant, 
  searchParticipants, 
  markAttendance, 
  saveMinutes, 
  finalizeMinutes, 
  addActionItem, 
  updateActionItem, 
  uploadMeetingDocument 
} from '../../services/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  Search, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  FileDown
} from 'lucide-react';

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview'); // Overview, Attendance, Minutes, Documents

  // Agenda State
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDesc, setNewAgendaDesc] = useState('');

  // Participant Search State
  const [pSearch, setPSearch] = useState('');
  const [pResults, setPResults] = useState([]);

  // Attendance Form State
  const [attendanceMap, setAttendanceMap] = useState({});

  // Minutes Form State
  const [minuteForm, setMinuteForm] = useState({
    summary: '',
    discussions: '',
    decisions: '',
    resolutions: ''
  });

  // Action Item State
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Supporting Document');
  const [uploading, setUploading] = useState(false);

  const loadDetails = async () => {
    try {
      const res = await fetchMeetingDetails(id);
      setData(res.data);

      if (res.data.minutes) {
        setMinuteForm({
          summary: res.data.minutes.summary || '',
          discussions: res.data.minutes.discussions || '',
          decisions: res.data.minutes.decisions || '',
          resolutions: res.data.minutes.resolutions || ''
        });
      }

      // Initialize Attendance Map
      const initialMap = {};
      (res.data.participants || []).forEach(p => {
        const record = (res.data.attendance || []).find(a => a.participantId?.toString() === p.participantId?.toString());
        initialMap[p.participantId] = record ? record.attendanceStatus : 'Absent';
      });
      setAttendanceMap(initialMap);

    } catch (err) {
      setError(err.message || 'Failed to load meeting details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  // Handle participant search
  useEffect(() => {
    if (!pSearch.trim()) {
      setPResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchParticipants(pSearch);
        setPResults(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-rose-500/10 border border-rose-500 text-rose-400 p-4 rounded-xl">
          {error || 'Meeting not found.'}
        </div>
      </div>
    );
  }

  const { meeting, agendas = [], participants = [], attendance = [], minutes, actionItems = [], documents = [] } = data;
  const isFinalized = minutes?.finalized || false;

  // Handler Actions
  const handleCancelMeeting = async () => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) {
      try {
        await cancelMeeting(id);
        loadDetails();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAddAgenda = async (e) => {
    e.preventDefault();
    if (!newAgendaTitle.trim()) return;
    try {
      await addAgendaItem(id, { title: newAgendaTitle, description: newAgendaDesc });
      setNewAgendaTitle('');
      setNewAgendaDesc('');
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAgenda = async (agendaId) => {
    try {
      await deleteAgendaItem(id, agendaId);
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddParticipant = async (p) => {
    try {
      await addParticipants(id, [{ participantType: p.participantType, participantId: p.participantId }]);
      setPSearch('');
      setPResults([]);
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      await removeParticipant(id, participantId);
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const records = participants.map(p => ({
        participantType: p.participantType,
        participantId: p.participantId,
        attendanceStatus: attendanceMap[p.participantId] || 'Absent'
      }));
      await markAttendance(id, records);
      alert('Attendance updated successfully');
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveMinutes = async (e) => {
    e.preventDefault();
    try {
      await saveMinutes(id, minuteForm);
      alert('Draft minutes saved successfully');
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFinalizeMinutes = async () => {
    if (window.confirm('Finalizing will lock these meeting minutes and mark the meeting as Completed. Continue?')) {
      try {
        await finalizeMinutes(id);
        alert('Meeting minutes finalized and locked.');
        loadDetails();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAddActionItem = async (e) => {
    e.preventDefault();
    if (!newActionTask.trim()) return;
    try {
      await addActionItem(id, { task: newActionTask, dueDate: newActionDueDate });
      setNewActionTask('');
      setNewActionDueDate('');
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateActionStatus = async (itemId, newStatus) => {
    try {
      await updateActionItem(id, itemId, { status: newStatus });
      loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('documentType', docType);

      await uploadMeetingDocument(id, fd);
      setSelectedFile(null);
      loadDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Navigation */}
      <div>
        <Link to="/meetings/dashboard" className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Governance Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{meeting.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                meeting.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                meeting.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {meeting.status}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-mono mt-1">
              ID: {meeting.meetingId} | Type: {meeting.meetingType} | Date: {new Date(meeting.date).toLocaleDateString()} ({meeting.startTime} - {meeting.endTime})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isFinalized && meeting.status !== 'Cancelled' && (
              <button
                onClick={handleCancelMeeting}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="border-b border-slate-700/80 flex gap-2">
        {['Overview', 'Attendance', 'Minutes & Action Items', 'Documents'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & AGENDAS */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3">Session Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Venue / Location</span>
                  <span className="text-slate-100 font-semibold flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-rose-400" /> {meeting.venue}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Organizer</span>
                  <span className="text-slate-100 font-semibold mt-0.5">
                    {meeting.organizerId ? `${meeting.organizerId.firstName} ${meeting.organizerId.lastName}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Branch Context</span>
                  <span className="text-slate-100 font-semibold mt-0.5">
                    {meeting.branchId ? meeting.branchId.name : 'All Branches'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Group Context</span>
                  <span className="text-slate-100 font-semibold mt-0.5">
                    {meeting.groupId ? meeting.groupId.name : 'N/A'}
                  </span>
                </div>
              </div>

              {meeting.description && (
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-slate-400 text-xs block mb-1">Description</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{meeting.description}</p>
                </div>
              )}
            </div>

            {/* Agenda Topics */}
            <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex justify-between items-center">
                <span>Agenda Topics ({agendas.length})</span>
              </h2>

              <div className="space-y-3">
                {agendas.length === 0 ? (
                  <div className="text-sm text-slate-500 py-4 text-center">No agenda topics defined yet.</div>
                ) : (
                  agendas.map((ag, idx) => (
                    <div key={ag._id} className="p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{ag.title}</h4>
                          {ag.description && <p className="text-xs text-slate-400 mt-1">{ag.description}</p>}
                        </div>
                      </div>
                      {!isFinalized && (
                        <button
                          onClick={() => handleDeleteAgenda(ag._id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}

                {/* Add Agenda Form */}
                {!isFinalized && (
                  <form onSubmit={handleAddAgenda} className="pt-3 border-t border-slate-700/60 space-y-2">
                    <div className="text-xs font-bold text-slate-300">Add Agenda Item:</div>
                    <input
                      type="text"
                      placeholder="Topic Title..."
                      value={newAgendaTitle}
                      onChange={(e) => setNewAgendaTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Description (optional)..."
                        value={newAgendaDesc}
                        onChange={(e) => setNewAgendaDesc(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shrink-0"
                      >
                        + Add Topic
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm border-b border-slate-700 pb-2">Session Quick Overview</h3>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Total Invited:</span>
                <span className="font-bold text-white">{participants.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Agendas Listed:</span>
                <span className="font-bold text-white">{agendas.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Action Items:</span>
                <span className="font-bold text-white">{actionItems.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Minutes Finalized:</span>
                <span className={`font-bold ${isFinalized ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isFinalized ? 'Yes (Locked)' : 'Draft Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE */}
      {activeTab === 'Attendance' && (
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Participant Attendance Desk
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Mark present, absent, excused, or late statuses</p>
            </div>

            {!isFinalized && (
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Save Attendance Records
              </button>
            )}
          </div>

          {/* Add Participant Drawer */}
          {!isFinalized && (
            <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-slate-300">Invite Additional Participant</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user or member to invite..."
                  value={pSearch}
                  onChange={(e) => setPSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {pResults.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-700">
                  {pResults.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => handleAddParticipant(r)}
                      className="p-2 hover:bg-slate-700/60 cursor-pointer flex justify-between items-center text-xs text-white"
                    >
                      <span>{r.name} ({r.subText})</span>
                      <span className="text-emerald-400 font-bold">+ Invite</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900/60 text-xs font-bold text-slate-400 border-b border-slate-700 uppercase">
                  <th className="p-3">Participant Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Attendance Status</th>
                  {!isFinalized && <th className="p-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-500 text-xs">No participants invited.</td>
                  </tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.participantId} className="hover:bg-slate-700/20">
                      <td className="p-3 font-semibold text-white">
                        {p.participantDetails ? `${p.participantDetails.firstName} ${p.participantDetails.lastName}` : p.participantId}
                      </td>
                      <td className="p-3 text-xs text-slate-400 font-mono">{p.participantType}</td>
                      <td className="p-3">
                        <select
                          disabled={isFinalized}
                          value={attendanceMap[p.participantId] || 'Absent'}
                          onChange={(e) => setAttendanceMap(prev => ({ ...prev, [p.participantId]: e.target.value }))}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Excused">Excused</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>
                      {!isFinalized && (
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveParticipant(p.participantId)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MINUTES & ACTION ITEMS */}
      {activeTab === 'Minutes & Action Items' && (
        <div className="space-y-6">
          {/* Minutes Form */}
          <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Official Meeting Minutes & Resolutions
              </h2>

              {isFinalized ? (
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Minutes Finalized & Locked
                </span>
              ) : (
                <button
                  onClick={handleFinalizeMinutes}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Finalize & Lock Minutes
                </button>
              )}
            </div>

            <form onSubmit={handleSaveMinutes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Meeting Executive Summary *</label>
                <textarea
                  disabled={isFinalized}
                  required
                  rows="3"
                  value={minuteForm.summary}
                  onChange={(e) => setMinuteForm(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 resize-none"
                  placeholder="Overview of key discussion points..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Main Discussions</label>
                  <textarea
                    disabled={isFinalized}
                    rows="4"
                    value={minuteForm.discussions}
                    onChange={(e) => setMinuteForm(prev => ({ ...prev, discussions: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Decisions Taken</label>
                  <textarea
                    disabled={isFinalized}
                    rows="4"
                    value={minuteForm.decisions}
                    onChange={(e) => setMinuteForm(prev => ({ ...prev, decisions: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Resolutions Passed</label>
                  <textarea
                    disabled={isFinalized}
                    rows="4"
                    value={minuteForm.resolutions}
                    onChange={(e) => setMinuteForm(prev => ({ ...prev, resolutions: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 resize-none"
                  ></textarea>
                </div>
              </div>

              {!isFinalized && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl"
                  >
                    Save Draft Minutes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Action Items List */}
          <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3">
              Action Items & Assigned Tasks ({actionItems.length})
            </h2>

            <div className="space-y-3">
              {actionItems.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No action items logged.</div>
              ) : (
                actionItems.map((item) => (
                  <div key={item._id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.task}</h4>
                      {item.dueDate && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateActionStatus(item._id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                ))
              )}

              {/* Add Action Item Form */}
              <form onSubmit={handleAddActionItem} className="pt-3 border-t border-slate-700/60 flex gap-2">
                <input
                  type="text"
                  placeholder="Task description..."
                  value={newActionTask}
                  onChange={(e) => setNewActionTask(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="date"
                  value={newActionDueDate}
                  onChange={(e) => setNewActionDueDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shrink-0"
                >
                  + Add Action Task
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === 'Documents' && (
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            Supporting Meeting Documents
          </h2>

          {/* Upload Form */}
          <form onSubmit={handleFileUpload} className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-300 mb-1">Document Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Notice">Notice</option>
                <option value="Agenda">Agenda</option>
                <option value="Minutes">Minutes</option>
                <option value="Resolution">Resolution</option>
                <option value="Attendance Sheet">Attendance Sheet</option>
                <option value="Supporting Document">Supporting Document</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-300 mb-1">Select File (PDF or Image)</label>
              <input
                type="file"
                required
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl"
            >
              {uploading ? 'Uploading...' : 'Upload Attachment'}
            </button>
          </form>

          {/* Documents Table */}
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">No documents uploaded for this meeting.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-white">{doc.fileName}</div>
                    <div className="text-slate-400 mt-0.5">Category: {doc.documentType} | Uploaded by: {doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : 'User'}</div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg font-bold flex items-center gap-1"
                  >
                    <FileDown className="w-4 h-4" /> Download / View
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingDetailsPage;
