import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans selection:bg-amber-500 selection:text-white">
      <div className="glass-card max-w-lg w-full rounded-3xl border border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glowing aura background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-xl">
          <Lock className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-amber-400 font-mono tracking-widest">403</span>
          <h1 className="text-2xl font-black text-white tracking-tight">Access Restricted (RBAC Guard)</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your current role <strong className="text-amber-400 font-mono">[{user?.role || 'Guest'}]</strong> is not authorized to access this ERP module or operation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Need Higher Authorization?</span>
          </div>
          <p className="text-[11px]">
            Contact your Society Administrator or Super Admin to request custom permission matrix grants.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/org-admin/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UnauthorizedPage;
