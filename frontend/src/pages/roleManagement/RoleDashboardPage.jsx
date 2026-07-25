import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  PlusCircle, 
  Users, 
  Sliders, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import { fetchRolesDashboard } from '../../services/api';

const RoleDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchRolesDashboard();
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
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
    totalRoles: 0,
    activeRoles: 0,
    systemRoles: 0,
    customRoles: 0,
    permissionStats: {
      totalModules: 0,
      totalActions: 0,
      grantedRulesCount: 0,
    },
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Granular Access Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Roles & Permissions Matrix Engine
            </h1>
            <p className="text-sm text-slate-400">
              Configure system roles, build custom permission matrices across 13 ERP modules, and audit user access levels
            </p>
          </div>

          <Link
            to="/roles/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Custom Role</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Configured Roles</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.totalRoles}</div>
          <div className="text-[11px] text-indigo-400 font-medium">System + Custom Roles</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Roles</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{info.activeRoles}</div>
          <div className="text-[11px] text-slate-500">Currently assigned in society</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>System Default Roles</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{info.systemRoles}</div>
          <div className="text-[11px] text-slate-500">Core platform roles</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Custom Society Roles</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{info.customRoles}</div>
          <div className="text-[11px] text-slate-500">Created by Org Admin</div>
        </div>

      </div>

      {/* Permission Matrix Scope Summary */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Permission Scope Architecture</span>
          <span className="text-xs font-mono text-indigo-400 font-bold">13 Modules x 8 Actions</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Total ERP Modules</div>
            <div className="text-xl font-bold text-white mt-1">13</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Action Types</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">8</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Permission Matrix Cells</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">104</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Granted Rules</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{info.permissionStats.grantedRulesCount}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RoleDashboardPage;
