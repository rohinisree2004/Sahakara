import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSavingsAccounts } from '../../services/api';
import { Search, Filter, Eye, Plus, Wallet, AlertCircle } from 'lucide-react';

const SavingsAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      // Depending on the backend we might want a search param, but for now we filter locally if backend doesn't support it, 
      // or we can pass memberId if we know it. Assuming backend returns paginated results.
      const response = await fetchSavingsAccounts(params);
      if (response.data.success) {
        setAccounts(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load accounts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [page, statusFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  // Local filtering for search (if backend search not implemented by text)
  const filteredAccounts = accounts.filter(acc => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      acc.accountNumber.toLowerCase().includes(lowerSearch) ||
      (acc.memberId && acc.memberId.fullName && acc.memberId.fullName.toLowerCase().includes(lowerSearch)) ||
      (acc.memberId && acc.memberId.memberId && acc.memberId.memberId.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Savings Accounts
          </h1>
          <p className="text-slate-400 mt-1">Manage and view all member savings accounts.</p>
        </div>
        <Link 
          to="/savings/accounts/create"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create Account
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Account Number or Member Name..." 
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
            <option value="Active">Active</option>
            <option value="Dormant">Dormant</option>
            <option value="Closed">Closed</option>
            <option value="Frozen">Frozen</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Account No.</th>
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Account Type</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    <p className="text-slate-400 mt-2">Loading accounts...</p>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <AlertCircle className="w-12 h-12 mb-3 text-slate-600" />
                      <p className="text-base font-medium text-slate-400">No savings accounts found</p>
                      <p className="text-xs">Adjust your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-emerald-400 font-medium">
                      {account.accountNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {account.memberId?.profileImage ? (
                          <img src={account.memberId.profileImage} alt={account.memberId.fullName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                            {account.memberId?.fullName?.charAt(0) || 'M'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{account.memberId?.fullName || 'Unknown'}</div>
                          <div className="text-xs text-slate-400 font-mono">{account.memberId?.memberId || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {account.accountType}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(account.currentBalance)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        account.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        account.status === 'Closed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/savings/accounts/${account._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="View Profile"
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

export default SavingsAccountsPage;
