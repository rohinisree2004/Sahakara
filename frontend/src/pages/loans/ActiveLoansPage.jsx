import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchLoans } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Activity, 
  Eye, 
  AlertCircle, 
  ArrowLeft, 
  Banknote, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  TrendingUp,
  Building2,
  GitBranch,
  Users,
  ShieldCheck
} from 'lucide-react';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const ActiveLoansPage = () => {
  const { user, activeGroup } = useAuth();
  const activeRole = activeGroup?.role || user?.role || 'Member';
  const isPlatformStaff = ['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee'].includes(activeRole);
  const isExecutive = ['President', 'Treasurer', 'Secretary'].includes(activeRole);

  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParams, setFilterParams] = useState({});

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const getBackRoute = () => {
    if (activeRole === 'President') return '/executive/dashboard';
    if (activeRole === 'Treasurer') return '/treasurer/dashboard';
    if (activeRole === 'Secretary') return '/secretary/dashboard';
    if (activeRole === 'Member') return '/member/dashboard';
    return '/loans/dashboard';
  };

  const loadLoans = useCallback(async (customFilterParams = filterParams) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15, status: 'Active' };

      if (!isPlatformStaff && activeGroup?._id) {
        params.groupId = activeGroup._id;
      } else if (customFilterParams.groupId && customFilterParams.groupId !== 'All') {
        params.groupId = customFilterParams.groupId;
      }

      if (activeRole === 'Member') {
        params.myOnly = 'true';
      }

      if (customFilterParams.organizationId && customFilterParams.organizationId !== 'All') params.organizationId = customFilterParams.organizationId;
      if (customFilterParams.branchId && customFilterParams.branchId !== 'All') params.branchId = customFilterParams.branchId;
      if (customFilterParams.memberId && customFilterParams.memberId !== 'All') params.memberId = customFilterParams.memberId;
      if (searchTerm) params.search = searchTerm;

      const response = await fetchLoans(params);
      if (response.data && response.data.success) {
        setLoans(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalRecords(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load active loans', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, filterParams, isPlatformStaff, activeGroup, activeRole]);

  useEffect(() => {
    loadLoans(filterParams);
  }, [loadLoans, page, filterParams]);

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
            to={getBackRoute()} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isExecutive ? 'Group Active Loans Portfolio' : 'Active Loans Portfolio'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {isExecutive 
                  ? `Live monitoring of active loans and repayment progress in ${activeGroup?.groupName || 'your group'}`
                  : 'Live monitoring of running credit facilities, repayments, and outstanding balances'
                }
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200">
          {totalRecords} Active Accounts
        </span>
      </div>

      {/* Governance & Cascading Filter Desk (Staff Only) */}
      {isPlatformStaff ? (
        <HierarchicalFilterBar onFilterChange={handleFilterChange} />
      ) : activeGroup ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Active Group Folio:</span>
                <span className="text-teal-900 font-extrabold">{activeGroup.groupName}</span>
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {activeGroup.groupCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Displaying active loan accounts for members of this group
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeRole} Scope</span>
            </span>
          </div>
        </div>
      ) : null}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="w-full max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Search by Loan Application ID, Member Name, or ID..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : loans.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Activity className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No active loans found matching current scope.</p>
            <p className="text-xs text-slate-500">Try adjusting the filter options above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Loan ID</th>
                  <th className="py-4 px-6">Borrower Member</th>
                  <th className="py-4 px-6">Loan Scheme & Terms</th>
                  <th className="py-4 px-6">Society & Branch</th>
                  <th className="py-4 px-6 text-right">Disbursed Amount</th>
                  <th className="py-4 px-6 text-right">Outstanding Balance</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-teal-800">
                      {loan.applicationId}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{loan.memberId?.fullName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {loan.memberId?.memberId || 'N/A'} {loan.memberId?.phone ? `• ${loan.memberId.phone}` : ''}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{loan.loanTypeId?.name || 'Micro Credit'}</div>
                      <div className="text-[10px] text-teal-800 font-semibold">
                        {loan.tenureMonths || loan.tenure || 12} Mo @ {loan.interestRate || loan.loanTypeId?.interestRate || 12}% p.a.
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-bold">{loan.organizationId?.name || 'Cooperative Society'}</div>
                      <div className="text-[10px] text-slate-500">{loan.branchId?.branchName || 'Main Branch'}</div>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(loan.disbursedAmount || loan.principalAmount)}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(loan.outstandingAmount !== undefined ? loan.outstandingAmount : loan.principalAmount)}
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

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} active loans)
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

export default ActiveLoansPage;
