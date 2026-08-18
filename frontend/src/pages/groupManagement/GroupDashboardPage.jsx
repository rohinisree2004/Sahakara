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
  ChevronRight
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
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-400">
        <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
        <p className="text-sm font-medium">{error}</p>
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
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Self-Help Group (SHG) & JLG Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Member Group & Credit Linkage Portal
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Manage cooperative SHG/JLG groups, assign group leaders, allocate member rosters, and monitor micro-loan performance
            </p>
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/groups/list"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <Users className="w-4 h-4" />
              <span>View Groups Directory</span>
            </Link>

            <Link
              to="/groups/create"
              className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Group</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Link
          to="/groups/list"
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 hover:border-teal-500/40 transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Member Groups</span>
            <Users className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.totalGroups}</div>
          <div className="text-[11px] text-teal-400 font-medium flex items-center justify-between">
            <span>SHG, JLG & Farmers</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link
          to="/groups/list"
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Groups</span>
            <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{info.activeGroups}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Regular meetings & savings</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
          </div>
        </Link>

        <Link
          to="/groups/members"
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Group Members</span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{info.totalMembersInGroups}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Linked to society groups</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
          </div>
        </Link>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Group Health Score</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">98.5%</div>
          <div className="text-[11px] text-slate-500">Repayment & attendance index</div>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase text-slate-400">
          Group Management & Operations Hub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link
            to="/groups/list"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  Groups Directory & Registry
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Browse, search, toggle status, and view group profile details
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/create"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  Onboard New Member Group
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Register new SHG, JLG, or Farmers group with branch assignment
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/leader"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Group Leader Management
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Assign or transfer leadership responsibilities for groups
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/members"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Member Roster & Allocations
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Add, remove, or transfer members between society groups
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/reports"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Group Performance Reports
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Generate analytical summaries and member roster spreadsheets
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/groups/logs"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Group Activity Logs
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Inspect immutable audit logs for leadership and membership events
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0 mt-1" />
          </Link>

        </div>
      </div>

      {/* Growth Visualization & Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Group Onboarding Growth</span>
            <span className="text-xs font-mono text-teal-400 font-bold">2024 YTD</span>
          </h3>

          <div className="space-y-3 pt-2">
            {info.groupGrowthTrend?.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>{item.month}</span>
                  <span className="font-mono text-teal-400">{item.count} Groups</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (item.count / Math.max(1, info.totalGroups)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Group Classification Breakdown</span>
            <span className="text-xs font-mono text-teal-400 font-bold">Group Types</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Self-Help Groups (SHG)</div>
                <div className="text-[11px] text-slate-400">Women micro-savings & self-empowerment</div>
              </div>
              <span className="font-mono text-teal-400 font-bold text-sm">{info.groupTypesDistribution?.shgGroups || 0} Groups</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Joint Liability Groups (JLG)</div>
                <div className="text-[11px] text-slate-400 font-normal">Joint collateral & peer guarantee loans</div>
              </div>
              <span className="font-mono text-cyan-400 font-bold text-sm">{info.groupTypesDistribution?.jlgGroups || 0} Groups</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Farmers & Agri Groups</div>
                <div className="text-[11px] text-slate-400 font-normal">Crop credit & agricultural implements</div>
              </div>
              <span className="font-mono text-amber-400 font-bold text-sm">{info.groupTypesDistribution?.farmersGroups || 0} Groups</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Savings & Other Groups</div>
                <div className="text-[11px] text-slate-400 font-normal">Thrift & mutual assistance groups</div>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-sm">{info.groupTypesDistribution?.savingsGroups || 0} Groups</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default GroupDashboardPage;
