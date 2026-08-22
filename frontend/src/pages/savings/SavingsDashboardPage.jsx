import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchSavingsDashboardStats, fetchSavingsAccounts } from '../../services/api';
import { 
  Wallet, 
  Users, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Banknote, 
  Activity, 
  Settings, 
  Plus, 
  BookOpen, 
  Clock, 
  FileText,
  Loader2,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Building2,
  GitBranch,
  ArrowRight,
  Eye
} from 'lucide-react';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const SavingsDashboardPage = () => {
  const [stats, setStats] = useState({
    totalSavings: 0,
    activeAccounts: 0,
    totalAccounts: 0,
    todaysCollection: 0,
    monthlyCollection: 0
  });
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterParams, setFilterParams] = useState({});

  const loadStats = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const cleanParams = {};
      if (params.organizationId && params.organizationId !== 'All') cleanParams.organizationId = params.organizationId;
      if (params.branchId && params.branchId !== 'All') cleanParams.branchId = params.branchId;
      if (params.groupId && params.groupId !== 'All') cleanParams.groupId = params.groupId;
      if (params.memberId && params.memberId !== 'All') cleanParams.memberId = params.memberId;

      const [statsRes, accountsRes] = await Promise.all([
        fetchSavingsDashboardStats(cleanParams),
        fetchSavingsAccounts({ ...cleanParams, limit: 6 })
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (accountsRes.data?.success) {
        setRecentAccounts(accountsRes.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.warn('Savings dashboard loading notice:', err.message);
      setError(err.message || 'Unable to load savings data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats(filterParams);
  }, [loadStats, filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const quickActions = [
    { label: 'Record Deposit', path: '/savings/deposit', icon: Plus, color: 'text-teal-800', bg: 'bg-teal-50 border-teal-200' },
    { label: 'Savings Accounts', path: '/savings/accounts', icon: Users, color: 'text-cyan-800', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Member Passbooks', path: '/savings/accounts', icon: BookOpen, color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Transactions Ledger', path: '/savings/transactions', icon: Activity, color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold shadow-xs">
            <Wallet className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Savings & Thrift Corpus Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Member recurring deposits, weekly SHG thrift pools, and passbook operations
            </p>
          </div>
        </div>

        <Link 
          to="/savings/deposit"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Deposit</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-teal-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-teal-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5 text-teal-700" />
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              Total Corpus
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Savings Balance</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalSavings)}</p>
          <p className="text-[11px] text-teal-800 font-semibold mt-1">Cumulative thrift balance in scope</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cyan-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-cyan-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              <ArrowUpCircle className="w-5 h-5 text-cyan-700" />
            </div>
            <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
              Today
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Today's Collection</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.todaysCollection)}</p>
          <p className="text-[11px] text-cyan-800 font-semibold mt-1">Cash & digital collections today</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              This Month
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Inflow</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.monthlyCollection)}</p>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">Total monthly deposits accumulated</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              Accounts
            </span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Savings Accounts</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {stats.activeAccounts} <span className="text-xs font-bold text-slate-400">/ {stats.totalAccounts}</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Active thrift accounts enrolled</p>
        </div>

      </div>

      {/* Recent Accounts Directory */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Recent Savings Accounts in Selected Scope
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Overview of member savings passbooks and current balances
            </p>
          </div>

          <Link
            to="/savings/accounts"
            className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
          >
            <span>View All Accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : recentAccounts.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Wallet className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No savings accounts found for this scope.</p>
            <p className="text-xs text-slate-500">Adjust the filter parameters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Account Number</th>
                  <th className="py-4 px-6">Member Name</th>
                  <th className="py-4 px-6">Account Scheme</th>
                  <th className="py-4 px-6">Society & Branch</th>
                  <th className="py-4 px-6 text-right">Current Balance</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Passbook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentAccounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-teal-800">
                      {acc.accountNumber}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{acc.memberId?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {acc.memberId?.memberId || 'N/A'}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">{acc.accountType || 'Regular Savings'}</span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-bold">{acc.organizationId?.name || 'Cooperative Society'}</div>
                      <div className="text-[10px] text-slate-500">{acc.branchId?.branchName || 'Main Branch'}</div>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-800 text-sm">
                      ₹ {(acc.currentBalance || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {acc.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/savings/passbook/${acc._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Passbook</span>
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

export default SavingsDashboardPage;
