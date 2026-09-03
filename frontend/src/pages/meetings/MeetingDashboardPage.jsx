import React, { useState, useEffect, useCallback } from 'react';
import { fetchMeetingDashboard } from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  PieChart,
  UserCheck,
  Sparkles
} from 'lucide-react';

const MeetingDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hierarchical Scope
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');
  const [selectedGroupId, setSelectedGroupId] = useState('All');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;
      if (selectedGroupId !== 'All') params.groupId = selectedGroupId;

      const res = await fetchMeetingDashboard(params);
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load meeting governance stats.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedBranchId, selectedGroupId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const stats = data?.stats || {
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    cancelledMeetings: 0,
    todaysMeetings: 0,
    thisMonthMeetings: 0,
    agmCount: 0,
    groupMeetingsCount: 0,
    boardMeetingsCount: 0,
    attendancePercentage: 0
  };

  const navTiles = [
    {
      title: 'Schedule AGM or Meeting',
      desc: 'Convene Annual General Meetings, Board sessions, or SHG weekly groups with automated attendee rosters',
      path: '/meetings/create',
      icon: Plus,
      badge: 'New Assembly'
    },
    {
      title: 'Meetings Registry',
      desc: 'Browse complete historical and scheduled directory with multi-tier society/branch filters',
      path: '/meetings/list',
      icon: FileSpreadsheet,
      badge: `${stats.totalMeetings} Records`
    },
    {
      title: 'Calendar Schedule',
      desc: 'Interactive visual monthly calendar of upcoming AGM dates, board assemblies, and group meetings',
      path: '/meetings/calendar',
      icon: Calendar,
      badge: 'Timeline View'
    },
    {
      title: 'Governance Reports & Analytics',
      desc: 'Quorum fulfillment, member attendance percentage breakdowns, and meeting type distributions',
      path: '/meetings/reports',
      icon: PieChart,
      badge: `${stats.attendancePercentage}% Quorum Avg`
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Statutory Governance & AGM Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Meeting Operations & AGM Management
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Organize Annual General Meetings (AGMs), Board assemblies, SHG thrift collections, and track roll-call quorums.
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

        {/* Hierarchical Governance Filter */}
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

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Meetings */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Meetings</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalMeetings}</p>
          <p className="text-xs font-bold text-teal-700 flex items-center gap-1 font-mono">
            <span>{stats.thisMonthMeetings}</span> scheduled this month
          </p>
        </div>

        {/* AGMs & SGMs */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AGMs & SGMs</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-teal-900">{stats.agmCount || 0}</p>
          <p className="text-xs font-medium text-slate-500">General Body Assemblies</p>
        </div>

        {/* SHG Group Meetings */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Meetings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-900">{stats.groupMeetingsCount || 0}</p>
          <p className="text-xs font-medium text-slate-500">SHG Thrift & Microloan Assemblies</p>
        </div>

        {/* Quorum Attendance Rate */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quorum Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-teal-800">{stats.attendancePercentage}%</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Quick Action Desks */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Meeting Desks & Governance Navigation</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {navTiles.map((tile) => {
            const Icon = tile.icon || Calendar;
            return (
              <Link
                key={tile.path}
                to={tile.path}
                className="bg-white p-6 rounded-3xl border border-teal-100/80 hover:border-teal-300 hover:shadow-md transition-all group flex items-start justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 group-hover:scale-105 transition-transform shrink-0">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {tile.title}
                      </h3>
                      {tile.badge && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold font-mono">
                          {tile.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{tile.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two-Column Feeds: Upcoming Meetings vs Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming Assemblies */}
        <div className="bg-white rounded-3xl p-6 border border-teal-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Upcoming Scheduled Meetings ({data?.upcomingMeetingsList?.length || 0})</span>
            </h2>
            <Link to="/meetings/list?status=Scheduled" className="text-xs font-bold text-teal-700 hover:text-teal-800">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {(!data?.upcomingMeetingsList || data.upcomingMeetingsList.length === 0) ? (
              <p className="text-xs text-slate-400 font-medium py-6 text-center">No upcoming meetings scheduled in this scope.</p>
            ) : (
              data.upcomingMeetingsList.map((m) => (
                <Link
                  key={m._id}
                  to={`/meetings/${m._id}`}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-200 transition-all flex items-center justify-between gap-4 block group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {m.meetingId}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-200">
                        {m.meetingType}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      <span>{new Date(m.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3 text-teal-600" />
                      <span className="truncate max-w-[150px]">{m.venue}</span>
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Past Assemblies */}
        <div className="bg-white rounded-3xl p-6 border border-teal-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span>Recent Governance Records</span>
            </h2>
            <Link to="/meetings/list" className="text-xs font-bold text-teal-700 hover:text-teal-800">
              Full Registry &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {(!data?.recentMeetings || data.recentMeetings.length === 0) ? (
              <p className="text-xs text-slate-400 font-medium py-6 text-center">No past meetings recorded.</p>
            ) : (
              data.recentMeetings.map((m) => (
                <Link
                  key={m._id}
                  to={`/meetings/${m._id}`}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-200 transition-all flex items-center justify-between gap-4 block group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {m.meetingId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        m.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {m.organizationId?.name || 'Society'} • {new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MeetingDashboardPage;
