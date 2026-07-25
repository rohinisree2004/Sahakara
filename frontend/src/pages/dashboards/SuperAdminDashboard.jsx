import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, LogOut, Building2, Users, Layers, Award, ArrowRight } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="glass-nav border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              SAHAKARA <span className="text-emerald-400">ERP</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono">
                Super Admin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Global System Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{user?.name}</div>
            <div className="text-[11px] text-emerald-400 font-mono">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-400 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Welcome Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Award className="w-3.5 h-3.5" />
            <span>Module 2: Authentication System Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, System Owner: <span className="gradient-text">{user?.name}</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            You are logged in with full system privileges. Super Admin oversees all cooperative societies, manages organization onboarding approvals, and monitors platform-wide security.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Target Role Destination</div>
            <div className="text-xl font-bold text-emerald-400">{user?.role}</div>
            <div className="text-xs text-slate-500">Route: /super-admin/dashboard</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Organization Scope</div>
            <div className="text-xl font-bold text-cyan-400">Global (All Societies)</div>
            <div className="text-xs text-slate-500">Multi-tenant Root Level</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Next Planned Module</div>
            <div className="text-xl font-bold text-amber-400">Module 3: Super Admin</div>
            <div className="text-xs text-slate-500">Society Approval & Management</div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SuperAdminDashboard;
