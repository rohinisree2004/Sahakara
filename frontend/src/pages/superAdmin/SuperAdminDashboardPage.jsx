import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  CheckSquare, 
  ShieldAlert, 
  TrendingUp, 
  Wallet, 
  Landmark, 
  Activity, 
  ArrowUpRight, 
  ArrowRight,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import { fetchSuperAdminDashboard } from '../../services/api';

const SuperAdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchSuperAdminDashboard();
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-sm font-medium">Loading Super Admin analytics...</p>
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

  const summary = data?.summary || {
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingRequests: 0,
    suspendedOrganizations: 0,
    totalMembersOverall: '0',
    totalLoansDisbursed: '₹ 0',
    totalSavingsManaged: '₹ 0',
    systemUptime: '0%',
    serverHealth: 'Unknown',
  };

  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tenant Governance Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Master <span className="gradient-text">Overview</span>
            </h1>
            <p className="text-sm text-slate-400">
              Real-time monitoring of all cooperative societies, member ledgers, and platform activity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/super-admin/approvals"
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Review Pending Orgs ({summary.pendingRequests})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Orgs */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Organizations</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{summary.totalOrganizations}</div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across Credit & Agricultural Societies</span>
          </div>
        </div>

        {/* Active Orgs */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Societies</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{summary.activeOrganizations}</div>
          <div className="text-[11px] text-slate-400">Fully operational tenants</div>
        </div>

        {/* Pending Requests */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{summary.pendingRequests}</div>
          <div className="text-[11px] text-amber-400 font-medium">Action required</div>
        </div>

        {/* Suspended Orgs */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-rose-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Suspended Orgs</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{summary.suspendedOrganizations}</div>
          <div className="text-[11px] text-slate-400">Compliance freeze</div>
        </div>

      </div>

      {/* Financial & Member Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total System Members</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{summary.totalMembersOverall}</div>
          <div className="text-xs text-slate-500">Aggregated across all societies</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Savings Managed</span>
            <Wallet className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{summary.totalSavingsManaged}</div>
          <div className="text-xs text-slate-500">Member deposits & recurring savings</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Loans Disbursed</span>
            <Landmark className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400">{summary.totalLoansDisbursed}</div>
          <div className="text-xs text-slate-500">Active loan portfolio balance</div>
        </div>

      </div>

      {/* Recent Activities Audit Feed */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Platform Activity Feed</span>
          </h3>
          <Link to="/super-admin/audit-logs" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {activities.map((act, idx) => (
            <div key={act._id || idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="text-white font-semibold flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    {act.action}
                  </span>
                  <span>{act.details}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  By {act.performerName}
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {new Date(act.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboardPage;
