import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  GitBranch, 
  CheckSquare, 
  ShieldAlert, 
  TrendingUp, 
  Wallet, 
  Landmark, 
  Activity, 
  ArrowUpRight, 
  ArrowRight,
  Clock,
  Sparkles,
  Loader2,
  Settings,
  ShieldCheck,
  PlusCircle,
  Eye,
  CreditCard,
  Banknote,
  Receipt,
  Calendar,
  Layers,
  HelpCircle,
  AlertCircle
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
        setError(err.message || 'Unable to load organization dashboard.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading Society Governance Hub telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-600 bg-white p-8 rounded-3xl border border-rose-100 shadow-xs">
        <ShieldAlert className="w-12 h-12 mb-3 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Dashboard Telemetry Error</h2>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  const summary = data?.summary || {
    organizationName: 'Cooperative Society',
    code: 'ORG',
    registrationNumber: 'REG-KL-2024-001',
    societyType: 'Credit Cooperative',
    totalBranches: 0,
    totalEmployees: 0,
    totalMembers: 0,
    totalGroups: 0,
    totalMeetings: 0,
    pendingLoansCount: 0,
    pendingMembersKYC: 0,
    totalPendingApprovals: 0,
    activeLoansAmount: '₹ 0',
    monthlySavingsManaged: '₹ 0',
    activeLoanAccounts: 0,
    savingsAccountsCount: 0,
    branches: []
  };

  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Society Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Society Executive Command Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {summary.organizationName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
              Registered {summary.societyType} ({summary.code}) • Comprehensive branch network, member loan ledgers, savings passbooks, and statutory AGM governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/members/approvals"
              className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Pending Approvals ({summary.totalPendingApprovals})</span>
            </Link>
            <Link
              to="/org-admin/profile"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <Building2 className="w-4 h-4" />
              <span>Society Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Metric Cards Grid (4 Top Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Branches */}
        <Link 
          to="/branches/dashboard" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-teal-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-800 uppercase tracking-wider">Branch Network</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.totalBranches}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center justify-between">
            <span>Operational Branches</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Total Staff & Users */}
        <Link 
          to="/users/dashboard" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-teal-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-800 uppercase tracking-wider">Staff & Officers</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.totalEmployees}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center justify-between">
            <span>Managers, Tellers & Executives</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Total Members */}
        <Link 
          to="/members/dashboard" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-teal-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-800 uppercase tracking-wider">Total Members</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{typeof summary.totalMembers === 'number' ? summary.totalMembers.toLocaleString() : summary.totalMembers}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center justify-between">
            <span>Active Shareholder Accounts</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* SHG Groups Network */}
        <Link 
          to="/groups/dashboard" 
          className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 hover:border-teal-400 hover:shadow-soft-teal transition-all group block shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-800 uppercase tracking-wider">SHG / JLG Groups</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.totalGroups}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center justify-between">
            <span>Thrift & Microloan Groups</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

      </div>

      {/* Financial & Approvals Aggregates Strip (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Savings Managed</span>
            <Wallet className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800">{summary.monthlySavingsManaged}</div>
          <div className="text-xs text-slate-500 font-medium">Thrift deposits & recurring accounts</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Loan Portfolio</span>
            <Landmark className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800">{summary.activeLoansAmount}</div>
          <div className="text-xs text-slate-500 font-medium">{summary.activeLoanAccounts} Active microcredit accounts</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending KYC & Loans</span>
            <CheckSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{summary.totalPendingApprovals}</div>
          <div className="text-xs text-slate-500 font-medium">{summary.pendingMembersKYC} Member KYC • {summary.pendingLoansCount} Loan Applications</div>
        </div>

      </div>

      {/* Society Governance & Resource Control Hub (6 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Society Governance & Resource Desks</span>
          </h2>
          <span className="text-xs text-teal-800 font-mono font-semibold">Society Operational Desks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Branch Network */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Branch Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Oversee operational branch offices, assign branch managers, and track local deposit performance.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/branches/management"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Manage Branches</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Users & Staff */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Users & Staff Desk</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage society employees, tellers, branch officers, and executive board access credentials.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/users/list"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Staff Directory</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Member Lifecycle */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Member Lifecycle Desk</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review KYC onboarding, share capital allocations, member certificates, and resignation closures.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/members/dashboard"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Member Directory</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Loans & Credit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Loan & Credit Portfolio</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sanction loan applications, audit repayments, track overdue EMIs, and monitor portfolio risk.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/loans/dashboard"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Loan Portfolio</span>
              </Link>
            </div>
          </div>

          {/* Card 5: Accounting & General Ledger */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">General Ledger & Accounts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Post double-entry journal vouchers, view Chart of Accounts, Trial Balance, and Profit & Loss.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/accounting/dashboard"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>General Ledger</span>
              </Link>
            </div>
          </div>

          {/* Card 6: Meetings & AGM Governance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Meetings & AGM Governance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Schedule statutory Annual General Meetings (AGMs), Board meetings, and SHG weekly assemblies.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/meetings/dashboard"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Meetings Desk</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Grid: Active Branches & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Branches Breakdown Table */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600" />
              <span>Society Branches</span>
            </h3>
            <Link to="/branches/management" className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-bold">
              <span>View All ({summary.totalBranches})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {summary.branches && summary.branches.length > 0 ? (
              summary.branches.map((b) => (
                <div key={b._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{b.branchName || b.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Code: {b.branchCode || b.code || 'BR-01'} • Manager: {b.managerId?.name || 'Unassigned'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-800 font-mono">
                    {b.status || 'Active'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">No branches registered yet.</div>
            )}
          </div>
        </div>

        {/* Recent Activities Audit Feed */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Recent Society Activity Feed</span>
            </h3>
            <Link to="/org-admin/logs" className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-bold">
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {activities.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No recent activity logged yet.</div>
            ) : (
              activities.map((act, idx) => (
                <div key={act._id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-slate-900 font-semibold flex items-center gap-2 truncate">
                      <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-bold shrink-0">
                        {act.action}
                      </span>
                      <span className="truncate">{act.details}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      By {act.performerName || 'Society Staff'}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                    {new Date(act.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrgDashboardPage;
