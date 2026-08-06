import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLoans } from '../../services/api';
import { Search, Activity, Eye, AlertCircle } from 'lucide-react';

const ActiveLoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadLoans = async () => {
    setIsLoading(true);
    try {
      const response = await fetchLoans({ page, limit: 15, status: 'Active' });
      if (response.data.success) {
        setLoans(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load active loans', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [page]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            Active Loans Portfolio
          </h1>
          <p className="text-slate-400 mt-1">Monitor currently active loans and outstanding balances.</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Loan ID or Member Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="text-sm text-slate-400">
        Showing <span className="font-bold text-white">{filteredLoans.length}</span> of <span className="font-bold text-white">{totalRecords}</span> active loans
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Loan ID</th>
                <th className="px-6 py-4">Borrower</th>
                <th className="px-6 py-4">Loan Type & Terms</th>
                <th className="px-6 py-4">Disbursed</th>
                <th className="px-6 py-4">Outstanding</th>
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
                    <p>No active loans found.</p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-emerald-400">{loan.applicationId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{loan.memberId?.fullName}</div>
                      <div className="text-xs text-slate-400">{loan.memberId?.memberId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-medium">{loan.loanTypeId?.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{loan.tenure}M @ {loan.interestRate}%</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(loan.disbursedAmount)}
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-400">
                      {formatCurrency(loan.outstandingAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/loans/details/${loan._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"
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
        
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-900/30">
            <span className="text-sm text-slate-400">
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveLoansPage;
