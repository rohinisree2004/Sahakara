import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  GitBranch, 
  UserCheck, 
  Users, 
  ShieldAlert, 
  FileText, 
  Settings, 
  ArrowRight, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import { fetchOrgDashboard } from '../../services/api';

const OrgDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchOrgDashboard();
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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
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

  // Handle nested data.summary if returned by backend API
  const summary = data?.summary || data || {};
  const info = {
    orgName: summary.organizationName || summary.orgName || 'Unknown Organization',
    totalBranches: summary.totalBranches ?? 0,
    totalEmployees: summary.totalEmployees ?? 0,
    totalMembers: summary.totalMembers ?? 0,
    activeLoans: summary.activeLoansAmount || summary.activeLoans || '₹ 0',
    monthlySavings: summary.monthlySavingsManaged || summary.monthlySavings || '₹ 0',
  };

  const quickActions = [
    { title: 'Organization Profile', desc: 'Edit society info, logo & emblem', path: '/org-admin/profile', icon: Building2, color: 'text-indigo-400' },
    { title: 'Branch Management', desc: 'Create & manage society branches', path: '/branches/dashboard', icon: GitBranch, color: 'text-cyan-400' },
    { title: 'User Management', desc: 'Manage user accounts & bcrypt resets', path: '/users/dashboard', icon: UserCheck, color: 'text-teal-400' },
    { title: 'Member Management', desc: 'Member enrollment, KYCs & approvals', path: '/members/dashboard', icon: Users, color: 'text-emerald-400' },
    { title: 'Roles & Permissions', desc: 'Custom RBAC permission matrix', path: '/roles/dashboard', icon: ShieldAlert, color: 'text-amber-400' },
    { title: 'Group Management', desc: 'SHG / JLG groups & leader desk', path: '/groups/dashboard', icon: Users, color: 'text-purple-400' },
    { title: 'Reports & Analytics', desc: 'Export PDF & Excel reports', path: '/members/reports', icon: FileText, color: 'text-rose-400' },
    { title: 'Society Settings', desc: 'Financial year & system currency', path: '/org-admin/settings', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Society Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tenant ERP Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {info.orgName}
            </h1>
            <p className="text-xs text-slate-400">
              Cooperative Society Operational Dashboard & ERP Module Management
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Total Branches</div>
          <div className="text-3xl font-extrabold text-white">{info.totalBranches}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Operational locations</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Total Employees</div>
          <div className="text-3xl font-extrabold text-cyan-400">{info.totalEmployees}</div>
          <div className="text-[11px] text-slate-500">Tellers & Officers</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Total Members</div>
          <div className="text-3xl font-extrabold text-emerald-400">{typeof info.totalMembers === 'number' ? info.totalMembers.toLocaleString() : info.totalMembers}</div>
          <div className="text-[11px] text-slate-500">Active account holders</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold">Active Loan Portfolio</div>
          <div className="text-3xl font-extrabold text-amber-400">{info.activeLoans}</div>
          <div className="text-[11px] text-slate-500">Across all branches</div>
        </div>

      </div>

      {/* Quick Action Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <span>Quick Module Navigation Desk</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.path}
                className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all duration-200 group flex flex-col justify-between space-y-4 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{action.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 pt-2 border-t border-slate-800/80">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default OrgDashboardPage;
