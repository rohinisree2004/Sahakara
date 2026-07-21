import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans selection:bg-rose-500 selection:text-white">
      <div className="glass-card max-w-lg w-full rounded-3xl border border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glowing aura background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-rose-500 font-mono tracking-widest">404</span>
          <h1 className="text-2xl font-black text-white tracking-tight">ERP Route Not Found</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The module page or navigation endpoint you requested does not exist or may have been relocated within Sahakara ERP.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
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

export default NotFoundPage;
