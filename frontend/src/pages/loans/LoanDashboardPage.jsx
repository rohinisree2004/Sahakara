import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Banknote, 
  Users, 
  Activity, 
  FileText, 
  CheckCircle, 
  Clock, 
  Plus, 
  Layers, 
  Search, 
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  GitBranch,
  XCircle,
  Eye,
  Loader2
} from 'lucide-react';
import { fetchLoanDashboardStats, fetchLoans } from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const LoanDashboardPage = () => {
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingApps: 0,
    activeLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    financialStats: {
      totalApprovedAmount: 0,
      totalDisbursedAmount: 0,
      totalOutstandingAmount: 0,
      totalPrincipalAmount: 0
    }
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterParams, setFilterParams] = useState({});

  const loadDashboard = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const cleanParams = {};
      if (params.organizationId && params.organizationId !== 'All') cleanParams.organizationId = params.organizationId;
      if (params.branchId && params.branchId !== 'All') cleanParams.branchId = params.branchId;
      if (params.groupId && params.groupId !== 'All') cleanParams.groupId = params.groupId;
      if (params.memberId && params.memberId !== 'All') cleanParams.memberId = params.memberId;

      const [statsRes, loansRes] = await Promise.all([
        fetchLoanDashboardStats(cleanParams),
        fetchLoans({ ...cleanParams, limit: 8 })
      ]);
      
      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (loansRes.data && loansRes.data.success) {
        setRecentLoans(loansRes.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.warn('Loan dashboard loading notice:', err.message);
      setError(err.message || 'Unable to load loan dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(filterParams);
  }, [loadDashboard, filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const quickActions = [
    { label: 'Apply for Loan', path: '/loans/apply', icon: Plus, color: 'text-teal-800', bg: 'bg-teal-50 border-teal-200' },
    { label: 'Pending Applications', path: '/loans/applications?status=Pending', icon: Clock, color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Active Loan Portfolio', path: '/loans/active', icon: Activity, color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Loan Schemes & Types', path: '/loans/types', icon: Layers, color: 'text-cyan-800', bg: 'bg-cyan-50 border-cyan-200' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold shadow-xs">
            <Banknote className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Loan Portfolio & Credit Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Micro-credit disbursements, JLG group financing, and credit risk governance
            </p>
          </div>
        </div>

        <Link 
          to="/loans/apply"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Loan Application</span>
        </Link>
      </div>

      {/* Governance & Cascading Filter Desk */}
      <HierarchicalFilterBar onFilterChange={handleFilterChange} />

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <Link
            key={idx}
            to={action.path}
            className={`p-4 rounded-2xl border ${action.bg} flex items-center gap-3 hover:shadow-xs transition-all`}
          >
            <action.icon className={`w-5 h-5 ${action.color} shrink-0`} />
            <span className={`text-xs font-bold ${action.color}`}>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-teal-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-teal-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5 text-teal-700" />
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              Sanctioned
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Approved Portfolio</h3>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {formatCurrency(stats.financialStats?.totalApprovedAmount)}
          </p>
          <p className="text-[11px] text-teal-800 font-semibold mt-1">Total approved credit across selected scope</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cyan-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-cyan-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5 text-cyan-700" />
            </div>
            <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
              Disbursed
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Disbursed Capital</h3>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {formatCurrency(stats.financialStats?.totalDisbursedAmount)}
          </p>
          <p className="text-[11px] text-cyan-800 font-semibold mt-1">Directly credited to member savings accounts</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Outstanding
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Outstanding Balance</h3>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {formatCurrency(stats.financialStats?.totalOutstandingAmount)}
          </p>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">Principal & interest balance in repayment cycle</p>
        </div>

      </div>

      {/* Operational Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Applications</div>
          <div className="text-2xl font-black text-slate-900">{stats.totalLoans}</div>
          <div className="text-[11px] text-slate-500">Cumulative applications</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1 bg-amber-50/20">
          <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-black text-amber-800">{stats.pendingApps}</div>
          <div className="text-[11px] text-amber-700">Awaiting branch manager verification</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-xs space-y-1 bg-teal-50/20">
          <div className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">Active Loans</div>
          <div className="text-2xl font-black text-teal-800">{stats.activeLoans}</div>
          <div className="text-[11px] text-teal-700">Under regular EMI recovery</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/20">
          <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Approved Loans</div>
          <div className="text-2xl font-black text-emerald-800">{stats.approvedLoans || stats.totalLoans - stats.pendingApps}</div>
          <div className="text-[11px] text-emerald-700">Ready for disbursement</div>
        </div>

      </div>

      {/* Recent Loans Application Registry */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Recent Loan Portfolio & Applications
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Live ledger of loan applications filtered by your selected scope
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/loans/applications"
              className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
            >
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : recentLoans.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Banknote className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No loan records found for this scope.</p>
            <p className="text-xs text-slate-500">Try adjusting the filter options above or create a new loan application.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Application ID</th>
                  <th className="py-4 px-6">Member Name</th>
                  <th className="py-4 px-6">Loan Scheme</th>
                  <th className="py-4 px-6">Society & Branch</th>
                  <th className="py-4 px-6 text-right">Principal</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-teal-800">
                      {loan.applicationId}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{loan.memberId?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {loan.memberId?.memberId || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">{loan.loanTypeId?.name || 'Standard Micro Loan'}</span>
                      <div className="text-[10px] text-teal-800 font-semibold">{loan.interestRate || loan.loanTypeId?.interestRate || 12}% p.a.</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-bold">{loan.organizationId?.name || 'Cooperative Society'}</div>
                      <div className="text-[10px] text-slate-500">{loan.branchId?.branchName || 'Main Branch'}</div>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      ₹ {(loan.principalAmount || loan.requestedAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        loan.status === 'Active' || loan.status === 'Disbursed'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : loan.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : loan.status === 'Pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {loan.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/loans/details/${loan._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 text-xs font-bold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default LoanDashboardPage;
