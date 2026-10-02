import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  fetchMeetingDetails, 
  cancelMeeting, 
  endMeetingApi,
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
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Search, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  Building2,
  Users,
  Printer,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Download,
  FileCheck,
  HelpCircle,
  X
} from 'lucide-react';

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('Overview'); // Overview, Attendance, Minutes, Documents, ActionItems

  // Agenda State
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDesc, setNewAgendaDesc] = useState('');
  const [addingAgenda, setAddingAgenda] = useState(false);

  // Participant Search State
  const [pSearch, setPSearch] = useState('');
  const [pResults, setPResults] = useState([]);
  const [invitingParticipant, setInvitingParticipant] = useState(false);

  // Attendance Form State
  const [attendanceMap, setAttendanceMap] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Minutes Form State
  const [minuteForm, setMinuteForm] = useState({
    summary: '',
    discussions: '',
    decisions: '',
    resolutions: ''
  });
  const [savingMinutes, setSavingMinutes] = useState(false);
  const [finalizingMinutes, setFinalizingMinutes] = useState(false);

  // Action Item State
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [newActionRemarks, setNewActionRemarks] = useState('');
  const [addingAction, setAddingAction] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Supporting Document');
  const [uploading, setUploading] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchMeetingDetails(id);
      if (res.data && res.data.success) {
        const payload = res.data.data;
        setData(payload);

        if (payload.minutes) {
          setMinuteForm({
            summary: payload.minutes.summary || '',
            discussions: payload.minutes.discussions || '',
            decisions: payload.minutes.decisions || '',
            resolutions: payload.minutes.resolutions || ''
          });
        }

        // Pre-fill attendance map
        const initialAttMap = {};
        if (payload.participants) {
          payload.participants.forEach(p => {
            initialAttMap[String(p.participantId)] = {
              participantType: p.participantType,
              attendanceStatus: p.attendanceStatus || 'Absent',
              remarks: p.remarks || ''
            };
          });
        }
        setAttendanceMap(initialAttMap);
      }
    } catch (err) {
      setError(err.message || 'Failed to load meeting details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  // Debounced search for adding participants
  useEffect(() => {
    if (!pSearch.trim() || !data?.meeting?.organizationId) {
      setPResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchParticipants({
          query: pSearch,
          organizationId: data.meeting.organizationId._id || data.meeting.organizationId
        });
        if (res.data?.success) {
          setPResults(res.data.data || []);
        }
      } catch (err) {
        console.error('Participant search error', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pSearch, data?.meeting?.organizationId]);

  // 1. Agenda Handlers
  const handleAddAgenda = async (e) => {
    e.preventDefault();
    if (!newAgendaTitle.trim()) return;
    setAddingAgenda(true);
    try {
      await addAgendaItem(id, { title: newAgendaTitle, description: newAgendaDesc });
      setNewAgendaTitle('');
      setNewAgendaDesc('');
      setSuccessMsg('Agenda item added successfully');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to add agenda item');
    } finally {
      setAddingAgenda(false);
    }
  };

  const handleDeleteAgenda = async (agendaId) => {
    if (!window.confirm('Delete this agenda item?')) return;
    try {
      await deleteAgendaItem(id, agendaId);
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to delete agenda item');
    }
  };

  // 2. Participant Handlers
  const handleInviteParticipant = async (p) => {
    try {
      await addParticipants(id, [{ participantType: p.participantType, participantId: p.participantId }]);
      setPSearch('');
      setPResults([]);
      setSuccessMsg(`Invited ${p.name}`);
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to invite participant');
    }
  };

  const handleRemoveParticipant = async (pId) => {
    if (!window.confirm('Remove participant from meeting roster?')) return;
    try {
      await removeParticipant(id, pId);
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to remove participant');
    }
  };

  // 3. Attendance Handlers
  const handleAttendanceChange = (pId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [pId]: {
        ...prev[pId],
        attendanceStatus: status
      }
    }));
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    setError('');
    setSuccessMsg('');
    try {
      const records = Object.entries(attendanceMap).map(([participantId, val]) => ({
        participantId,
        participantType: val.participantType || 'Member',
        attendanceStatus: val.attendanceStatus || 'Absent',
        remarks: val.remarks || ''
      }));

      await markAttendance(id, records);
      setSuccessMsg('Attendance roll-call saved successfully!');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  // 4. Minutes Handlers
  const handleSaveMinutes = async (e) => {
    e.preventDefault();
    setSavingMinutes(true);
    setError('');
    setSuccessMsg('');
    try {
      await saveMinutes(id, minuteForm);
      setSuccessMsg('Draft minutes saved successfully');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to save minutes');
    } finally {
      setSavingMinutes(false);
    }
  };

  const handleFinalizeMinutes = async () => {
    if (!window.confirm('Finalizing will permanently lock these minutes and mark the meeting as Officially Completed. Proceed?')) return;
    setFinalizingMinutes(true);
    setError('');
    setSuccessMsg('');
    try {
      await finalizeMinutes(id);
      setSuccessMsg('Minutes finalized, signed, and locked. Meeting marked Completed.');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to finalize minutes');
    } finally {
      setFinalizingMinutes(false);
    }
  };

  const handleAutoGenerateMinutes = () => {
    const meeting = data?.meeting;
    const agendas = data?.agendas;
    if (!meeting) return;
    
    const dateStr = new Date(meeting.scheduledDate || meeting.date || Date.now()).toLocaleDateString('en-IN');
    const autoSummary = `The ${meeting.meetingType || 'General'} meeting titled "${meeting.title}" was convened on ${dateStr} at ${meeting.location || 'Society Head Office'}. The Chairman welcomed the members and declared the quorum present to proceed with the statutory agenda items.`;
    
    const discussionPoints = (agendas && agendas.length > 0) 
      ? agendas.map((a, i) => `${i + 1}. ${a.title}: ${a.description || 'Discussed in detail by the committee.'}`).join('\\n')
      : "Detailed discussions were held regarding the society's operational and financial performance.";
    const autoDiscussions = `The following key matters were deliberated upon:\\n${discussionPoints}`;
    
    const decisionPoints = (agendas && agendas.length > 0)
      ? agendas.map((a, i) => `Approved and adopted the proposals regarding ${a.title}.`).join('\\n')
      : "The committee unanimously approved all presented proposals and reports.";
    const autoDecisions = `Decisions formalized during the assembly:\\n${decisionPoints}`;
    
    const autoResolutions = `Resolution 1: RESOLVED that the proceedings of the meeting are adopted as true and correct.\\nResolution 2: RESOLVED that the Secretary is authorized to execute the necessary filings and updates.`;

    setMinuteForm({
      summary: autoSummary,
      discussions: autoDiscussions,
      decisions: autoDecisions,
      resolutions: autoResolutions
    });
    setSuccessMsg('Meeting report Draft Auto-Generated successfully! Review and Save.');
  };

  // 5. Action Items Handler
  const handleAddAction = async (e) => {
    e.preventDefault();
    if (!newActionTask.trim()) return;
    setAddingAction(true);
    try {
      await addActionItem(id, {
        task: newActionTask,
        dueDate: newActionDueDate || undefined,
        remarks: newActionRemarks
      });
      setNewActionTask('');
      setNewActionDueDate('');
      setNewActionRemarks('');
      setSuccessMsg('Action item registered');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to register action item');
    } finally {
      setAddingAction(false);
    }
  };

  // 6. Document Upload Handler
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', docType);

      await uploadMeetingDocument(id, formData);
      setSelectedFile(null);
      setSuccessMsg('Document attached successfully');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // 7. Meeting Cancellation
  const handleCancelMeeting = async () => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      await cancelMeeting(id);
      setSuccessMsg('Meeting has been cancelled.');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to cancel meeting.');
    }
  };

  // 8. Mark Meeting as Ended
  const handleEndMeeting = async () => {
    if (!window.confirm('Mark this assembly as Officially Ended / Concluded?')) return;
    try {
      await endMeetingApi(id);
      setSuccessMsg('Assembly marked as Ended / Completed successfully.');
      loadDetails();
    } catch (err) {
      setError(err.message || 'Failed to mark meeting as ended.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 max-w-5xl mx-auto my-12">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">Loading meeting governance desk...</p>
      </div>
    );
  }

  if (!data?.meeting) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-4 max-w-5xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Meeting Not Found</h2>
        <Link to="/meetings" className="inline-flex px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Back to Meetings Registry
        </Link>
      </div>
    );
  }

  const { meeting, agendas = [], participants = [], minutes, actionItems = [], documents = [], quorumStats } = data;
  const isFinalized = minutes?.finalized;
  const isConcluded = meeting.status === 'Completed' || meeting.status === 'Ended';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/meetings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Meetings Registry
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Summary
            </button>
            {meeting.status !== 'Cancelled' && !isConcluded && (
              <button
                onClick={handleEndMeeting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Mark as Ended
              </button>
            )}
            {meeting.status !== 'Cancelled' && !isFinalized && !isConcluded && (
              <button
                onClick={handleCancelMeeting}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 transition-all"
              >
                Cancel Assembly
              </button>
            )}
          </div>
        </div>

        {/* Title, Badges & Society Context */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {meeting.meetingId}
            </span>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-900 text-white border border-teal-800">
              {meeting.meetingType}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              meeting.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              meeting.status === 'Ongoing' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
              meeting.status === 'Cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-teal-50 text-teal-800 border-teal-200'
            }`}>
              {meeting.status}
            </span>
            {isFinalized && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Minutes Signed & Locked
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {meeting.title}
          </h1>

          <p className="text-sm font-medium text-slate-600 flex items-center gap-2 flex-wrap pt-1">
            <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-bold text-slate-800">{meeting.organizationId?.name || 'Society'}</span>
            {meeting.branchId && (
              <>
                <span>•</span>
                <span>Branch: <strong className="text-slate-800">{meeting.branchId.branchName}</strong></span>
              </>
            )}
            {meeting.groupId && (
              <>
                <span>•</span>
                <span className="text-emerald-800 font-bold">Group: {meeting.groupId.groupName}</span>
              </>
            )}
          </p>
        </div>

        {/* Schedule & Venue Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
              <p className="text-xs font-bold text-slate-900">{new Date(meeting.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</p>
              <p className="text-xs font-bold text-slate-900">{meeting.startTime} - {meeting.endTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Venue</p>
              <p className="text-xs font-bold text-slate-900 truncate">{meeting.venue}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-teal-600" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'Overview', label: 'Agendas & Overview', icon: FileText, count: agendas.length },
          { id: 'Attendance', label: 'Attendees & Quorum', icon: UserCheck, count: participants.length },
          { id: 'Minutes', label: 'Minutes & Resolutions', icon: ShieldCheck, isBadge: isFinalized },
          { id: 'ActionItems', label: 'Action Items & Directives', icon: FileCheck, count: actionItems.length },
          { id: 'Documents', label: 'Documents & Records', icon: Upload, count: documents.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.isBadge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold font-mono">
                  Locked
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & AGENDAS */}
      {activeTab === 'Overview' && (
        <div className="space-y-8">
          {/* Description */}
          {meeting.description && (
            <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Context & Meeting Note</h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{meeting.description}</p>
            </div>
          )}

          {/* Agendas Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>Structured Order of Business / Agendas ({agendas.length})</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Formal motions and deliberation items scheduled for this assembly.</p>
              </div>
            </div>

            <div className="space-y-4">
              {agendas.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No agendas registered for this meeting.</p>
              ) : (
                agendas.map((ag, idx) => (
                  <div key={ag._id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center font-mono shrink-0 mt-0.5">
                        {ag.order || idx + 1}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">{ag.title}</h4>
                        {ag.description && (
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{ag.description}</p>
                        )}
                      </div>
                    </div>
                    {!isFinalized && (
                      <button
                        onClick={() => handleDeleteAgenda(ag._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Agenda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Agenda Form */}
            {!isFinalized && (
              <form onSubmit={handleAddAgenda} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Append New Agenda Item
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Agenda Item Title (e.g. Allocation of Statutory Reserves)"
                    value={newAgendaTitle}
                    onChange={(e) => setNewAgendaTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:border-teal-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Brief description or motion specifics (optional)..."
                    value={newAgendaDesc}
                    onChange={(e) => setNewAgendaDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={addingAgenda || !newAgendaTitle.trim()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {addingAgenda ? 'Adding...' : 'Add Agenda Item'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDEES & QUORUM ROLL-CALL */}
      {activeTab === 'Attendance' && (
        <div className="space-y-8">
          
          {/* Quorum Progress Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  <span>Quorum & Attendance Roll-Call Desk</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Statutory requirement for General Meetings & AGMs. A minimum 50% attendance establishes a legal quorum.
                </p>
              </div>

              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {savingAttendance ? 'Saving Roll-Call...' : 'Save Attendance Roll-Call'}
              </button>
            </div>

            {/* Quorum Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Invited Roster</span>
                <p className="text-2xl font-extrabold text-slate-900">{quorumStats?.totalInvited || participants.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Present</span>
                <p className="text-2xl font-extrabold text-emerald-900">{quorumStats?.presentCount || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-[10px] font-bold text-rose-700 uppercase">Absent</span>
                <p className="text-2xl font-extrabold text-rose-900">{quorumStats?.absentCount || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center">
                <span className="text-[10px] font-bold text-teal-700 uppercase">Quorum Rate</span>
                <p className="text-2xl font-extrabold text-teal-900">{quorumStats?.quorumPercentage || 0}%</p>
              </div>
            </div>
          </div>

          {/* Search and Add Participant Box */}
          <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Invite Additional Member or Staff Officer
            </h4>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search member by Name, Member ID, or Phone..."
                value={pSearch}
                onChange={(e) => setPSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
              />

              {pResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-2 space-y-1">
                  {pResults.map(p => (
                    <div
                      key={p.participantId}
                      onClick={() => handleInviteParticipant(p)}
                      className="p-3 hover:bg-teal-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{p.subText}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-700 text-[10px]">
                        + Add to Roster
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Roster Roll-Call Table */}
          <div className="bg-white rounded-3xl border border-teal-100/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Official Invitee Roll-Call ({participants.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Invitee Name</th>
                    <th className="py-3 px-4">Type & Contact</th>
                    <th className="py-3 px-4 text-center">Attendance Roll-Call</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No participants registered in this roster.
                      </td>
                    </tr>
                  ) : (
                    participants.map((p, idx) => {
                      const pId = String(p.participantId);
                      const currentStatus = attendanceMap[pId]?.attendanceStatus || 'Absent';
                      const details = p.participantDetails;
                      const name = details?.fullName || details?.name || `${details?.firstName || ''} ${details?.lastName || ''}`.trim() || 'Invitee';

                      return (
                        <tr key={pId || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {p.participantType === 'Member' ? `Member ID: ${details?.memberId || 'N/A'}` : `Role: ${details?.role || 'Staff'}`}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 mr-2">
                              {p.participantType}
                            </span>
                            <span className="text-slate-500 font-mono">{details?.phone || details?.email || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {['Present', 'Absent', 'Late', 'Excused'].map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleAttendanceChange(pId, st)}
                                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                    currentStatus === st
                                      ? st === 'Present' ? 'bg-emerald-600 text-white border-emerald-600'
                                        : st === 'Absent' ? 'bg-rose-600 text-white border-rose-600'
                                        : st === 'Late' ? 'bg-amber-600 text-white border-amber-600'
                                        : 'bg-purple-600 text-white border-purple-600'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRemoveParticipant(pId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove Participant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MINUTES & RESOLUTIONS */}
      {activeTab === 'Minutes' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Statutory Meeting Minutes & Adopted Resolutions</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official minutes book of discussions, voting results, and formal governance resolutions.
              </p>
            </div>

            {isFinalized ? (
              <span className="text-xs font-bold text-purple-900 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Finalized & Signed
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoGenerateMinutes}
                  disabled={savingMinutes || finalizingMinutes}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Generate Draft
                </button>
                <button
                  type="button"
                  onClick={handleSaveMinutes}
                  disabled={savingMinutes}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
                >
                  {savingMinutes ? 'Saving Draft...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeMinutes}
                  disabled={finalizingMinutes || !minuteForm.summary}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {finalizingMinutes ? 'Finalizing...' : 'Adopt & Lock Minutes'}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveMinutes} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Meeting Summary & Chairman Opening Address
              </label>
              <textarea
                rows={3}
                disabled={isFinalized}
                placeholder="Record opening remarks, presence of board members, and declaration of quorum..."
                value={minuteForm.summary}
                onChange={(e) => setMinuteForm(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Summary of Deliberations & Key Discussions
              </label>
              <textarea
                rows={4}
                disabled={isFinalized}
                placeholder="Detail key matters debated, financial figures presented, and questions raised by members..."
                value={minuteForm.discussions}
                onChange={(e) => setMinuteForm(prev => ({ ...prev, discussions: e.target.value }))}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Decisions Taken
              </label>
              <textarea
                rows={3}
                disabled={isFinalized}
                placeholder="List agreed conclusions, policy ratifications, and administrative actions..."
                value={minuteForm.decisions}
                onChange={(e) => setMinuteForm(prev => ({ ...prev, decisions: e.target.value }))}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-teal-800">
                4. Passed Resolutions (Formal Policy Declarations)
              </label>
              <textarea
                rows={4}
                disabled={isFinalized}
                placeholder="Resolution 1: RESOLVED that the audited financial statements for FY 2026 be approved...&#10;Resolution 2: RESOLVED that dividend at 8% on share capital be distributed..."
                value={minuteForm.resolutions}
                onChange={(e) => setMinuteForm(prev => ({ ...prev, resolutions: e.target.value }))}
                className="w-full p-4 rounded-2xl bg-teal-50/40 border border-teal-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none disabled:bg-slate-100 font-mono"
              />
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ACTION ITEMS */}
      {activeTab === 'ActionItems' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <span>Action Items & Directives ({actionItems.length})</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Tasks and execution follow-ups assigned during assembly.</p>
            </div>
          </div>

          <div className="space-y-3">
            {actionItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No action items registered.</p>
            ) : (
              actionItems.map((item, idx) => (
                <div key={item._id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">{item.task}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                      {item.dueDate && <span>Due: {new Date(item.dueDate).toLocaleDateString('en-IN')}</span>}
                      {item.remarks && <span>• {item.remarks}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {item.status || 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Add Action Item Form */}
          <form onSubmit={handleAddAction} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Assign New Action Item
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Task Directive (e.g. File AGM returns with Registrar)"
                value={newActionTask}
                onChange={(e) => setNewActionTask(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
              />
              <input
                type="date"
                value={newActionDueDate}
                onChange={(e) => setNewActionDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addingAction || !newActionTask.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {addingAction ? 'Saving...' : 'Register Action Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: DOCUMENTS */}
      {activeTab === 'Documents' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                <span>Meeting Documents & Records ({documents.length})</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Notices, signed attendance books, balance sheet presentations, and PDFs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center col-span-2">No documents attached to this meeting yet.</p>
            ) : (
              documents.map((doc, idx) => (
                <div key={doc._id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</p>
                    <p className="text-[10px] text-teal-700 font-bold uppercase">{doc.documentType}</p>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200 transition-all shrink-0"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>

          {/* Upload Document Box */}
          <form onSubmit={handleUploadDoc} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Attach Meeting Document
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
              >
                <option value="Meeting Notice">Meeting Notice</option>
                <option value="Agenda Booklet">Agenda Booklet</option>
                <option value="Financial Report / Balance Sheet">Financial Report / Balance Sheet</option>
                <option value="Signed Attendance Sheet">Signed Attendance Sheet</option>
                <option value="Adopted Resolutions PDF">Adopted Resolutions PDF</option>
                <option value="Supporting Document">Supporting Document</option>
              </select>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Attach Document'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default MeetingDetailsPage;
