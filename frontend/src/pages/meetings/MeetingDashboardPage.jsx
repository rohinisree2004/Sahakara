import React, { useState, useEffect } from 'react';
import { fetchMeetingDashboard } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Plus, 
  FileText, 
  BarChart3,
  CalendarDays,
  ArrowRight,
  MapPin
} from 'lucide-react';

const MeetingDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchMeetingDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load meeting dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-500/10 border border-rose-500 text-rose-400 p-4 rounded-xl">
          Unable to load meetings: {error}
        </div>
      </div>
    );
  }

  const { stats, recentMeetings = [], upcomingMeetingsList = [] } = data || {};

  const statCards = [
    {
      title: 'Total Meetings',
      value: stats?.totalMeetings || 0,
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Upcoming Meetings',
      value: stats?.upcomingMeetings || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Completed Meetings',
      value: stats?.completedMeetings || 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Cancelled Meetings',
      value: stats?.cancelledMeetings || 0,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    },
    {
      title: "Today's Meetings",
      value: stats?.todaysMeetings || 0,
      icon: CalendarDays,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Attendance Rate',
      value: `${stats?.attendancePercentage || 0}%`,
      icon: UserCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-400" />
            Meeting & Governance Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage society board, general, branch, and committee meetings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/meetings/calendar"
            className="px-4 py-2.5 bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            Calendar View
          </Link>
          <Link
            to="/meetings/create"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.bg} shrink-0`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">{card.title}</div>
                <div className="text-xl font-bold text-slate-100 mt-0.5">{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link 
          to="/meetings/list"
          className="p-4 bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 text-slate-200 font-semibold text-sm transition-all group"
        >
          <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>All Meetings Directory</span>
        </Link>
        <Link 
          to="/meetings/calendar"
          className="p-4 bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 text-slate-200 font-semibold text-sm transition-all group"
        >
          <CalendarDays className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span>Meeting Calendar</span>
        </Link>
        <Link 
          to="/meetings/reports"
          className="p-4 bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 text-slate-200 font-semibold text-sm transition-all group"
        >
          <BarChart3 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Governance Analytics</span>
        </Link>
        <Link 
          to="/meetings/create"
          className="p-4 bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 text-slate-200 font-semibold text-sm transition-all group"
        >
          <Plus className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Schedule New Session</span>
        </Link>
      </div>

      {/* Feeds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings List */}
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Upcoming Meetings
            </h2>
            <Link to="/meetings/list?status=Scheduled" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMeetingsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No upcoming meetings scheduled.
              </div>
            ) : (
              upcomingMeetingsList.map((mtg) => (
                <div key={mtg._id} className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl hover:border-slate-600 transition-all flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                        {mtg.meetingId}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {mtg.meetingType}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{mtg.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        {new Date(mtg.date).toLocaleDateString()} ({mtg.startTime} - {mtg.endTime})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {mtg.venue}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/meetings/details/${mtg._id}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shrink-0"
                  >
                    Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity / History */}
        <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
              Recent Meetings Activity
            </h2>
            <Link to="/meetings/list" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentMeetings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No recent meeting records found.
              </div>
            ) : (
              recentMeetings.map((mtg) => (
                <div key={mtg._id} className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl hover:border-slate-600 transition-all flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
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
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{mtg.title}</h3>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(mtg.date).toLocaleDateString()} | Organizer: {mtg.organizerId ? `${mtg.organizerId.firstName} ${mtg.organizerId.lastName}` : 'System'}
                    </div>
                  </div>
                  <Link 
                    to={`/meetings/details/${mtg._id}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDashboardPage;
