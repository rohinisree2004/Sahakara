import React, { useState, useEffect, useCallback } from 'react';
import { fetchMeetingsList, endMeetingApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  UserCheck
} from 'lucide-react';

const MeetingListPage = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hierarchical Filter State
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');
  const [selectedGroupId, setSelectedGroupId] = useState('All');

  // Search & Type Filters
  const [search, setSearch] = useState('');
  const [meetingType, setMeetingType] = useState('All');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 12,
        search: search.trim() || undefined,
        meetingType: meetingType !== 'All' ? meetingType : undefined,
        status: status !== 'All' ? status : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;
      if (selectedGroupId !== 'All') params.groupId = selectedGroupId;

      const res = await fetchMeetingsList(params);
      if (res.data && res.data.success) {
        setMeetings(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load meetings registry');
    } finally {
      setLoading(false);
    }
  }, [page, search, meetingType, status, startDate, endDate, selectedOrgId, selectedBranchId, selectedGroupId]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadMeetings();
  };

  const handleEndMeeting = async (meetingId, title) => {
    if (!window.confirm(`Mark meeting "${title}" as Officially Ended / Completed?`)) return;
    try {
      await endMeetingApi(meetingId);
      loadMeetings();
    } catch (err) {
      alert(err.message || 'Failed to end meeting');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Ongoing':
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Postponed':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  const getTypeBadge = (type) => {
    if (type?.includes('AGM') || type?.includes('SGM')) {
      return 'bg-teal-900 text-white border-teal-800';
    }
    if (type?.includes('Board') || type?.includes('Executive')) {
      return 'bg-teal-700 text-white border-teal-600';
    }
    if (type?.includes('Group')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Governance & AGM Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Meetings & General Assemblies Registry
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Official records of Annual General Meetings (AGMs), Board assemblies, SHG thrift collections, and branch reviews.
            </p>
          </div>

          <Link
            to="/meetings/create"
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </Link>
        </div>

        {/* Hierarchical Governance Filter Bar */}
        <HierarchicalFilterBar
          onFilterChange={({ organizationId, branchId, groupId }) => {
            setSelectedOrgId(organizationId);
            setSelectedBranchId(branchId);
            setSelectedGroupId(groupId);
            setPage(1);
          }}
          showGroupFilter={true}
          showMemberFilter={false}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by Title, Meeting ID, or Venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={meetingType}
              onChange={(e) => { setMeetingType(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Meeting Types</option>
              <option value="Annual General Meeting (AGM)">Annual General Meeting (AGM)</option>
              <option value="Special General Meeting (SGM)">Special General Meeting (SGM)</option>
              <option value="Group Meeting">SHG / JLG Group Meeting</option>
              <option value="Board Meeting">Board of Directors Meeting</option>
              <option value="Executive Committee">Executive Committee Meeting</option>
              <option value="Branch Meeting">Branch Performance Review</option>
              <option value="Financial Review">Financial & Audit Review</option>
              <option value="Loan Review">Loan Sanction Committee</option>
              <option value="General Meeting">General Meeting</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Meetings Grid List */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading meetings registry...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Meetings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No governance meetings match the specified filters. Try changing your filters or schedule a new meeting.
          </p>
          <Link
            to="/meetings/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 transition-all mt-2"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule New Meeting
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white rounded-3xl border border-teal-100/80 hover:border-teal-300 hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between shadow-xs relative group"
            >
              <div className="space-y-3">
                {/* Header Tags */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {meeting.meetingId}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>

                {/* Meeting Title & Type */}
                <div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mb-1.5 ${getTypeBadge(meeting.meetingType)}`}>
                    {meeting.meetingType}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors line-clamp-2">
                    {meeting.title}
                  </h3>
                </div>

                {/* Organization & Branch Context */}
                <div className="text-xs text-slate-500 font-medium space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{meeting.organizationId?.name || 'All Organizations'}</span>
                  </div>
                  {meeting.branchId && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Branch:</span>
                      <span className="font-semibold text-slate-700">{meeting.branchId.branchName}</span>
                    </div>
                  )}
                  {meeting.groupId && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-emerald-800">{meeting.groupId.groupName}</span>
                    </div>
                  )}
                </div>

                {/* Logistics Info */}
                <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{new Date(meeting.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{meeting.startTime} - {meeting.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{meeting.venue}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{meeting.organizerId?.name || 'Organizer'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(meeting.status === 'Scheduled' || meeting.status === 'Ongoing') && (
                    <button
                      onClick={() => handleEndMeeting(meeting._id, meeting.title)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-all"
                      title="Mark as Ended"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>End</span>
                    </button>
                  )}
                  <Link
                    to={`/meetings/${meeting._id}`}
                    className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-teal-200/80 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Desk
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-teal-100/80 text-xs font-bold text-slate-600 shadow-xs">
          <span>Showing Page {page} of {totalPages} ({totalCount} total meetings)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingListPage;
