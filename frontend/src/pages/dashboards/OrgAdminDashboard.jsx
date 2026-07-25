import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, LogOut, ShieldCheck, Users, Layers, Landmark } from 'lucide-react';

const OrgAdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="glass-nav border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              SAHAKARA <span className="text-emerald-400">ERP</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                Org Admin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Vijaya Credit Cooperative Society Ltd.</p>
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

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3">
          <h2 className="text-2xl font-extrabold text-white">
            Organization Admin Dashboard: <span className="gradient-text">{user?.name}</span>
          </h2>
          <p className="text-sm text-slate-400">
            You are managing organization data isolated via <strong>organizationId: {user?.organizationId || '65e111111111111111111111'}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Authentication Token</div>
            <div className="text-sm font-mono text-emerald-400">JWT Verified</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Isolation Scope</div>
            <div className="text-sm font-mono text-cyan-400">Single Cooperative Society</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Role Authority</div>
            <div className="text-sm font-mono text-amber-400">Org Setup & Branch Creation</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgAdminDashboard;
