import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Wallet, 
  Banknote, 
  CreditCard, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building2, 
  Receipt, 
  ArrowUpRight, 
  HelpCircle, 
  Landmark, 
  MessageSquare, 
  BookOpen,
  Plus,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  X,
  Phone,
  Crown,
  RefreshCw,
  Layers,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';
import { 
  fetchMyMemberProfileApi,
  fetchSavingsAccounts, 
  getLoans, 
  fetchCalendarMeetings,
  fetchGroupProfile,
  submitDepositRequestApi,
  submitWithdrawalRequestApi,
  fetchPendingSavingsRequestsApi,
  fetchSavingsTransactions
} from '../../services/api';

const MemberDashboard = () => {
  const { user, activeGroup } = useAuth();
  const navigate = useNavigate();

  // Primary Data State
  const [loading, setLoading] = useState(true);
  const [myMember, setMyMember] = useState(null);
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [savingsAccount, setSavingsAccount] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Modals & Form State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: '', paymentMethod: 'UPI', referenceNumber: '', remarks: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', paymentMethod: 'Cash', remarks: '' });
  
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // 1. Initial Data Loading
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const groupParam = activeGroup?._id ? { groupId: activeGroup._id } : {};
      const [memRes, savRes, loansRes, groupRes, meetRes, reqRes] = await Promise.allSettled([
        fetchMyMemberProfileApi(),
        fetchSavingsAccounts({ myOnly: 'true', ...(activeGroup?._id ? { groupId: activeGroup._id } : {}) }),
        getLoans({ ...groupParam, status: 'Active' }),
        activeGroup?._id ? fetchGroupProfile(activeGroup._id) : Promise.resolve({ data: { success: false } }),
        fetchCalendarMeetings(groupParam),
        fetchPendingSavingsRequestsApi(groupParam)
      ]);

      let resolvedMember = null;
      if (memRes.status === 'fulfilled' && memRes.value.data?.data) {
        resolvedMember = memRes.value.data.data;
        setMyMember(resolvedMember);
      }

      if (savRes.status === 'fulfilled' && savRes.value.data?.data) {
        const accounts = savRes.value.data.data || [];
        setSavingsAccounts(accounts);
        
        let matched = null;
        if (activeGroup?._id) {
          matched = accounts.find(a => (a.groupId?._id || a.groupId)?.toString() === activeGroup._id.toString());
        }
        setSavingsAccount(matched || accounts[0] || null);
      }

      if (loansRes.status === 'fulfilled' && loansRes.value.data?.data) {
        setActiveLoans(loansRes.value.data.data || []);
      }

      if (groupRes.status === 'fulfilled' && groupRes.value.data?.data) {
        setGroupDetails(groupRes.value.data.data);
      }

      if (meetRes.status === 'fulfilled' && meetRes.value.data?.data) {
        setMeetings(meetRes.value.data.data || []);
      }

      if (reqRes.status === 'fulfilled' && reqRes.value.data?.data) {
        setPendingRequests(reqRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error loading member dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, activeGroup]);

  // Load recent transactions for active savings account
  useEffect(() => {
    if (savingsAccount?._id) {
      fetchSavingsTransactions({ savingsAccountId: savingsAccount._id, limit: 3 })
        .then(res => {
          if (res.data?.success && res.data?.data) {
            setRecentTransactions(res.data.data);
          } else {
            setRecentTransactions([]);
          }
        })
        .catch(() => setRecentTransactions([]));
    }
  }, [savingsAccount?._id]);

  // 2. Deposit Submission (Pending Treasurer Approval)
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositForm.amount || Number(depositForm.amount) <= 0) {
      setFeedbackError('Please enter a valid deposit amount.');
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackError('');
      const payload = {
        accountId: savingsAccount?._id,
        amount: Number(depositForm.amount),
        paymentMethod: depositForm.paymentMethod,
        referenceNumber: depositForm.referenceNumber,
        remarks: depositForm.remarks || 'Monthly savings deposit',
      };

      const res = await submitDepositRequestApi(payload);
      if (res.data?.success) {
        setFeedbackSuccess('Deposit request submitted! The Group Treasurer will review and accept your deposit.');
        setShowDepositModal(false);
        setDepositForm({ amount: '', paymentMethod: 'UPI', referenceNumber: '', remarks: '' });
        loadDashboardData();
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.error || err.message || 'Failed to submit deposit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSavingsBalance = savingsAccount?.currentBalance ?? savingsAccount?.balance ?? 0;
  const minimumReserve = savingsAccount?.minimumBalance ?? 500;
  const withdrawableBalance = Math.max(0, totalSavingsBalance - minimumReserve);

  // 3. Withdrawal Submission (Pending Treasurer Approval)
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const withdrawAmt = Number(withdrawForm.amount);
    if (!withdrawAmt || withdrawAmt <= 0) {
      setFeedbackError('Please enter a valid withdrawal amount.');
      return;
    }

    if (withdrawAmt > withdrawableBalance) {
      setFeedbackError(`Withdrawal amount of ₹${withdrawAmt.toLocaleString('en-IN')} exceeds your net withdrawable balance of ₹${withdrawableBalance.toLocaleString('en-IN')}. (₹${minimumReserve.toLocaleString('en-IN')} is reserved as mandatory minimum buffer).`);
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackError('');
      const payload = {
        accountId: savingsAccount?._id,
        amount: withdrawAmt,
        paymentMethod: withdrawForm.paymentMethod,
        remarks: withdrawForm.remarks || 'Emergency thrift savings withdrawal',
      };

      const res = await submitWithdrawalRequestApi(payload);
      if (res.data?.success) {
        setFeedbackSuccess('Withdrawal application submitted! The Group Treasurer will review and disburse your funds.');
        setShowWithdrawModal(false);
        setWithdrawForm({ amount: '', paymentMethod: 'Cash', remarks: '' });
        loadDashboardData();
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.error || err.message || 'Failed to submit withdrawal application.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const currentBalance = totalSavingsBalance;
  const presidentInfo = groupDetails?.presidentId || groupDetails?.leaderId || activeGroup?.president;
  const secretaryInfo = groupDetails?.secretaryId || activeGroup?.secretary;
  const treasurerInfo = groupDetails?.treasurerId || activeGroup?.treasurer;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-sm font-bold text-slate-600">Loading your Member Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* 1. Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Member Participation Portal</span>
                </span>
                {activeGroup && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeGroup.groupName}</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Namaskara, {myMember?.fullName || user?.name || 'Member'}
              </h1>
              <p className="text-xs text-slate-500">
                Member ID: <span className="text-teal-700 font-bold font-mono">{myMember?.memberId || user?.username || 'MEM-2026'}</span> • {activeGroup?.groupType || 'Self-Help Group (SHG)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to={activeGroup?._id ? `/groups/profile/${activeGroup._id}` : '/groups/profile'}
              className="px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-teal-200"
              title="View your group profile, status, and members roster"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Group Details</span>
            </Link>

            <Link
              to="/select-group"
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
              title="Switch to another enrolled group"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Switch Group</span>
            </Link>
            
            <Link
              to="/passbook"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Digital Passbook</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Action Feedback Alerts */}
      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {feedbackSuccess}
          </span>
          <button onClick={() => setFeedbackSuccess('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {feedbackError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {feedbackError}
          </span>
          <button onClick={() => setFeedbackError('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Group Savings Account & Financial Actions Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Savings Balance Card */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-soft-teal flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            {/* Header & Multi-Account Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Group Savings Account</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {savingsAccount?.accountNumber || 'SAV-2026-ACTIVE'} • {savingsAccount?.groupId?.groupName || activeGroup?.groupName || 'SHG Group'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </div>
            </div>

            {/* Balances Breakdown (Withdrawable vs Total) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 to-emerald-50/40 border border-teal-200/80 space-y-1">
                <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Available Withdrawable Balance</span>
                </span>
                <div className="text-3xl sm:text-4xl font-black text-teal-950 font-mono tracking-tight">
                  {formatCurrency(withdrawableBalance)}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Liquid funds available for immediate cash/bank withdrawal
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold text-[11px]">Total Ledger Savings:</span>
                  <span className="font-mono font-black text-slate-900">{formatCurrency(totalSavingsBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold text-[11px]">Mandatory Minimum Buffer:</span>
                  <span className="font-mono font-bold text-amber-800">{formatCurrency(minimumReserve)}</span>
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">
                  *₹{minimumReserve.toLocaleString('en-IN')} maintained as statutory society thrift reserve
                </div>
              </div>
            </div>

            {/* Recent Passbook Activity Feed Preview */}
            {recentTransactions.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-teal-600" />
                    <span>Recent Passbook Journal Activity</span>
                  </span>
                  <Link
                    to={savingsAccount?._id ? `/passbook/${savingsAccount._id}` : '/passbook'}
                    className="text-teal-700 hover:text-teal-900 underline font-bold"
                  >
                    View Full Passbook →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {recentTransactions.map((t) => {
                    const isDeposit = t.transactionType === 'Deposit' || t.transactionType === 'Interest';
                    const isLoanEmi = t.referenceNumber?.includes('EMI') || 
                                      t.paymentMethod === 'Savings Auto-Debit' || 
                                      t.remarks?.toLowerCase().includes('emi');
                    return (
                      <div
                        key={t._id}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between gap-1 shadow-2xs ${
                          isLoanEmi 
                            ? 'bg-amber-50/70 border-amber-200' 
                            : isDeposit 
                              ? 'bg-emerald-50/50 border-emerald-200' 
                              : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-[10px] text-slate-500 font-sans">
                            {new Date(t.transactionDate || t.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`font-mono font-black ${isDeposit ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {isDeposit ? `+${formatCurrency(t.amount)}` : `-${formatCurrency(t.amount)}`}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 truncate" title={t.remarks || t.transactionType}>
                          {isLoanEmi ? '🏦 Loan EMI Auto-Debit' : (t.remarks || t.transactionType)}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          Bal: {formatCurrency(t.balanceAfterTransaction)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => { setShowDepositModal(true); setFeedbackError(''); }}
              className="py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>+ Add Money (Deposit)</span>
            </button>

            <button
              onClick={() => { setShowWithdrawModal(true); setFeedbackError(''); }}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-900/20"
            >
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
              <span>Apply for Withdrawal</span>
            </button>

            <Link
              to={savingsAccount?._id ? `/passbook/${savingsAccount._id}` : '/passbook'}
              className="py-3 px-4 rounded-2xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>View Digital Passbook</span>
            </Link>
          </div>
        </div>

        {/* Group Loans & Credit Summary Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Active Group Credit</span>
              <Banknote className="w-5 h-5 text-amber-600" />
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 font-mono">
                {formatCurrency(activeLoans.reduce((sum, l) => sum + (l.outstandingAmount || l.principalAmount || 0), 0))}
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {activeLoans.length} active group loan{activeLoans.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/my-loans"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View Loan Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/loans/apply"
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
            >
              Apply Loan
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Pending Requests Tracker (Live Treasurer Queue) */}
      {pendingRequests.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Pending Treasurer Approval Requests ({pendingRequests.length})
              </h2>
            </div>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Awaiting Group Treasurer Verification
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <div key={req._id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    req.transactionType === 'Deposit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {req.transactionType === 'Deposit' ? '+DEP' : '-WDL'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {req.transactionType === 'Deposit' ? 'Deposit Request' : 'Withdrawal Request'} • {formatCurrency(req.amount)}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {req.transactionId} • Method: <span className="font-semibold text-slate-700">{req.paymentMethod}</span> {req.referenceNumber && `• Ref: ${req.referenceNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                    <span>Pending Treasurer Verification</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Group Executive Leadership & Direct Chat Strip */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>Group Leadership Directory ({activeGroup?.groupName || 'Self-Help Group'})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Reach out directly to your elected leaders for secretarial schedules, treasury approvals, or executive guidance.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={activeGroup?._id ? `/groups/profile/${activeGroup._id}` : '/groups/profile'}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-teal-800 border border-teal-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Users className="w-4 h-4 text-teal-600" />
              <span>View Group Details & Roster</span>
            </Link>

            <Link
              to="/chat"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-teal-600/20 shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with Executives</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* President Card */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-start justify-between">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-700" /> President
              </span>
              <h3 className="text-sm font-bold text-slate-900 pt-1">
                {presidentInfo?.fullName || presidentInfo?.name || 'Assigned President'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{presidentInfo?.phone || '+91 98470 10001'}</span>
              </p>
            </div>
            <Link to="/chat" className="p-2 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </Link>
          </div>

          {/* Secretary Card */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex items-start justify-between">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300 inline-flex items-center gap-1">
                <FileText className="w-3 h-3 text-blue-700" /> Secretary
              </span>
              <h3 className="text-sm font-bold text-slate-900 pt-1">
                {secretaryInfo?.fullName || secretaryInfo?.name || 'Assigned Secretary'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{secretaryInfo?.phone || '+91 98470 10002'}</span>
              </p>
            </div>
            <Link to="/chat" className="p-2 rounded-xl bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 transition-colors shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </Link>
          </div>

          {/* Treasurer Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-start justify-between">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                <Banknote className="w-3 h-3 text-emerald-700" /> Treasurer
              </span>
              <h3 className="text-sm font-bold text-slate-900 pt-1">
                {treasurerInfo?.fullName || treasurerInfo?.name || 'Assigned Treasurer'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{treasurerInfo?.phone || '+91 98470 10003'}</span>
              </p>
            </div>
            <Link to="/chat" className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>

      {/* 5. Group Assemblies (Schedule) & Group Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Meeting Schedule */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Upcoming Group Assemblies</h3>
            </div>
            <Link to="/meetings/calendar" className="text-xs font-bold text-teal-700 hover:underline">
              View Calendar
            </Link>
          </div>

          {meetings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {meetings.slice(0, 3).map((m) => (
                <div key={m._id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                      {new Date(m.scheduledDate).toLocaleDateString()} • {m.scheduledTime || '10:00 AM'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{m.agenda || 'Regular Monthly Thrift & Credit Assembly'}</p>
                  <p className="text-[10px] text-slate-400">Venue: {m.location || 'Society Hall / Community Center'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1 bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">No Upcoming Assemblies Scheduled</p>
              <p>The Group Secretary will notify all members when the next meeting is announced.</p>
            </div>
          )}
        </div>

        {/* Group Reports & Statistics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Group Reports & Records</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              View collective reports, thrift contribution registries, attendance metrics, and group performance statements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/groups/reports"
              className="py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Group Reports</span>
            </Link>

            <Link
              to="/complaints"
              className="py-3 px-4 rounded-2xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Lodge Complaint</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD MONEY (DEPOSIT REQUEST) */}
      {/* ========================================================================= */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Money (Deposit)</h3>
                  <p className="text-xs text-slate-500 font-mono">{savingsAccount?.accountNumber || 'Group Savings'}</p>
                </div>
              </div>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Treasurer Verification Governance</span>
              </p>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Your deposit request will be submitted to the **Group Treasurer** ({treasurerInfo?.fullName || treasurerInfo?.name || 'Treasurer'}). The amount will be credited to your passbook once accepted and verified.
              </p>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Deposit Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 1000"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-base font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method *</label>
                <select
                  value={depositForm.paymentMethod}
                  onChange={(e) => setDepositForm({ ...depositForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="UPI">UPI / Digital QR</option>
                  <option value="Cash">Cash (Handed to Treasurer)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">UPI Ref / UTR / Receipt No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-202684930192"
                  value={depositForm.referenceNumber}
                  onChange={(e) => setDepositForm({ ...depositForm, referenceNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Remarks / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly thrift deposit"
                  value={depositForm.remarks}
                  onChange={(e) => setDepositForm({ ...depositForm, remarks: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Deposit Request</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: APPLY FOR WITHDRAWAL */}
      {/* ========================================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Apply for Withdrawal</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {savingsAccount?.accountNumber || 'Savings'} • {savingsAccount?.groupId?.groupName || 'SHG'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clear Withdrawable vs Total Breakdown */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-teal-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Max Withdrawable Limit:
                </span>
                <span className="font-mono text-sm text-teal-950 font-black">{formatCurrency(withdrawableBalance)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-teal-200/60">
                <div>
                  <span className="text-slate-400 block">Total Ledger Savings:</span>
                  <strong className="text-slate-800 font-mono">{formatCurrency(totalSavingsBalance)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Mandatory Min. Buffer:</span>
                  <strong className="text-amber-800 font-mono">{formatCurrency(minimumReserve)}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Treasurer Approval & Disbursement</span>
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Withdrawals require verification and cash/bank disbursement by the **Group Treasurer** ({treasurerInfo?.fullName || treasurerInfo?.name || 'Treasurer'}).
              </p>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Withdrawal Amount (₹) * <span className="text-slate-400 font-normal">(Max: ₹{withdrawableBalance.toLocaleString('en-IN')})</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={withdrawableBalance}
                  step="1"
                  placeholder={`Up to ${withdrawableBalance}`}
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600 text-base font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Payout Mode *</label>
                <select
                  value={withdrawForm.paymentMethod}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="Cash">Cash Handout from Treasury</option>
                  <option value="Bank Transfer">Bank Transfer to Linked Bank Account</option>
                  <option value="UPI">UPI Payout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason / Purpose for Withdrawal *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Emergency family medical expense"
                  value={withdrawForm.remarks}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, remarks: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Withdrawal Request</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MemberDashboard;
