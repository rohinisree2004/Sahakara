import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  fetchSavingsTransactions, 
  approveSavingsRequestApi, 
  rejectSavingsRequestApi, 
  rollbackSavingsTransactionApi 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Activity, 
  Download,
  ArrowLeft, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Building2,
  GitBranch,
  Wallet,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const SavingsTransactionsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const accountIdParam = queryParams.get('savingsAccountId') || '';
  const statusParam = queryParams.get('status') || '';

  const { user, activeGroup } = useAuth();
  const activeRole = activeGroup?.role || user?.role || 'Member';
  const isPlatformStaff = ['Super Admin', 'Organization Admin', 'Branch Manager', 'Employee'].includes(activeRole);
  const isExecutive = ['President', 'Treasurer', 'Secretary'].includes(activeRole);
  const canManageTransactions = ['Treasurer', 'President', 'Super Admin', 'Organization Admin', 'Branch Manager'].includes(activeRole);

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Filters
  const [accountId, setAccountId] = useState(accountIdParam);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParams, setFilterParams] = useState({});
  
  // Modals / Action Prompts
  const [rejectModal, setRejectModal] = useState({ isOpen: false, txn: null, reason: '' });
  const [rollbackModal, setRollbackModal] = useState({ isOpen: false, txn: null, reason: '' });
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const getBackRoute = () => {
    if (activeRole === 'Treasurer') return '/treasurer/dashboard';
    if (activeRole === 'President') return '/executive/dashboard';
    if (activeRole === 'Secretary') return '/secretary/dashboard';
    if (activeRole === 'Member') return '/member/dashboard';
    return '/savings/dashboard';
  };

  const loadTransactions = useCallback(async (customFilterParams = filterParams) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (accountId && accountId !== 'All') params.savingsAccountId = accountId;
      if (typeFilter && typeFilter !== 'All') params.transactionType = typeFilter;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;

      if (!isPlatformStaff && activeGroup?._id) {
        params.groupId = activeGroup._id;
      } else if (customFilterParams.groupId && customFilterParams.groupId !== 'All') {
        params.groupId = customFilterParams.groupId;
      }

      if (customFilterParams.organizationId && customFilterParams.organizationId !== 'All') params.organizationId = customFilterParams.organizationId;
      if (customFilterParams.branchId && customFilterParams.branchId !== 'All') params.branchId = customFilterParams.branchId;
      if (customFilterParams.memberId && customFilterParams.memberId !== 'All') params.memberId = customFilterParams.memberId;

      const response = await fetchSavingsTransactions(params);
      if (response.data && response.data.success) {
        setTransactions(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalRecords(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load transactions', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, statusFilter, startDate, endDate, accountId, searchTerm, filterParams, isPlatformStaff, activeGroup]);

  useEffect(() => {
    loadTransactions(filterParams);
  }, [loadTransactions, filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
    setPage(1);
  };

  const handleApprove = async (txn) => {
    if (!window.confirm(`Are you sure you want to ACCEPT and execute this ${txn.transactionType} of ₹${txn.amount.toLocaleString('en-IN')} for ${txn.memberId?.fullName}?`)) {
      return;
    }

    setActionLoadingId(txn._id);
    setActionMessage({ type: '', text: '' });
    try {
      const res = await approveSavingsRequestApi(txn._id);
      if (res.data && res.data.success) {
        setActionMessage({ 
          type: 'success', 
          text: `✓ ${txn.transactionType} request of ₹${txn.amount.toLocaleString('en-IN')} approved and settled successfully!` 
        });
        loadTransactions(filterParams);
      }
    } catch (err) {
      setActionMessage({ 
        type: 'error', 
        text: err.response?.data?.error || err.message || 'Failed to approve transaction.' 
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal.txn) return;

    setActionLoadingId(rejectModal.txn._id);
    setActionMessage({ type: '', text: '' });
    try {
      const res = await rejectSavingsRequestApi(rejectModal.txn._id, { reason: rejectModal.reason });
      if (res.data && res.data.success) {
        setActionMessage({ 
          type: 'success', 
          text: `✓ ${rejectModal.txn.transactionType} request has been denied.` 
        });
        setRejectModal({ isOpen: false, txn: null, reason: '' });
        loadTransactions(filterParams);
      }
    } catch (err) {
      setActionMessage({ 
        type: 'error', 
        text: err.response?.data?.error || err.message || 'Failed to reject transaction.' 
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRollbackSubmit = async (e) => {
    e.preventDefault();
    if (!rollbackModal.txn) return;

    setActionLoadingId(rollbackModal.txn._id);
    setActionMessage({ type: '', text: '' });
    try {
      const res = await rollbackSavingsTransactionApi(rollbackModal.txn._id, { reason: rollbackModal.reason });
      if (res.data && res.data.success) {
        setActionMessage({ 
          type: 'success', 
          text: `✓ Transaction ${rollbackModal.txn.transactionId} rolled back successfully and account balance restored.` 
        });
        setRollbackModal({ isOpen: false, txn: null, reason: '' });
        loadTransactions(filterParams);
      }
    } catch (err) {
      setActionMessage({ 
        type: 'error', 
        text: err.response?.data?.error || err.message || 'Failed to rollback transaction.' 
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
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
                {isExecutive ? 'Treasury Journal & Queue' : 'Savings Transactions Journal'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {isExecutive 
                  ? `Review pending member deposits & withdrawals, verify transactions, and manage group liquidity` 
                  : 'Audited ledger of member deposits, withdrawals, monthly thrift collections & adjustments'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManageTransactions && (
            <Link
              to="/savings/deposit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Wallet className="w-4 h-4" />
              <span>Record Deposit</span>
            </Link>
          )}

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Journal</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage.text && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage({ type: '', text: '' })} className="p-1 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Governance & Cascading Filter Desk (Staff Only) */}
      {isPlatformStaff ? (
        <HierarchicalFilterBar onFilterChange={handleFilterChange} />
      ) : activeGroup ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Active Group Treasury:</span>
                <span className="text-emerald-900 font-extrabold">{activeGroup.groupName}</span>
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {activeGroup.groupCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Displaying savings deposits, withdrawal authorizations & settlement logs for this group
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeRole} Perspective</span>
            </span>
          </div>
        </div>
      ) : null}

      {/* Search & Date Filter Desk */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Search by Txn ID, Ref, or Remarks
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="TXN ID, Ref Number, Remarks..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Transaction Status
            </label>
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            >
              <option value="">All Statuses</option>
              <option value="Pending">⏳ Pending Approval Queue</option>
              <option value="Completed">✓ Completed (Settled)</option>
              <option value="Reverted">↺ Reverted / Rolled Back</option>
              <option value="Rejected">✕ Rejected / Denied</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Transaction Type
            </label>
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            >
              <option value="">All Types</option>
              <option value="Deposit">Deposit (Credit)</option>
              <option value="Withdrawal">Withdrawal (Debit)</option>
              <option value="Interest">Interest Credit</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Activity className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No transaction records found matching scope.</p>
            <p className="text-xs text-slate-500">Adjust the filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Account & Member</th>
                  <th className="py-4 px-6">Type & Method</th>
                  <th className="py-4 px-6 text-right">Amount (₹)</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Running Balance</th>
                  {canManageTransactions && <th className="py-4 px-6 text-center">Action / Controls</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono">
                {transactions.map((txn) => {
                  const isDeposit = txn.transactionType === 'Deposit' || txn.transactionType === 'Interest';
                  const isPending = txn.status === 'Pending';
                  const isCompleted = txn.status === 'Completed';
                  const isReverted = txn.status === 'Reverted';
                  const isRejected = txn.status === 'Rejected';
                  const isProcessing = actionLoadingId === txn._id;

                  return (
                    <tr key={txn._id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-4 px-6 font-sans text-slate-600">
                        {formatDate(txn.transactionDate || txn.createdAt)}
                      </td>

                      <td className="py-4 px-6 font-bold text-teal-800">
                        <div>{txn.transactionId}</div>
                        {txn.referenceNumber && (
                          <div className="text-[10px] text-slate-400 font-normal">{txn.referenceNumber}</div>
                        )}
                        {txn.remarks && (
                          <div className="text-[10px] text-slate-500 font-sans italic truncate max-w-xs">{txn.remarks}</div>
                        )}
                      </td>

                      <td className="py-4 px-6 font-sans">
                        <div className="font-bold text-slate-900">{txn.memberId?.fullName || 'N/A'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {txn.savingsAccountId?.accountNumber || 'SAV'} ({txn.savingsAccountId?.accountType || 'Savings'})
                        </div>
                      </td>

                      <td className="py-4 px-6 font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isDeposit 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {txn.transactionType}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{txn.paymentMethod || 'Cash'}</div>
                      </td>

                      <td className={`py-4 px-6 text-right font-black ${isDeposit ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>

                      <td className="py-4 px-6 text-center font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                            : isReverted
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          {isReverted && <RotateCcw className="w-3 h-3 text-purple-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{txn.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right font-black text-slate-900">
                        {formatCurrency(txn.balanceAfterTransaction)}
                      </td>

                      {/* Action Controls for Treasurer & Authorized Staff */}
                      {canManageTransactions && (
                        <td className="py-4 px-6 text-center font-sans">
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-teal-600 mx-auto" />
                          ) : isPending ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleApprove(txn)}
                                title="Accept and Disburse / Deposit"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => setRejectModal({ isOpen: true, txn, reason: '' })}
                                title="Deny Request"
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1 transition-all"
                              >
                                <X className="w-3 h-3" />
                                <span>Deny</span>
                              </button>
                            </div>
                          ) : isCompleted ? (
                            <button
                              onClick={() => setRollbackModal({ isOpen: true, txn, reason: '' })}
                              title="Rollback / Revert Transaction"
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[10px] inline-flex items-center gap-1 transition-all"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-700" />
                              <span>Rollback</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No action</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between font-sans">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} records)
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

      {/* Reject / Deny Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Deny {rejectModal.txn?.transactionType} Request
                </h3>
                <p className="text-xs text-slate-500">
                  Amount: ₹{rejectModal.txn?.amount?.toLocaleString('en-IN')} for {rejectModal.txn?.memberId?.fullName}
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rejection / Denial *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Ineligible request, incorrect amount, or pending physical verification..."
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, txn: null, reason: '' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId !== null}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {actionLoadingId !== null && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Denial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rollback / Revert Confirmation Modal */}
      {rollbackModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Rollback / Revert Transaction
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {rollbackModal.txn?.transactionId} • ₹{rollbackModal.txn?.amount?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-950 font-medium space-y-1">
              <p>⚠️ <strong>Warning:</strong> Rolling back this transaction will:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                <li>Reverse the balance on account <strong>{rollbackModal.txn?.savingsAccountId?.accountNumber}</strong></li>
                <li>Mark this record status as <strong>Reverted</strong></li>
                <li>Generate accounting contra/reversal entries in the general ledger</li>
              </ul>
            </div>

            <form onSubmit={handleRollbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rollback *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Duplicate entry by mistake, erroneous cash posting, or member cancellation..."
                  value={rollbackModal.reason}
                  onChange={(e) => setRollbackModal({ ...rollbackModal, reason: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRollbackModal({ isOpen: false, txn: null, reason: '' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId !== null}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {actionLoadingId !== null && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Rollback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SavingsTransactionsPage;
