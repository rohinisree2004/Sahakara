import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchLoans } from '../../services/api';
import { Search, Filter, Eye, AlertCircle, Banknote, Clock } from 'lucide-react';

const LoanApplicationListPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusParam = queryParams.get('status') || '';

  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadLoans = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const response = await fetchLoans(params);
      if (response.data.success) {
        setLoans(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load loans', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [page, statusFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    if (status === 'Active' || status === 'Disbursed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'Approved' || status === 'Recommended') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (status === 'Rejected') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (status === 'Closed') return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'; // Pending, Under Review
  };

  // Local filtering for search
  const filteredLoans = loans.filter(loan => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      loan.applicationId.toLowerCase().includes(lowerSearch) ||
      (loan.memberId && loan.memberId.fullName && loan.memberId.fullName.toLowerCase().includes(lowerSearch)) ||
      (loan.memberId && loan.memberId.memberId && loan.memberId.memberId.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-emerald-400" />
            Loan Applications
          </h1>
          <p className="text-slate-400 mt-1">Review and manage pending and past loan applications.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Application ID or Member Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Recommended">Recommended</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-slate-400">
        Showing <span className="font-bold text-white">{filteredLoans.length}</span> of <span className="font-bold text-white">{totalRecords}</span> loans
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">App ID & Date</th>
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Loan Type</th>
                <th className="px-6 py-4">Requested Amt</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="w-12 h-12 mb-3 text-slate-600 mx-auto" />
                    <p>No loan applications found.</p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-emerald-400 font-medium mb-1">{loan.applicationId}</div>
                      <div className="text-xs text-slate-400">{new Date(loan.applicationDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{loan.memberId?.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{loan.memberId?.memberId} • {loan.branchId?.branchName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-medium">{loan.loanTypeId?.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{loan.tenure} Months @ {loan.interestRate}%</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(loan.requestedAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/loans/details/${loan._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="View Application"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-900/30">
            <span className="text-sm text-slate-400">
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApplicationListPage;
