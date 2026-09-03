import React, { useState, useEffect } from 'react';
import { 
  createMeeting, 
  searchParticipants, 
  fetchOrganizations, 
  fetchBranches, 
  fetchGroups 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  GitBranch, 
  Sparkles, 
  AlertCircle,
  Briefcase,
  UserCheck,
  X,
  FileText
} from 'lucide-react';

const CreateMeetingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.role?.name === 'Super Admin';

  // Hierarchical Data State
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    organizationId: user?.organizationId?._id || user?.organizationId || '',
    branchId: '',
    groupId: '',
    title: '',
    meetingType: 'Annual General Meeting (AGM)',
    audienceTargetType: 'AllMembers',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Main Head Office Boardroom / Society Hall',
    description: '',
    priority: 'High'
  });

  const [agendas, setAgendas] = useState([
    { title: 'President Opening Address & Roll-Call of Members', description: 'Formal welcome and quorum establishment.' },
    { title: 'Review of Annual Financial Statements & Audit Report', description: 'Presentation by Treasurer of FY surplus, loans, and statutory reserves.' },
    { title: 'Declaration of Member Dividend & Thrift Interest Rate', description: 'Resolution on member profit sharing and savings bonus allocation.' },
    { title: 'Election / Ratification of Board Members & Executive Committee', description: 'Governance approvals and tenure confirmations.' }
  ]);

  // Custom Participants Search State
  const [participantSearch, setParticipantSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load Societies
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        if (isSuperAdmin) {
          const res = await fetchOrganizations();
          if (res.data?.success) {
            const orgList = res.data.data || [];
            setOrganizations(orgList);
            if (orgList.length > 0 && !formData.organizationId) {
              setFormData(prev => ({ ...prev, organizationId: orgList[0]._id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load organizations', err);
      }
    };
    loadOrgs();
  }, [isSuperAdmin]);

  // Load Branches when organizationId changes
  useEffect(() => {
    const loadBranchesData = async () => {
      if (!formData.organizationId) return;
      try {
        const res = await fetchBranches({ organizationId: formData.organizationId });
        if (res.data?.success) {
          const branchList = res.data.data || [];
          setBranches(branchList);
        }
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };
    loadBranchesData();
  }, [formData.organizationId]);

  // Load Groups when branchId changes
  useEffect(() => {
    const loadGroupsData = async () => {
      try {
        const params = {};
        if (formData.organizationId) params.organizationId = formData.organizationId;
        if (formData.branchId) params.branchId = formData.branchId;
        const res = await fetchGroups(params);
        if (res.data?.success) {
          setGroups(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load groups', err);
      }
    };
    loadGroupsData();
  }, [formData.organizationId, formData.branchId]);

  // Handle participant search
  useEffect(() => {
    if (!participantSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchParticipants({
          query: participantSearch,
          organizationId: formData.organizationId,
          branchId: formData.branchId
        });
        if (res.data?.success) {
          setSearchResults(res.data.data || []);
        }
      } catch (err) {
        console.error('Participant Search Error', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [participantSearch, formData.organizationId, formData.branchId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-configure audience and agenda presets based on meeting type
      if (name === 'meetingType') {
        if (value === 'Annual General Meeting (AGM)' || value === 'Special General Meeting (SGM)') {
          updated.audienceTargetType = 'AllMembers';
          updated.priority = 'High';
          setAgendas([
            { title: 'President Opening Address & Roll-Call of Members', description: 'Formal welcome and quorum establishment.' },
            { title: 'Review of Annual Financial Statements & Audit Report', description: 'Presentation by Treasurer of FY surplus, loans, and statutory reserves.' },
            { title: 'Declaration of Member Dividend & Thrift Interest Rate', description: 'Resolution on member profit sharing and savings bonus allocation.' },
            { title: 'Election / Ratification of Board Members & Executive Committee', description: 'Governance approvals and tenure confirmations.' }
          ]);
        } else if (value === 'Board Meeting' || value === 'Executive Committee') {
          updated.audienceTargetType = 'AllExecutives';
          updated.priority = 'High';
          setAgendas([
            { title: 'Board Confirmation of Previous Meeting Minutes', description: 'Review and sign resolutions.' },
            { title: 'Delinquency & Non-Performing Asset (NPA) Review', description: 'Strategy for overdue loan recoveries.' },
            { title: 'Credit & Loan Product Approvals', description: 'Review high-value loan applications.' }
          ]);
        } else if (value === 'Group Meeting') {
          updated.audienceTargetType = 'EntireGroup';
          updated.priority = 'Medium';
          setAgendas([
            { title: 'SHG Member Roll Call & Attendance', description: 'Weekly/Monthly group assembly.' },
            { title: 'Thrift Savings & Weekly Contribution Collection', description: 'Collection and passbook stamping.' },
            { title: 'Microloan Repayment & Group Ledger Updates', description: 'Recording member repayment installments.' }
          ]);
        } else if (value === 'Branch Meeting') {
          updated.audienceTargetType = 'EntireBranch';
          updated.priority = 'Medium';
          setAgendas([
            { title: 'Branch Monthly Target Review & Deposit Mobilization', description: 'Review branch KPIs.' },
            { title: 'Operations, Audit, & Field Officer Reports', description: 'Discussion of field activities.' }
          ]);
        }
      }
      return updated;
    });
  };

  const handleAddAgenda = () => {
    setAgendas(prev => [...prev, { title: '', description: '' }]);
  };

  const handleRemoveAgenda = (idx) => {
    setAgendas(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAgendaChange = (idx, field, value) => {
    setAgendas(prev => {
      const copy = [...prev];
      copy[idx][field] = value;
      return copy;
    });
  };

  const handleAddParticipant = (p) => {
    if (!selectedParticipants.some(sp => sp.participantId === p.participantId)) {
      setSelectedParticipants(prev => [...prev, p]);
    }
    setParticipantSearch('');
    setSearchResults([]);
  };

  const handleRemoveParticipant = (pId) => {
    setSelectedParticipants(prev => prev.filter(sp => sp.participantId !== pId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.venue) {
      setError('Please fill in all mandatory meeting fields (Title, Date, Time, Venue).');
      return;
    }

    if (formData.audienceTargetType === 'EntireGroup' && !formData.groupId) {
      setError('Please select an SHG / JLG Group for Group Meeting.');
      return;
    }

    if (formData.audienceTargetType === 'EntireBranch' && !formData.branchId) {
      setError('Please select a Branch for Branch Meeting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        agendas: agendas.filter(ag => ag.title && ag.title.trim()),
        participants: selectedParticipants
      };

      const res = await createMeeting(payload);
      if (res.data?.success || res.success) {
        setSuccessMsg(res.data?.message || res.message || 'Meeting scheduled successfully!');
        setTimeout(() => {
          navigate(`/meetings/${res.data?.data?._id || res.data?._id}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to schedule meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100/80 pb-6">
        <div>
          <Link
            to="/meetings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Meetings Registry
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <span className="p-2 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 shadow-xs">
              <Calendar className="w-7 h-7" />
            </span>
            Schedule Meeting & AGM
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Convene Annual General Meetings (AGMs), Board assemblies, SHG weekly groups, or branch reviews with automated attendee rosters.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-shake">
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

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Multi-Tenant Governance Scope */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              <span>1. Governance Entity & Jurisdictional Scope</span>
            </h2>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 font-mono">
              Hierarchy Scope
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Society Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" /> Society / Organization <span className="text-rose-500">*</span>
              </label>
              {isSuperAdmin ? (
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="">-- Select Society --</option>
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>{org.name} ({org.code || 'COOP'})</option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold">
                  {user?.organizationId?.name || 'My Cooperative Society'}
                </div>
              )}
            </div>

            {/* Branch Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-teal-600" /> Branch Jurisdiction
              </label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              >
                <option value="">All Branches / Head Office</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                ))}
              </select>
            </div>

            {/* Group Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" /> SHG / JLG Group
              </label>
              <select
                name="groupId"
                value={formData.groupId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              >
                <option value="">Not Applicable / General Assembly</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.groupName} ({g.groupCode})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Meeting Classification & Target Audience Engine */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>2. Meeting Classification & Target Invitees</span>
            </h2>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 font-mono">
              Auto-Roster Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meeting Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                Meeting Classification <span className="text-rose-500">*</span>
              </label>
              <select
                name="meetingType"
                value={formData.meetingType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-2xl bg-teal-50/50 border border-teal-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              >
                <option value="Annual General Meeting (AGM)">🏛️ Annual General Meeting (AGM) - All Members</option>
                <option value="Special General Meeting (SGM)">📜 Special General Meeting (SGM) - General Body</option>
                <option value="Group Meeting">👥 Group Meeting (SHG / JLG Thrift & Loan Collection)</option>
                <option value="Board Meeting">👔 Board of Directors Assembly</option>
                <option value="Executive Committee">⚡ Executive Committee & Officers Meeting</option>
                <option value="Branch Meeting">🏦 Branch Performance & Operations Review</option>
                <option value="Financial Review">📊 Financial & Audit Governance Review</option>
                <option value="Loan Review">💰 Loan Sanction & NPA Committee</option>
                <option value="General Meeting">🗣️ General Society Meeting</option>
                <option value="Emergency Meeting">🚨 Emergency Society Assembly</option>
              </select>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Selecting AGM or Group Meeting pre-fills suggested statutory agendas and target attendee pools.
              </p>
            </div>

            {/* Target Audience Engine */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                Target Invitees & Quorum Group <span className="text-rose-500">*</span>
              </label>
              <select
                name="audienceTargetType"
                value={formData.audienceTargetType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              >
                <option value="AllMembers">🏛️ All Society Members (General Body / AGM / SGM Roster)</option>
                <option value="AllExecutives">👔 Only Organization Executives & Board of Directors</option>
                <option value="EntireBranch">🏦 Entire Branch (All Staff & Branch Members)</option>
                <option value="EntireGroup">👥 Entire SHG / JLG Group Members</option>
                <option value="CustomSelection">👤 Custom / Individual Members & Staff</option>
              </select>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                The platform will automatically generate roll-call attendance sheets for the selected pool upon scheduling.
              </p>
            </div>
          </div>

          {/* Priority & Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Priority Level
              </label>
              <div className="flex gap-3">
                {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      formData.priority === p 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Title / Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., 42nd Annual General Body Meeting (AGM) - FY2026-27"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Date, Time & Venue */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>3. Schedule, Time & Meeting Venue</span>
            </h2>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 font-mono">
              Venue Logistics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Meeting Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                placeholder="e.g. 10:00 AM"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                placeholder="e.g. 01:00 PM"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Venue / Room / Virtual Meeting Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              placeholder="e.g., Main Head Office Boardroom, Community Hall, or Google Meet URL"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" /> Meeting Overview / Context Note
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Provide background, statutory requirements, or instructions for attending members..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
            />
          </div>
        </div>

        {/* Section 4: Meeting Agendas Builder */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>4. Structured Meeting Agendas ({agendas.length})</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Order of business for discussion, deliberation, and resolutions.</p>
            </div>
            <button
              type="button"
              onClick={handleAddAgenda}
              className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-teal-200/80 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Agenda Item
            </button>
          </div>

          <div className="space-y-4">
            {agendas.map((agenda, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Agenda Item Title (e.g. Declaration of Member Dividend)"
                    value={agenda.title}
                    onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)}
                    required
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-bold focus:border-teal-500 focus:outline-none"
                  />
                  {agendas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAgenda(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Agenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Additional context, motions, or discussion points..."
                  value={agenda.description}
                  onChange={(e) => handleAgendaChange(idx, 'description', e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:border-teal-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Custom Invitee Cherry-Picker (Optional / For Custom Selection) */}
        {(formData.audienceTargetType === 'CustomSelection' || selectedParticipants.length > 0) && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  <span>5. Cherry-Pick Custom Invitees ({selectedParticipants.length} Selected)</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Search and individually add specific members or officers.</p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search individual member or officer by name, ID, or phone..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />

              {/* Dropdown Results */}
              {searchResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2 space-y-1">
                  {searchResults.map(p => (
                    <div
                      key={p.participantId}
                      onClick={() => handleAddParticipant(p)}
                      className="p-3 hover:bg-teal-50 rounded-xl cursor-pointer flex items-center justify-between text-sm transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{p.subText}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {p.participantType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Chips */}
            {selectedParticipants.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedParticipants.map(sp => (
                  <div
                    key={sp.participantId}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold"
                  >
                    <span>{sp.name}</span>
                    <span className="text-[10px] text-teal-700 font-mono">({sp.participantType})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(sp.participantId)}
                      className="text-teal-500 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/meetings"
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all shadow-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Scheduling Meeting & Roster...' : 'Confirm & Schedule Meeting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMeetingPage;
