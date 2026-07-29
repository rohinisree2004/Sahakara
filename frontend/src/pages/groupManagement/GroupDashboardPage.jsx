import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  PlusCircle, 
  TrendingUp, 
  Loader2, 
  Sparkles,
  ShieldAlert
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
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Self-Help Group (SHG) & JLG Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Member Group & Credit Linkage Portal
            </h1>
            <p className="text-sm text-slate-400">
              Manage cooperative SHG/JLG groups, assign group leaders, allocate member rosters, and monitor micro-loan performance
            </p>
          </div>

          <Link
            to="/groups/create"
            className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Group</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Member Groups</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.totalGroups}</div>
          <div className="text-[11px] text-teal-400 font-medium">SHG, JLG & Farmers Groups</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Groups</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{info.activeGroups}</div>
          <div className="text-[11px] text-slate-500">Regular meetings & savings</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Group Members</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{info.totalMembersInGroups}</div>
          <div className="text-[11px] text-slate-500">Linked to society groups</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Group Growth (YTD)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">+15%</div>
          <div className="text-[11px] text-slate-500">Steady group onboarding</div>
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
            {info.groupGrowthTrend.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>{item.month}</span>
                  <span className="font-mono text-teal-400">{item.count} Groups</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / 25) * 100}%` }}
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
              <span className="font-mono text-teal-400 font-bold text-sm">{info.groupTypesDistribution.shgGroups} Groups</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Joint Liability Groups (JLG)</div>
                <div className="text-[11px] text-slate-400 font-normal">Joint collateral & peer guarantee loans</div>
              </div>
              <span className="font-mono text-cyan-400 font-bold text-sm">{info.groupTypesDistribution.jlgGroups} Groups</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Farmers & Agri Groups</div>
                <div className="text-[11px] text-slate-400 font-normal">Crop credit & agricultural implements</div>
              </div>
              <span className="font-mono text-amber-400 font-bold text-sm">{info.groupTypesDistribution.farmersGroups} Groups</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default GroupDashboardPage;
