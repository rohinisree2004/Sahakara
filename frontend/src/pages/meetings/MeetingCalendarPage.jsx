import React, { useState, useEffect, useCallback } from 'react';
import { fetchCalendarMeetings } from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Filter,
  Plus,
  ShieldCheck,
  Building2,
  Users,
  Eye
} from 'lucide-react';

const MeetingCalendarPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Hierarchical Filter
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');
  const [selectedGroupId, setSelectedGroupId] = useState('All');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;
      if (selectedGroupId !== 'All') params.groupId = selectedGroupId;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (typeFilter !== 'All') params.meetingType = typeFilter;

      const res = await fetchCalendarMeetings(params);
      if (res.data && res.data.success) {
        setMeetings(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load calendar meetings');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedBranchId, selectedGroupId, statusFilter, typeFilter]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getMeetingsForDay = (dayNum) => {
    return meetings.filter(m => {
      const d = new Date(m.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar Timeline
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Meeting Governance Calendar
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Visual monthly schedule of Annual General Meetings (AGMs), Board sessions, and group thrift assemblies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/meetings/create"
              className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Schedule Meeting
            </Link>
          </div>
        </div>

        {/* Hierarchical Filter */}
        <HierarchicalFilterBar
          onFilterChange={({ organizationId, branchId, groupId }) => {
            setSelectedOrgId(organizationId);
            setSelectedBranchId(branchId);
            setSelectedGroupId(groupId);
          }}
          showGroupFilter={true}
          showMemberFilter={false}
        />
      </div>

      {/* Calendar Controls & Month Header */}
      <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-white rounded-lg transition-all"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            >
              <option value="All">All Classifications</option>
              <option value="Annual General Meeting (AGM)">AGMs & SGMs</option>
              <option value="Group Meeting">Group Meetings</option>
              <option value="Board Meeting">Board Meetings</option>
              <option value="Branch Meeting">Branch Reviews</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] rounded-2xl bg-slate-50/40 border border-transparent p-2" />
          ))}

          {/* Actual day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayMeetings = getMeetingsForDay(dayNum);
            const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] rounded-2xl border p-2.5 space-y-1.5 transition-all flex flex-col justify-between ${
                  isToday 
                    ? 'bg-teal-50/40 border-teal-300 ring-2 ring-teal-500/20' 
                    : 'bg-white border-slate-200/70 hover:border-teal-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                    isToday ? 'bg-teal-600 text-white' : 'text-slate-700'
                  }`}>
                    {dayNum}
                  </span>
                  {dayMeetings.length > 0 && (
                    <span className="text-[10px] font-bold text-teal-800 font-mono">
                      {dayMeetings.length}
                    </span>
                  )}
                </div>

                {/* Day meetings pills */}
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayMeetings.map(m => (
                    <Link
                      key={m._id}
                      to={`/meetings/${m._id}`}
                      className="block p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-950 text-[10px] font-bold truncate transition-colors"
                      title={`${m.meetingType}: ${m.title} at ${m.startTime}`}
                    >
                      <span className="text-teal-700 mr-1">•</span>
                      {m.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default MeetingCalendarPage;
