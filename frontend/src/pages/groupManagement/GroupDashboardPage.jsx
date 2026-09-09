import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  PlusCircle, 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  UserPlus, 
  FileText, 
  Clock, 
  Layers, 
  ChevronRight,
  Crown,
  Building2,
  GitBranch,
  Award
} from 'lucide-react';
import { fetchGroupDashboard } from '../../services/api';

const GroupDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchGroupDashboard();
        if (res.data && res.data.success) {
          setData(res.data.data);
          setError(null);
        }
      } catch (err) {
        setError(err.message || 'Unable to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-600 bg-white p-8 rounded-3xl border border-rose-100 shadow-xs max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 mb-3 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Dashboard Error</h2>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  const info = data || {
    totalGroups: 0,
    activeGroups: 0,
    inactiveGroups: 0,
    totalMembersInGroups: 0,
    groupTypesDistribution: {
      shgGroups: 0,
      jlgGroups: 0,
      farmersGroups: 0,
      savingsGroups: 0,
    },
    groupGrowthTrend: [],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Master Scope Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Self-Help Group (SHG) & JLG Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Member Group & Credit Linkage Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Manage cooperative SHG/JLG member groups, elect group office-bearers (President, Secretary, Treasurer), allocate rosters, and track thrift savings
            </p>
          </div>

          {/* Action Buttons in Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/groups/leader"
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Appoint Executives</span>
            </Link>

            <Link
              to="/groups/list"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Users className="w-4 h-4 text-teal-600" />
              <span>Groups Directory</span>
            </Link>

            <Link
              to="/groups/create"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Group</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <Link
          to="/groups/list"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-teal-300 hover:shadow-soft-teal transition-all group block"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Member Groups</span>
            <Layers className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.totalGroups}</div>
          <div className="text-[11px] text-teal-800 font-bold flex items-center justify-between">
            <span>SHG, JLG & Agri Groups</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link
          to="/groups/list?status=Active"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-teal-300 hover:shadow-soft-teal transition-all group block"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Active Groups</span>
            <UserCheck className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-teal-800">{info.activeGroups}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Operational & credit active</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600" />
          </div>
        </Link>

        <Link
          to="/groups/members"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-teal-300 hover:shadow-soft-teal transition-all group block"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Enrolled Members</span>
            <Users className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.totalMembersInGroups}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Assigned to group rosters</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600" />
          </div>
        </Link>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Inactive / Dormant</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.inactiveGroups}</div>
          <div className="text-[11px] text-slate-500">Pending activity renewal</div>
        </div>

      </div>

      {/* Quick Action Navigation Hub */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">
          Group Management & Operations Hub
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link
            to="/groups/list"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-start justify-between shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Groups Directory & Profiles
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Browse, search, toggle status, and view group profile details
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/create"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-start justify-between shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Create New SHG / JLG Group
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Register new SHG, JLG, or Farmers group with branch assignment
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/leader"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-start justify-between shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 group-hover:scale-105 transition-transform font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Appoint Group Leadership
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Elect or assign President, Secretary, and Treasurer for groups
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/members"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-start justify-between shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Member Roster Allocation
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Add, remove, or transfer members between society groups
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/reports"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-start justify-between shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Group Analytics & Rosters
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Generate analytical summaries and member roster spreadsheets
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/logs"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-start justify-between shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Group Activity Logs
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Inspect immutable audit logs for leadership and membership events
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 mt-1" />
          </Link>

        </div>
      </div>

      {/* Models Breakdown & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Onboarding Growth */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Group Onboarding Growth</h3>
            <span className="text-xs text-slate-400 font-mono">2026 YTD</span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { month: 'Jan', count: 6, percent: 40 },
              { month: 'Feb', count: 9, percent: 60 },
              { month: 'Mar', count: 11, percent: 73 },
              { month: 'Apr', count: 15, percent: 100 },
            ].map((row) => (
              <div key={row.month} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">{row.month}</span>
                  <span className="text-slate-900 font-mono">{row.count} Groups</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Classification Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Group Classification Breakdown</h3>
            <span className="text-xs text-slate-400 font-mono">Group Types</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Self-Help Groups (SHG)</div>
                <div className="text-[11px] text-slate-500">Women micro-savings & self-empowerment</div>
              </div>
              <span className="font-mono font-bold text-sm text-teal-800">
                {info.groupTypesDistribution?.shgGroups || 6} Groups
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Joint Liability Groups (JLG)</div>
                <div className="text-[11px] text-slate-500">Joint collateral & peer guarantee loans</div>
              </div>
              <span className="font-mono font-bold text-sm text-teal-800">
                {info.groupTypesDistribution?.jlgGroups || 4} Groups
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Farmers Collectives (FCG)</div>
                <div className="text-[11px] text-slate-500">Agricultural produce & input support</div>
              </div>
              <span className="font-mono font-bold text-sm text-teal-800">
                {info.groupTypesDistribution?.farmersGroups || 3} Groups
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-xs">Savings & Enterprise Collectives</div>
                <div className="text-[11px] text-slate-500">Targeted monthly savings pools</div>
              </div>
              <span className="font-mono font-bold text-sm text-teal-800">
                {info.groupTypesDistribution?.savingsGroups || 2} Groups
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default GroupDashboardPage;
