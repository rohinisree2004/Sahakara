import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSavingsAccountById, fetchSavingsTransactions } from '../../services/api';
import { ArrowLeft, Wallet, User, Calendar, Plus, BookOpen, Activity, AlertCircle } from 'lucide-react';

const MemberSavingsProfilePage = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const [accRes, txnRes] = await Promise.all([
          fetchSavingsAccountById(id),
          fetchSavingsTransactions({ savingsAccountId: id, limit: 5 })
        ]);
        
        if (accRes.data.success) setAccount(accRes.data.data);
        if (txnRes.data.success) setTransactions(txnRes.data.data);
      } catch (error) {
        console.error('Failed to load savings profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadProfileData();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <AlertCircle className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Account Not Found</h2>
        <p>The savings account you are looking for does not exist or you lack permission.</p>
        <Link to="/savings/accounts" className="mt-6 text-emerald-400 hover:underline">
          Return to Accounts List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/savings/accounts"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Account Profile
            </h1>
            <p className="text-slate-400 mt-1 font-mono">{account.accountNumber}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            to={`/savings/passbook/${account._id}`}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Digital Passbook
          </Link>
          {account.status === 'Active' && (
            <Link 
              to="/savings/deposit"
              state={{ prefillAccountId: account._id }} // Pass state if we want to auto-select in deposit form
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Record Deposit
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Balance Card & Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="relative z-10">
              <h3 className="text-emerald-400 text-sm font-semibold mb-1">Available Balance</h3>
              <p className="text-4xl font-bold text-white mb-4">{formatCurrency(account.currentBalance)}</p>
              
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className={`px-2 py-0.5 rounded-md ${
                  account.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' :
                  account.status === 'Closed' ? 'bg-rose-500/20 text-rose-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {account.status}
                </span>
                <span className="text-emerald-500/70">•</span>
                <span className="text-emerald-300">{account.accountType}</span>
              </div>
            </div>
          </div>

          {/* Member Profile Widget */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Account Holder
            </h3>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
              {account.memberId?.profileImage ? (
                <img src={account.memberId.profileImage} alt={account.memberId.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-2xl border-2 border-slate-600">
                  {account.memberId?.fullName?.charAt(0) || 'M'}
                </div>
              )}
              <div>
                <Link to={`/members/profile/${account.memberId?._id}`} className="font-bold text-white text-lg hover:text-emerald-400 transition-colors">
                  {account.memberId?.fullName}
                </Link>
                <p className="text-sm text-slate-400 font-mono">{account.memberId?.memberId}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="text-white font-medium">{account.memberId?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category</span>
                <span className="text-white font-medium">{account.memberId?.category || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch</span>
                <span className="text-white font-medium">{account.branchId?.branchName || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Details & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings / Details */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Opening Balance</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(account.openingBalance)}</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Minimum Balance</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(account.minimumBalance)}</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
                <p className="text-sm font-semibold text-white">{account.interestRate}%</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Opened On</p>
                <p className="text-sm font-semibold text-white">{new Date(account.openedAt).toLocaleDateString()}</p>
              </div>
            </div>
            {account.remarks && (
              <div className="mt-4 p-4 bg-slate-900/30 rounded-xl border border-slate-700/30">
                <p className="text-xs text-slate-400 mb-1">Remarks</p>
                <p className="text-sm text-slate-300">{account.remarks}</p>
              </div>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Recent Transactions
              </h3>
              <Link to={`/savings/transactions?savingsAccountId=${account._id}`} className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline">
                View All
              </Link>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No transactions found for this account.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(txn => (
                  <div key={txn._id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        txn.transactionType === 'Deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {txn.transactionType === 'Deposit' ? <Plus className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{txn.transactionType}</div>
                        <div className="text-xs text-slate-400">{formatDate(txn.transactionDate)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${txn.transactionType === 'Deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {txn.transactionType === 'Deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{txn.transactionId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberSavingsProfilePage;
