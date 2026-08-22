import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchSavingsAccounts } from '../../services/api';
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  Wallet, 
  AlertCircle,
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  GitBranch,
  Users
} from 'lucide-react';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const SavingsAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterParams, setFilterParams] = useState({});
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadAccounts = useCallback(async (customFilterParams = filterParams) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (customFilterParams.organizationId && customFilterParams.organizationId !== 'All') params.organizationId = customFilterParams.organizationId;
      if (customFilterParams.branchId && customFilterParams.branchId !== 'All') params.branchId = customFilterParams.branchId;
      if (customFilterParams.groupId && customFilterParams.groupId !== 'All') params.groupId = customFilterParams.groupId;
      if (customFilterParams.memberId && customFilterParams.memberId !== 'All') params.memberId = customFilterParams.memberId;
      if (searchTerm) params.search = searchTerm;

      const response = await fetchSavingsAccounts(params);
      if (response.data && response.data.success) {
        setAccounts(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalRecords(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load accounts', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchTerm, filterParams]);

  useEffect(() => {
    loadAccounts(filterParams);
  }, [loadAccounts, page, statusFilter, filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
    setPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link 
            to="/savings/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Savings Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Member Savings Accounts
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Manage member savings folios, passbook issuances, and account statuses
              </p>
            </div>
          </div>
        </div>

        <Link 
          to="/savings/accounts/create"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Open Savings Account</span>
        </Link>
      </div>

      {/* Governance & Cascading Filter Desk */}
      <HierarchicalFilterBar onFilterChange={handleFilterChange} />

      {/* Search & Status Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Search by Account Number or Member Name..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-4 h-4 text-teal-600 shrink-0" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Account Statuses</option>
              <option value="Active">Active Accounts</option>
              <option value="Dormant">Dormant Accounts</option>
              <option value="Frozen">Frozen Accounts</option>
              <option value="Closed">Closed Accounts</option>
            </select>
          </div>

          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-2 rounded-xl border border-teal-200 whitespace-nowrap">
            {totalRecords} Total Accounts
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Wallet className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No savings accounts found matching current scope.</p>
            <p className="text-xs text-slate-500">Adjust the filter parameters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Account Number</th>
                  <th className="py-4 px-6">Member Info</th>
                  <th className="py-4 px-6">Account Scheme</th>
                  <th className="py-4 px-6">Society & Branch</th>
                  <th className="py-4 px-6 text-right">Current Balance</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Passbook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-teal-800">
                      {acc.accountNumber}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{acc.memberId?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {acc.memberId?.memberId || 'N/A'} {acc.memberId?.phone ? `• ${acc.memberId.phone}` : ''}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">{acc.accountType || 'Regular Savings'}</span>
                      {acc.interestRate ? (
                        <div className="text-[10px] text-teal-800 font-semibold">{acc.interestRate}% Interest p.a.</div>
                      ) : null}
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-bold">{acc.organizationId?.name || 'Cooperative Society'}</div>
                      <div className="text-[10px] text-slate-500">{acc.branchId?.branchName || 'Main Branch'}</div>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(acc.currentBalance)}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        acc.status === 'Active'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : acc.status === 'Dormant'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
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

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} accounts)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default SavingsAccountsPage;
