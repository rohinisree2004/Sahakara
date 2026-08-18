import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck,
  GitBranch,
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
  Loader2,
  Settings,
  ShieldCheck,
  PlusCircle,
  Eye
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
    totalUsers: 0,
    totalBranches: 0,
    totalLoansDisbursed: '₹ 0',
    totalSavingsManaged: '₹ 0',
    systemUptime: '99.98%',
    serverHealth: 'Optimal',
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
              <span>Multi-Tenant Master Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Super Admin <span className="gradient-text">Governance Hub</span>
            </h1>
            <p className="text-sm text-slate-400">
              Centralized platform oversight: Manage organizations, cross-society branches, user accounts, and real-time financial aggregates
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/super-admin/approvals"
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Pending Requests ({summary.pendingRequests})</span>
            </Link>
            <Link
              to="/super-admin/organizations"
              className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Organizations Registry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Orgs */}
        <Link 
          to="/super-admin/organizations" 
          className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">Total Organizations</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{summary.totalOrganizations}</div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-between">
            <span>{summary.activeOrganizations} Active • {summary.suspendedOrganizations} Suspended</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Total Branches */}
        <Link 
          to="/branches/dashboard" 
          className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">Operational Branches</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{summary.totalBranches}</div>
          <div className="text-[11px] text-cyan-400 font-medium flex items-center justify-between">
            <span>Manage All Branches</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Total Users */}
        <Link 
          to="/users/dashboard" 
          className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">User Accounts</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">{summary.totalUsers}</div>
          <div className="text-[11px] text-indigo-400 font-medium flex items-center justify-between">
            <span>Admins, Staff & Members</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Pending Requests */}
        <Link 
          to="/super-admin/approvals" 
          className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3 hover:border-amber-500/50 hover:bg-slate-900/60 transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">Pending Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{summary.pendingRequests}</div>
          <div className="text-[11px] text-amber-400 font-medium flex items-center justify-between">
            <span>Onboarding verification</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

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

      {/* Master Management Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Platform Governance & Resource Control</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Super Admin Privilege</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Organizations */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Manage Organizations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directly register, view, update profile details, suspend or reactivate all tenant cooperative societies.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Link
                to="/super-admin/organizations"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View All Societies</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Branches */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Manage All Branches</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Oversee operational branch locations, assign branch managers, and manage branch parameters across all societies.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Link
                to="/branches/management"
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Branch Directory</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Users */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Manage User Accounts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervise Admins, Executives, Branch Managers, Employees, and Members. Reset passwords, toggle statuses, and assign roles.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Link
                to="/users/list"
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>User Directory</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Monitoring */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-teal-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Platform Health Monitoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect database cluster health, API throughput, response latencies, and service uptime.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Link
                to="/super-admin/monitoring"
                className="flex-1 py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>System Telemetry</span>
              </Link>
            </div>
          </div>

          {/* Card 5: Settings */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Master Platform Settings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure global system branding, maintenance mode toggles, session timeout policies, and registration controls.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Link
                to="/super-admin/settings"
                className="flex-1 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Settings</span>
              </Link>
            </div>
          </div>

          {/* Card 6: Audit Logs */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-amber-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Global Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect cross-tenant security events, administrative actions, and IP tracking logs with full audit immutability.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Link
                to="/super-admin/audit-logs"
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>View Security Logs</span>
              </Link>
            </div>
          </div>

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
