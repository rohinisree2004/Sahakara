import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchSavingsTransactions } from '../../services/api';
import { Search, Filter, Activity, Plus, ArrowUpCircle, AlertCircle, Download } from 'lucide-react';

const SavingsTransactionsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const accountIdParam = queryParams.get('savingsAccountId') || '';

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [accountId, setAccountId] = useState(accountIdParam);
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (accountId) params.savingsAccountId = accountId;
      if (typeFilter) params.transactionType = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await fetchSavingsTransactions(params);
      if (response.data.success) {
        setTransactions(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load transactions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter, startDate, endDate, accountId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const clearFilters = () => {
    setAccountId('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            Transaction History
          </h1>
          <p className="text-slate-400 mt-1">View all savings deposits, withdrawals, and adjustments.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-semibold border border-slate-700 transition-colors"
          onClick={() => window.print()}
        >
          <Download className="w-5 h-5" />
          Export Statement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transaction Type</label>
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select 
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="">All Types</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Interest">Interest</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="md:col-span-1 flex items-center h-[38px]">
             <button 
                onClick={clearFilters}
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
             >
               Clear Filters
             </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-slate-400">
        Showing <span className="font-bold text-white">{transactions.length}</span> of <span className="font-bold text-white">{totalRecords}</span> transactions
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Transaction ID / Date</th>
                <th className="px-6 py-4">Member & Account</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Balance After</th>
                <th className="px-6 py-4">Method / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    <p className="text-slate-400 mt-2">Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <AlertCircle className="w-12 h-12 mb-3 text-slate-600" />
                      <p className="text-base font-medium text-slate-400">No transactions found</p>
                      <p className="text-xs">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-emerald-400 font-medium mb-1">{txn.transactionId}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        {formatDate(txn.transactionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{txn.memberId?.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {txn.savingsAccountId?.accountNumber} ({txn.savingsAccountId?.accountType})
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {txn.transactionType === 'Deposit' ? (
                           <Plus className="w-4 h-4 text-emerald-400" />
                        ) : (
                           <Activity className="w-4 h-4 text-amber-400" />
                        )}
                        <span className={`font-semibold ${txn.transactionType === 'Deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {txn.transactionType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-base ${txn.transactionType === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {txn.transactionType === 'Deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {formatCurrency(txn.balanceAfterTransaction)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-300">{txn.paymentMethod}</div>
                      {txn.referenceNumber && (
                         <div className="text-xs text-slate-500 font-mono mt-0.5">Ref: {txn.referenceNumber}</div>
                      )}
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
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default SavingsTransactionsPage;
