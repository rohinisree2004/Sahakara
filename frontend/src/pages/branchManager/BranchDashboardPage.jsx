import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Users, 
  UserCheck, 
  Landmark, 
  Wallet, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Loader2, 
  Sparkles,
  ShieldAlert,
  GitBranch,
  ArrowRight,
  ChevronRight,
  FileText,
  Building,
  Building2
} from 'lucide-react';
import { fetchBranchDashboard, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BranchDashboardPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations({ limit: 100 });
          if (res.data && res.data.success) {
            setOrganizations(res.data.data);
          }
        } catch (err) {
          console.warn('Error loading organizations:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const params = {};
        if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
          params.organizationId = selectedOrgId;
        }
        const res = await fetchBranchDashboard(params);
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
  }, [selectedOrgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
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
    branchName: 'Operational Branches',
    branchCode: 'MULTI-BRANCH',
    managerName: 'Branch Administration',
    totalMembers: 0,
    activeMembers: 0,
    totalEmployees: 0,
    activeLoansCount: 0,
    activeLoansAmount: '₹ 0',
    monthlySavingsManaged: '₹ 0',
    recentTransactions: [],
    upcomingMeetings: [],
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Branch Command & Operations Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {info.branchName} <span className="text-teal-400 font-mono">({info.branchCode})</span>
            </h1>
            <p className="text-sm text-slate-400">
              Assigned Branch Manager: <span className="text-white font-bold">{info.managerName}</span> • Multi-Branch Governance
            </p>
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="bg-transparent text-emerald-300 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Organizations (Global)</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id} className="bg-slate-900 text-white">
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to="/branches/management"
              className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <GitBranch className="w-4 h-4" />
              <span>Manage All Branches</span>
            </Link>

            <Link
              to="/branches/manager-assign"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign Managers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Link
          to="/branches/members"
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Branch Members</span>
            <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.totalMembers}</div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-between">
            <span>{info.activeMembers} Active Accounts</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link
          to="/branches/employees"
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 hover:border-teal-500/40 transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Branch Staff / Tellers</span>
            <UserCheck className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400">{info.totalEmployees}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Counter tellers & officers</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
          </div>
        </Link>

        <Link
          to="/loans/dashboard"
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Loan Balance</span>
            <Landmark className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{info.activeLoansAmount}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>{info.activeLoansCount} active loans</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
          </div>
        </Link>

        <Link
          to="/savings/dashboard"
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Savings Deposits</span>
            <Wallet className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400">{info.monthlySavingsManaged}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Monthly savings flow</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
          </div>
        </Link>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase text-slate-400">
          Branch Operations & Management Hub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link
            to="/branches/management"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  Branch Directory & Management
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  View branch network, create new branches, toggle statuses
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/branches/manager-assign"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Assign Branch Managers
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Appoint and reassign branch managers across locations
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/branches/employees"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Branch Staff Directory
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Inspect employees, counter tellers, and loan officers by branch
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/branches/members"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Branch Member Accounts
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Browse members registered under specific society branches
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/branches/reports"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Branch Operational Reports
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Generate cross-branch analytics, collection and member growth summaries
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0 mt-1" />
          </Link>

          <Link
            to="/branches/logs"
            className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-rose-500/40 hover:bg-slate-900/60 transition-all group flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  Branch Activity Logs
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Inspect immutable audit logs for branch configurations
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors shrink-0 mt-1" />
          </Link>

        </div>
      </div>

    </div>
  );
};

export default BranchDashboardPage;
