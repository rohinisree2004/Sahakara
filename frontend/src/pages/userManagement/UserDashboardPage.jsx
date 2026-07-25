import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  Loader2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { fetchUserDashboard } from '../../services/api';

const UserDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchUserDashboard();
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
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
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
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    recentlyAdded: [],
    roleDistribution: {
      adminCount: 0,
      executiveCount: 0,
      employeeCount: 0,
      memberCount: 0,
    },
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RBAC User Management Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Accounts & Role Control
            </h1>
            <p className="text-sm text-slate-400">
              Governance portal for user onboarding, bcrypt password resets, role assignments, and inter-branch staff transfers
            </p>
          </div>

          <Link
            to="/users/create"
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total ERP Accounts</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.totalUsers.toLocaleString()}</div>
          <div className="text-[11px] text-cyan-400 font-medium">All 7 Platform Roles</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Login Users</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{info.activeUsers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Authenticated & verified</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Inactive / Suspended</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{info.inactiveUsers}</div>
          <div className="text-[11px] text-slate-500">Disabled accounts</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Employees & Officers</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400">{info.roleDistribution.employeeCount}</div>
          <div className="text-[11px] text-slate-500">Counter tellers & staff</div>
        </div>

      </div>

      {/* Role Breakdown & Recently Onboarded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Role Distribution Summary</span>
            <span className="text-xs font-mono text-cyan-400 font-bold">7-Level RBAC</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">Organization Admins</span>
              <span className="font-mono text-cyan-400 font-bold">{info.roleDistribution.adminCount} Account</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">Board Executives (President, Sec, Treas)</span>
              <span className="font-mono text-cyan-400 font-bold">{info.roleDistribution.executiveCount} Accounts</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">Branch Employees & Tellers</span>
              <span className="font-mono text-cyan-400 font-bold">{info.roleDistribution.employeeCount} Staff</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">Society Member Accounts</span>
              <span className="font-mono text-cyan-400 font-bold">{info.roleDistribution.memberCount} Members</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recently Onboarded Users</span>
            </span>
            <Link to="/users/list" className="text-xs text-cyan-400 hover:underline">View All</Link>
          </h3>

          <div className="space-y-3">
            {info.recentlyAdded.map((u) => (
              <div key={u._id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-white font-bold">{u.name}</div>
                  <div className="text-slate-400 text-[11px]">{u.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboardPage;
