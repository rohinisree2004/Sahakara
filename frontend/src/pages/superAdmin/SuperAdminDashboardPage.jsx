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
  Eye,
  CreditCard,
  Banknote
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading Super Admin governance telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-600 bg-white p-8 rounded-2xl border border-rose-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 mb-3 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Dashboard Error</h2>
        <p className="text-xs text-slate-500">{error}</p>
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
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Multi-Tenant Platform Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Super Admin <span className="gradient-text">Governance Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Centralized platform oversight: Supervise cooperative societies, branch networks, universal user identities, and financial portfolio metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/super-admin/approvals"
              className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Pending Requests ({summary.pendingRequests})</span>
            </Link>
            <Link
              to="/super-admin/organizations"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <Building2 className="w-4 h-4" />
              <span>Society Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Orgs */}
        <Link 
          to="/super-admin/organizations" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-teal-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-800 uppercase tracking-wider">Total Societies</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.totalOrganizations}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center justify-between">
            <span>{summary.activeOrganizations} Active • {summary.suspendedOrganizations} Suspended</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Total Branches */}
        <Link 
          to="/branches/dashboard" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-teal-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-800 uppercase tracking-wider">Branch Network</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.totalBranches}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center justify-between">
            <span>Operational Branches</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Total Users */}
        <Link 
          to="/users/dashboard" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-teal-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-800 uppercase tracking-wider">Global Users</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.totalUsers}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center justify-between">
            <span>Admins, Staff & Executives</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Pending Requests */}
        <Link 
          to="/super-admin/approvals" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-amber-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-amber-800 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.pendingRequests}</div>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center justify-between">
            <span>Onboarding Verification</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

      </div>

      {/* Financial & Member Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Members</span>
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.totalMembersOverall}</div>
          <div className="text-xs text-slate-500 font-medium">Aggregated across all societies</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Savings Managed</span>
            <Wallet className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800">{summary.totalSavingsManaged}</div>
          <div className="text-xs text-slate-500 font-medium">Member deposits & recurring savings</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Loans Disbursed</span>
            <Landmark className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800">{summary.totalLoansDisbursed}</div>
          <div className="text-xs text-slate-500 font-medium">Active portfolio credit balance</div>
        </div>

      </div>

      {/* Master Management Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Platform Governance & Resource Control</span>
          </h2>
          <span className="text-xs text-teal-800 font-mono font-semibold">Root Governance Desks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Organizations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Manage Societies</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Directly register, view, update details, suspend or reactivate tenant cooperative societies.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/super-admin/organizations"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View All Societies</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Branches */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Branch Directory</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Oversee operational branch locations, assign branch managers, and audit performance across societies.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/branches/management"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Manage Branches</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Users */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">User Directory</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage Admins, Executives, Branch Managers, Tellers, and Members. Reset passwords and assign roles.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/users/list"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>User Directory</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Monitoring */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Infrastructure Monitoring</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect database cluster health, API throughput, response latencies, and service uptime.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/super-admin/monitoring"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>System Telemetry</span>
              </Link>
            </div>
          </div>

          {/* Card 5: Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Platform Settings</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure global system branding, maintenance mode toggles, session timeouts, and registration policies.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/super-admin/settings"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Settings</span>
              </Link>
            </div>
          </div>

          {/* Card 6: Audit Logs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Global Audit Trail</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect cross-tenant security events, administrative actions, and IP tracking logs with full immutability.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/super-admin/audit-logs"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>View Security Logs</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activities Audit Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Recent Platform Activity Feed</span>
          </h3>
          <Link to="/super-admin/audit-logs" className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-bold">
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No recent activity logged yet.</div>
          ) : (
            activities.map((act, idx) => (
              <div key={act._id || idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="text-slate-900 font-semibold flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-bold">
                      {act.action}
                    </span>
                    <span>{act.details}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    By {act.performerName || 'System Admin'}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(act.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboardPage;
