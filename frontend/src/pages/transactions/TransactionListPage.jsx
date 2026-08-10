import React, { useState, useEffect } from 'react';
import { fetchTransactions } from '../../services/api';
import { ArrowRightLeft, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransactionListPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [sourceModule, setSourceModule] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sourceModule,
        transactionType,
        status,
        startDate,
        endDate
      };
      const res = await fetchTransactions(params);
      setTransactions(res.data);
      setPagination(prev => ({ ...prev, totalPages: res.totalPages }));
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, sourceModule, transactionType, status, startDate, endDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sourceModule') setSourceModule(value);
    if (name === 'transactionType') setTransactionType(value);
    if (name === 'status') setStatus(value);
    if (name === 'startDate') setStartDate(value);
    if (name === 'endDate') setEndDate(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-emerald-400" />
            All Transactions
          </h1>
          <p className="text-slate-400 text-sm mt-1">View and filter across all financial modules</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-400 mb-1">Module</label>
          <select
            name="sourceModule"
            value={sourceModule}
            onChange={handleFilterChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Modules</option>
            <option value="SavingsDeposit">Savings Deposit</option>
            <option value="SavingsWithdrawal">Savings Withdrawal</option>
            <option value="LoanDisbursement">Loan Disbursement</option>
            <option value="Repayment">Loan Repayment</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-400 mb-1">Type</label>
          <select
            name="transactionType"
            value={transactionType}
            onChange={handleFilterChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="Inflow">Inflow (+)</option>
            <option value="Outflow">Outflow (-)</option>
            <option value="Adjustment">Adjustment</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-400 mb-1">Status</label>
          <select
            name="status"
            value={status}
            onChange={handleFilterChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Reversed">Reversed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-400 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleFilterChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-slate-400 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleFilterChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {error && <div className="p-4 text-red-400 bg-red-400/10 border-b border-red-500/20">{error}</div>}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr className="text-slate-400 text-sm border-b border-slate-700">
                <th className="px-6 py-4 font-medium">Txn ID & Date</th>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Module / Type</th>
                <th className="px-6 py-4 font-medium">Payment Method</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No transactions found for these filters.</td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-emerald-400 font-mono text-xs">{txn.transactionId}</div>
                      <div className="text-slate-400 text-xs mt-1">{new Date(txn.transactionDate).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {txn.memberId ? (
                        <div>
                          <div className="text-slate-200">{txn.memberId.firstName} {txn.memberId.lastName}</div>
                          <div className="text-slate-500 text-xs">{txn.memberId.memberId}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">System / Org</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{txn.sourceModule}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] ${
                        txn.transactionType === 'Inflow' ? 'bg-emerald-500/10 text-emerald-400' :
                        txn.transactionType === 'Outflow' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {txn.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{txn.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        txn.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        txn.status === 'Reversed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${txn.transactionType === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'} ${txn.status === 'Reversed' && 'line-through opacity-50'}`}>
                      {txn.transactionType === 'Inflow' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/transactions/${txn._id}`} className="text-emerald-500 hover:text-emerald-400 text-xs font-medium border border-emerald-500/30 px-3 py-1.5 rounded bg-emerald-500/10">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center text-sm">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-slate-400">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionListPage;
