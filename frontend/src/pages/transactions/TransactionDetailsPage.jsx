import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchTransactionDetails, reverseTransaction } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, RefreshCcw, FileText, User, Calendar, CreditCard, Activity } from 'lucide-react';

const TransactionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);

  const loadDetails = async () => {
    try {
      const res = await fetchTransactionDetails(id);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleReverse = async (e) => {
    e.preventDefault();
    if (!reversalReason.trim()) return;
    setReversing(true);
    try {
      await reverseTransaction(id, reversalReason);
      setShowReversalModal(false);
      loadDetails(); // Reload to show reversed status
    } catch (err) {
      alert(err.message || 'Failed to reverse transaction');
    } finally {
      setReversing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl">
          {error || 'Transaction not found'}
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 text-emerald-500 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    );
  }

  const { transaction, journalEntry, journalLines } = data;
  
  const canReverse = ['Super Admin', 'Org Admin', 'Treasurer'].includes(user.role) && transaction.status === 'Completed';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => navigate('/transactions/list')} className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 mb-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Transaction Details
            <span className={`text-xs px-2 py-1 rounded-full border ${
              transaction.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              transaction.status === 'Reversed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
              'bg-slate-700 text-slate-300 border-slate-600'
            }`}>
              {transaction.status}
            </span>
          </h1>
          <p className="text-emerald-400 font-mono mt-1 text-sm">{transaction.transactionId}</p>
        </div>
        
        {canReverse && (
          <button 
            onClick={() => setShowReversalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-lg hover:bg-rose-500 hover:text-white transition-colors text-sm font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            Reverse Transaction
          </button>
        )}
      </div>

      {transaction.status === 'Reversed' && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex gap-3">
          <RefreshCcw className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-rose-400 font-bold text-sm">Transaction Reversed</h3>
            <p className="text-slate-300 text-sm mt-1">Reason: {transaction.reversalReason}</p>
            <p className="text-slate-400 text-xs mt-1">
              Reversed on {new Date(transaction.reversedAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Transaction Information
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Amount</span>
              <span className={`font-bold text-xl ${transaction.transactionType === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'} ${transaction.status === 'Reversed' && 'line-through opacity-50'}`}>
                {transaction.transactionType === 'Inflow' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Type</span>
              <span className="text-slate-200">{transaction.transactionType}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Source Module</span>
              <span className="text-slate-200 font-medium">{transaction.sourceModule}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Payment Method</span>
              <span className="text-slate-200">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Description</span>
              <span className="text-slate-200 text-right max-w-[60%]">{transaction.description}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Date</span>
              <span className="text-slate-200">{new Date(transaction.transactionDate).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Member & Context */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Related Entities
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Member / Entity</div>
                {transaction.memberId ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{transaction.memberId.firstName} {transaction.memberId.lastName}</div>
                      <div className="text-slate-400 text-xs">{transaction.memberId.memberId}</div>
                    </div>
                    <Link to={`/members/profile/${transaction.memberId._id}`} className="text-xs text-emerald-400 hover:underline">View Profile</Link>
                  </div>
                ) : (
                  <div className="text-slate-300 italic">Organization Level Transaction</div>
                )}
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Created By</div>
                  <div className="text-white text-sm">{transaction.createdBy?.firstName} {transaction.createdBy?.lastName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounting Journal Entry */}
      {journalEntry && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Accounting Journal Entry</h2>
            <span className="ml-2 text-xs font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded">{journalEntry.entryNumber}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                  <th className="p-3 font-medium rounded-tl-lg">Account</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium text-right">Debit (DR)</th>
                  <th className="p-3 font-medium text-right rounded-tr-lg">Credit (CR)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {journalLines.map((line, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/10">
                    <td className="p-3">
                      <div className="font-medium text-slate-200">{line.accountId?.accountName}</div>
                      <div className="text-xs text-slate-500">{line.accountId?.accountCode}</div>
                    </td>
                    <td className="p-3 text-slate-400">{line.description}</td>
                    <td className="p-3 text-right text-emerald-400">
                      {line.debit > 0 ? `₹${line.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right text-rose-400">
                      {line.credit > 0 ? `₹${line.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                  </tr>
                ))}
                {/* Totals */}
                <tr className="bg-slate-900 border-t border-slate-600 font-bold">
                  <td colSpan="2" className="p-3 text-right text-slate-300">Totals:</td>
                  <td className="p-3 text-right text-emerald-400">
                    ₹{journalLines.reduce((sum, line) => sum + (line.debit || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right text-rose-400">
                    ₹{journalLines.reduce((sum, line) => sum + (line.credit || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {showReversalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 bg-rose-500/10 border-b border-rose-500/20">
              <h2 className="text-xl font-bold text-rose-500 flex items-center gap-2">
                <RefreshCcw className="w-6 h-6" />
                Confirm Reversal
              </h2>
            </div>
            
            <form onSubmit={handleReverse} className="p-6 space-y-4">
              <p className="text-sm text-slate-300">
                You are about to reverse this transaction. This will generate a counter Journal Entry to balance the accounts and mark this transaction as Reversed.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Reversal *</label>
                <textarea
                  required
                  rows="3"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none"
                  placeholder="E.g., Entry made in error, incorrect amount..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReversalModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversing || !reversalReason.trim()}
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-50 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {reversing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Confirm Reversal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionDetailsPage;
