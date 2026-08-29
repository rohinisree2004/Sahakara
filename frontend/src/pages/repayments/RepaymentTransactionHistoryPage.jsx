import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Banknote, 
  Search, 
  ArrowLeft, 
  Receipt, 
  Printer, 
  Calendar, 
  User, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X,
  CreditCard,
  Building2,
  GitBranch,
  Eye
} from 'lucide-react';
import { fetchRepaymentTransactions } from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const RepaymentTransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [filterParams, setFilterParams] = useState({});

  const fetchTxns = useCallback(async (currentFilters = filterParams) => {
    try {
      setLoading(true);
      const params = {};
      if (currentFilters.organizationId && currentFilters.organizationId !== 'All') params.organizationId = currentFilters.organizationId;
      if (currentFilters.branchId && currentFilters.branchId !== 'All') params.branchId = currentFilters.branchId;
      if (currentFilters.groupId && currentFilters.groupId !== 'All') params.groupId = currentFilters.groupId;
      if (currentFilters.memberId && currentFilters.memberId !== 'All') params.memberId = currentFilters.memberId;

      const res = await fetchRepaymentTransactions(params);
      if (res.data && res.data.success) {
        setTransactions(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch repayment transactions.');
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchTxns(filterParams);
  }, [fetchTxns, filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredTxns = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    const txnId = (t.transactionId || '').toLowerCase();
    const memberName = (t.memberId?.fullName || `${t.memberId?.firstName || ''} ${t.memberId?.lastName || ''}`).toLowerCase();
    const method = (t.paymentMethod || '').toLowerCase();
    const ref = (t.referenceNumber || '').toLowerCase();
    const loanApp = (t.loanId?.applicationId || '').toLowerCase();
    return txnId.includes(term) || memberName.includes(term) || method.includes(term) || ref.includes(term) || loanApp.includes(term);
  });

  const totalCollected = filteredTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/repayments/dashboard"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Receipt className="w-7 h-7 text-teal-600" />
              <span>Repayment Transactions Ledger</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Audit trail of all EMI collections, counter receipts, and financial ledger postings
            </p>
          </div>
        </div>

        <Link
          to="/repayments/record"
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
        >
          <Banknote className="w-4 h-4" />
          <span>Record New Repayment</span>
        </Link>
      </div>

      {/* Hierarchical Filter */}
      <HierarchicalFilterBar onFilterChange={handleFilterChange} initialValues={filterParams} />

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Repayments Logged</span>
            <div className="text-3xl font-black font-mono text-slate-900 mt-1">{filteredTxns.length} Vouchers</div>
            <p className="text-[11px] text-teal-700 font-bold mt-0.5">Reconciled Collections</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
            <Receipt className="w-6 h-6 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Principal & Interest Recovered</span>
            <div className="text-3xl font-black font-mono text-teal-800 mt-1">{formatCurrency(totalCollected)}</div>
            <p className="text-[11px] text-teal-700 font-bold mt-0.5">Posted into Accounting Ledger</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
            <Banknote className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
        
        {/* Search Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search receipt ID, member name, payment channel, or loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No repayment transactions found.</p>
            <p className="text-xs text-slate-500">Repayment collection vouchers recorded by cashier will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Voucher & Date</th>
                  <th className="py-4 px-6">Member Account</th>
                  <th className="py-4 px-6">Loan & Installment</th>
                  <th className="py-4 px-6">Channel / Ref</th>
                  <th className="py-4 px-6">Amount Credited</th>
                  <th className="py-4 px-6">Remaining Balance</th>
                  <th className="py-4 px-6 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTxns.map((t) => {
                  const memberName = t.memberId?.fullName || `${t.memberId?.firstName || ''} ${t.memberId?.lastName || ''}`;

                  return (
                    <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 font-mono text-xs">{t.transactionId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{formatDate(t.paymentDate || t.createdAt)}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{memberName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{t.memberId?.memberId || 'MEM-Folio'}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-teal-800 font-mono">{t.loanId?.applicationId || 'Loan Ref'}</div>
                        <div className="text-[10px] text-slate-500">EMI #{t.emiId?.emiNumber || 'Counter'}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                          {t.paymentMethod}
                        </span>
                        {t.referenceNumber && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.referenceNumber}</div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-mono font-black text-teal-800 text-sm">{formatCurrency(t.amount)}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-slate-800">{formatCurrency(t.balanceAfterTransaction)}</div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedTxn(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-bold transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Voucher</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Voucher Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-mono uppercase">
                  Official Repayment Voucher
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Receipt #{selectedTxn.transactionId}</h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Payment Timestamp:</span>
                <span className="font-bold font-mono text-slate-900">{formatDate(selectedTxn.paymentDate || selectedTxn.createdAt)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Borrower:</span>
                <span className="font-bold text-slate-900">{selectedTxn.memberId?.fullName || selectedTxn.memberId?.firstName} ({selectedTxn.memberId?.memberId})</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Loan Account:</span>
                <span className="font-bold font-mono text-teal-800">{selectedTxn.loanId?.applicationId}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Installment:</span>
                <span className="font-bold font-mono text-slate-900">EMI #{selectedTxn.emiId?.emiNumber || 'Counter'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Payment Channel:</span>
                <span className="font-bold text-slate-900">{selectedTxn.paymentMethod}</span>
              </div>
              {selectedTxn.referenceNumber && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">Reference / UTR:</span>
                  <span className="font-bold font-mono text-slate-900">{selectedTxn.referenceNumber}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 items-center">
                <span className="text-slate-500 font-bold uppercase">Amount Credited:</span>
                <span className="font-black text-xl font-mono text-teal-800">{formatCurrency(selectedTxn.amount)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Remaining Outstanding:</span>
                <span className="font-bold font-mono text-slate-900">{formatCurrency(selectedTxn.balanceAfterTransaction)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4 text-teal-600" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setSelectedTxn(null)}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RepaymentTransactionHistoryPage;
