import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, LogOut, Wallet, Landmark, Calculator } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="glass-nav border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              SAHAKARA <span className="text-emerald-400">ERP</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono">
                Employee / Teller
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Branch Operations Workspace</p>
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
            Staff Counter Desk: <span className="gradient-text">{user?.name}</span>
          </h2>
          <p className="text-sm text-slate-400">
            Authenticated for member deposits, EMI collection counter, and account ledger management.
          </p>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
