import React, { useState, useEffect } from 'react';
import { fetchMeetingsList } from '../../services/api';
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
  FileEdit
} from 'lucide-react';

const MeetingListPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search,
        meetingType,
        status,
        startDate,
        endDate
      };
      const res = await fetchMeetingsList(params);
      setMeetings(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load meetings list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [page, meetingType, status, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadMeetings();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-400" />
            Society Meetings Registry
          </h1>
          <p className="text-slate-400 text-sm mt-1">Directory of all past, present, and scheduled governance meetings</p>
        </div>

        <Link
          to="/meetings/create"
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-center">
          {/* Search Box */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Title, ID, or Venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={meetingType}
            onChange={(e) => { setMeetingType(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Meeting Types</option>
            <option value="General Meeting">General Meeting</option>
            <option value="Board Meeting">Board Meeting</option>
            <option value="Committee Meeting">Committee Meeting</option>
            <option value="Branch Meeting">Branch Meeting</option>
            <option value="Group Meeting">Group Meeting</option>
            <option value="Financial Review">Financial Review</option>
            <option value="Emergency Meeting">Emergency Meeting</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Postponed">Postponed</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm rounded-xl transition-all"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Meeting ID & Date</th>
                <th className="p-4">Title & Type</th>
                <th className="p-4">Branch / Group</th>
                <th className="p-4">Venue & Time</th>
                <th className="p-4">Organizer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                  </td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-medium">
                    No meetings found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                meetings.map((mtg) => (
                  <tr key={mtg._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-emerald-400 font-bold text-xs">{mtg.meetingId}</div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(mtg.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{mtg.title}</div>
                      <span className="inline-block text-[11px] px-2 py-0.5 mt-1 rounded bg-slate-700 text-slate-300">
                        {mtg.meetingType}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      <div>{mtg.branchId ? mtg.branchId.name : 'All Branches (Org-level)'}</div>
                      {mtg.groupId && <div className="text-emerald-400 font-semibold">Group: {mtg.groupId.name}</div>}
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {mtg.venue}
                      </div>
                      <div className="text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {mtg.startTime} - {mtg.endTime}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      {mtg.organizerId ? `${mtg.organizerId.firstName} ${mtg.organizerId.lastName}` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        mtg.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        mtg.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        mtg.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {mtg.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/meetings/details/${mtg._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      {mtg.status !== 'Completed' && mtg.status !== 'Cancelled' && (
                        <Link
                          to={`/meetings/edit/${mtg._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-all"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page <span className="font-bold text-white">{page}</span> of <span className="font-bold text-white">{totalPages}</span> ({totalCount} total meetings)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg transition-colors text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => prev + 1)}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg transition-colors text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingListPage;
