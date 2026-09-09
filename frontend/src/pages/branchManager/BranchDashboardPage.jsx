import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  GitBranch, 
  Users, 
  UserCheck, 
  Landmark, 
  Wallet, 
  Clock, 
  PlusCircle, 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  RefreshCw, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Layers,
  HelpCircle,
  Banknote,
  Search,
  Filter
} from 'lucide-react';
import { 
  fetchBranchDashboard, 
  fetchBranchesList, 
  fetchOrganizations 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BranchDashboardPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isOrgAdmin = user?.role === 'Organization Admin';
  const isBranchManager = user?.role === 'Branch Manager';

  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(searchParams.get('organizationId') || 'All');

  const [dashboard, setDashboard] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(searchParams.get('branchId') || '');
  const [recentActivities, setRecentActivities] = useState([]);
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

  // Load branches list if Admin is inspecting
  useEffect(() => {
    if (isSuperAdmin || isOrgAdmin) {
      const loadBranches = async () => {
        try {
          const params = {};
          if (selectedOrgId && selectedOrgId !== 'All') params.organizationId = selectedOrgId;
          const res = await fetchBranchesList(params);
          if (res.data && res.data.success) {
            setBranches(res.data.data);
          }
        } catch (err) {
          console.warn('Error loading branches list:', err.message);
        }
      };
      loadBranches();
    }
  }, [selectedOrgId, isSuperAdmin, isOrgAdmin]);

  // Load Dashboard Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
        params.organizationId = selectedOrgId;
      }
      if (selectedBranchId) {
        params.branchId = selectedBranchId;
      }

      const res = await fetchBranchDashboard(params);
      if (res.data && res.data.success) {
        setDashboard(res.data.data);
        if (res.data.recentActivities) {
          setRecentActivities(res.data.recentActivities);
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to load branch operations telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const newParams = {};
    if (selectedOrgId && selectedOrgId !== 'All') newParams.organizationId = selectedOrgId;
    if (selectedBranchId) newParams.branchId = selectedBranchId;
    setSearchParams(newParams);
  }, [selectedOrgId, selectedBranchId]);

  if (loading && !dashboard) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 max-w-7xl mx-auto my-12 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
        <p className="text-xs font-bold text-slate-700">Loading branch operations telemetry...</p>
      </div>
    );
  }

  const d = dashboard || {
    branchName: user?.branchName || 'Main Branch Office',
    branchCode: 'BR-01',
    organizationName: user?.organizationName || 'Sahakara Cooperative Society',
    managerName: user?.name || 'Branch Manager',
    phone: '+91 98470 12345',
    email: user?.email || 'branch@sahakara.org',
    address: 'Main Town Square',
    totalMembers: 0,
    totalEmployees: 0,
    totalGroups: 0,
    activeLoansCount: 0,
    activeLoansAmount: '₹ 0',
    monthlySavingsManaged: '₹ 0',
    pendingLoansCount: 0,
    pendingMembersKYC: 0,
    totalPendingApprovals: 0,
    groups: [],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Super Admin / Org Admin Branch Switcher Toolbar */}
      {(isSuperAdmin || isOrgAdmin) && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Inspect Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="">-- All Organization Branches --</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode || 'BR'})</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* 1. Branch Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider font-mono">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Branch Command • {d.branchCode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{d.branchName}</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Society: <strong className="text-slate-700">{d.organizationName}</strong> • Branch In-Charge: <strong className="text-teal-800">{d.managerName}</strong>
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/members/register"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll Member</span>
            </Link>

            <Link
              to="/loans/applications"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold transition-all flex items-center gap-2 border border-teal-200 shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>New Loan Application</span>
            </Link>

            <button
              type="button"
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Branch Members */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-3 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Members</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{d.totalMembers}</div>
          <div className="text-[11px] text-teal-700 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active registered shareholders</span>
          </div>
        </div>

        {/* Card 2: Branch Staff & Tellers */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-3 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Staff</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{d.totalEmployees}</div>
          <div className="text-[11px] text-slate-500 font-medium">Tellers, clerks & field agents</div>
        </div>

        {/* Card 3: SHG Groups */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-3 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SHG / JLG Groups</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{d.totalGroups}</div>
          <div className="text-[11px] text-teal-700 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active community micro-groups</span>
          </div>
        </div>

        {/* Card 4: Active Loan Accounts */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-3 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Loans</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{d.activeLoansCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Sanctioned credit accounts</div>
        </div>

      </div>

      {/* 3. Financial Aggregates & Approvals Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Savings Mobilized */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Savings Mobilized</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800">{d.monthlySavingsManaged}</div>
          <p className="text-[11px] text-slate-500 font-medium">Thrift deposits, daily pigmy & FD accounts</p>
        </div>

        {/* Active Loan Balance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Loan Balance</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800">{d.activeLoansAmount}</div>
          <p className="text-[11px] text-slate-500 font-medium">Outstanding principal portfolio</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Branch Approvals</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800">
              {d.totalPendingApprovals} Pending
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {d.pendingLoansCount} Loan Applications • {d.pendingMembersKYC} Member KYC Verifications
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/members/approvals"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
            >
              <span>Review KYC & Loans</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 4. Branch Governance & Resource Control Desks (6 Interactive Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Branch Operational Resource Desks</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Quick access controls for managing branch personnel, member approvals, credit portfolios, and statutory reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Desk 1: Branch Staff */}
          <Link
            to="/branches/employees"
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Branch Staff & Tellers
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Oversee branch counter tellers, clerks, and field agents stationed at this branch.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-teal-700">
              <span>View Staff Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Desk 2: Members Directory & KYC */}
          <Link
            to="/members/dashboard"
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Member Directory & KYC
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Search branch shareholders, review KYC documents, and approve new member enrollments.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-teal-700">
              <span>Manage Members</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Desk 3: Loans & Credit Sanctions */}
          <Link
            to="/loans/dashboard"
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Loans & Sanctions Desk
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Review loan requests, inspect collaterals, and track monthly EMI repayment velocity.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-teal-700">
              <span>Loan Applications</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Desk 4: Savings Accounts */}
          <Link
            to="/savings/dashboard"
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Savings & Passbook Ledger
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Daily thrift deposits, recurring schemes, fixed deposit interest, and passbook stamping.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-teal-700">
              <span>Savings Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Desk 5: SHG Groups */}
          <Link
            to="/groups/dashboard"
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                SHG / JLG Community Groups
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Manage self-help groups, appoint presidents and treasurers, and track group thrift meetings.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-teal-700">
              <span>View Groups</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Desk 6: Branch Reports */}
          <Link
            to="/branches/reports"
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Branch Reports & Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Export branch daybook sheets, shareholder listings, loan schedules, and statutory audit files.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-bold text-teal-700">
              <span>Generate Reports</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* 5. Split Bottom Section: Active SHG Groups & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Active SHG Groups in Branch */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>SHG Groups in this Branch</span>
            </h3>
            <Link
              to="/groups/dashboard"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              View All Groups →
            </Link>
          </div>

          <div className="space-y-3">
            {d.groups && d.groups.length > 0 ? (
              d.groups.map((grp) => (
                <div 
                  key={grp._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{grp.groupName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Leader: {grp.presidentId?.fullName || grp.presidentId?.name || 'Assigned Executive'}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold font-mono shrink-0">
                    {grp.meetingFrequency || 'Weekly'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No active SHG groups registered in this branch yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Branch Activity Log Feed */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Recent Activity & Audit Trail</span>
            </h3>
            <Link
              to="/branches/reports"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Audit Desk →
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((log) => (
                <div key={log._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[9px] font-bold uppercase font-mono">
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">{log.performerName}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent branch audit logs found.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default BranchDashboardPage;
