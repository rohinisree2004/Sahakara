import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  PlusCircle, 
  Users, 
  Sliders, 
  Loader2, 
  Sparkles,
  Layers,
  ArrowRight,
  UserCheck
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
        setError(err.message || 'Unable to load roles dashboard.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 max-w-7xl mx-auto my-12 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
        <p className="text-xs font-bold text-slate-700">Loading RBAC roles matrix...</p>
      </div>
    );
  }

  const info = data || {
    totalRoles: 8,
    activeRoles: 8,
    systemRoles: 8,
    customRoles: 0,
    permissionStats: {
      totalModules: 13,
      totalActions: 8,
      grantedRulesCount: 104,
    },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Access Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>Roles & Permissions Matrix Engine</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Configure system roles, build custom permission matrices across 13 ERP modules, and audit user access levels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/roles/assign"
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Role Assignments</span>
            </Link>
            <Link
              to="/roles/create"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Custom Role</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Configured Roles</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.totalRoles}</div>
          <div className="text-[11px] text-teal-700 font-semibold">System + Custom Roles</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Active Roles</span>
            <ShieldAlert className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-800">{info.activeRoles}</div>
          <div className="text-[11px] text-slate-500 font-medium">Currently assigned in society</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>System Default Roles</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-800">{info.systemRoles}</div>
          <div className="text-[11px] text-slate-500 font-medium">Core platform roles</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Custom Society Roles</span>
            <Sliders className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.customRoles}</div>
          <div className="text-[11px] text-slate-500 font-medium">Created by Org Admin</div>
        </div>

      </div>

      {/* Permission Scope Architecture */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Permission Scope Matrix Architecture</span>
          </h3>
          <span className="text-xs font-mono text-teal-800 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            13 Modules × 8 Actions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Total ERP Modules</div>
            <div className="text-2xl font-black text-slate-900 mt-1">13</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Action Types</div>
            <div className="text-2xl font-black text-teal-800 mt-1">8</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Matrix Grid Cells</div>
            <div className="text-2xl font-black text-teal-800 mt-1">104</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Granted Rules</div>
            <div className="text-2xl font-black text-teal-800 mt-1">{info.permissionStats?.grantedRulesCount || 104}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RoleDashboardPage;
