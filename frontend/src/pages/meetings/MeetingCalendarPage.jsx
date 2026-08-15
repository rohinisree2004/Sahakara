import React, { useState, useEffect } from 'react';
import { fetchCalendarMeetings } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Filter,
  Plus
} from 'lucide-react';

const MeetingCalendarPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [viewMode, setViewMode] = useState('Month'); // Month, Week, Day
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.meetingType = typeFilter;

      const res = await fetchCalendarMeetings(params);
      setMeetings(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load calendar meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [statusFilter, typeFilter]);

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
    if (viewMode === 'Month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'Week') {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
    }
  };

  const handleNext = () => {
    if (viewMode === 'Month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'Week') {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
    }
  };

  const getMeetingsForDay = (dayNum) => {
    return meetings.filter(m => {
      const d = new Date(m.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-emerald-400" />
            Meeting Governance Calendar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Interactive agenda and schedule timeline</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/meetings/create"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </Link>
        </div>
      </div>

      {/* Filter & View Mode Controls */}
      <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrev} 
            className="p-2 bg-slate-700/70 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold text-white min-w-[160px] text-center">
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={handleNext} 
            className="p-2 bg-slate-700/70 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg ml-2"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* View Toggles */}
          <div className="bg-slate-900/60 p-1 rounded-xl border border-slate-700 flex text-xs font-semibold">
            {['Month', 'Week', 'Day'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === mode ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Meeting Types</option>
            <option value="General Meeting">General Meeting</option>
            <option value="Board Meeting">Board Meeting</option>
            <option value="Committee Meeting">Committee Meeting</option>
            <option value="Branch Meeting">Branch Meeting</option>
            <option value="Group Meeting">Group Meeting</option>
            <option value="Financial Review">Financial Review</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid View */}
      {viewMode === 'Month' && (
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-4 overflow-hidden">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for start padding */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[100px] bg-slate-900/30 rounded-xl p-2 opacity-30"></div>
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayMeetings = getMeetingsForDay(dayNum);
              const isToday = 
                new Date().getDate() === dayNum && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;

              return (
                <div 
                  key={dayNum} 
                  className={`min-h-[110px] bg-slate-900/60 border rounded-xl p-2 transition-all flex flex-col justify-between ${
                    isToday ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                      isToday ? 'bg-emerald-500 text-white' : 'text-slate-300'
                    }`}>
                      {dayNum}
                    </span>
                    {dayMeetings.length > 0 && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {dayMeetings.length} mtg
                      </span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {dayMeetings.map((mtg) => (
                      <div
                        key={mtg._id}
                        onClick={() => navigate(`/meetings/details/${mtg._id}`)}
                        className={`text-[11px] p-1.5 rounded cursor-pointer truncate font-medium transition-all ${
                          mtg.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' :
                          mtg.status === 'Scheduled' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                        title={`${mtg.title} (${mtg.startTime})`}
                      >
                        <div className="font-semibold truncate">{mtg.title}</div>
                        <div className="text-[9px] opacity-80">{mtg.startTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day List View Fallback */}
      {(viewMode === 'Week' || viewMode === 'Day') && (
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">
            Scheduled Sessions ({viewMode} Focus View)
          </h2>
          {meetings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No meetings found for the selected view criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((mtg) => (
                <div key={mtg._id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl hover:border-emerald-500/50 transition-all space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                      {mtg.meetingId}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      mtg.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      mtg.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {mtg.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{mtg.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{mtg.description || 'No description provided.'}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {new Date(mtg.date).toLocaleDateString()} ({mtg.startTime} - {mtg.endTime})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {mtg.venue}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      to={`/meetings/details/${mtg._id}`}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      View Agenda & Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingCalendarPage;
