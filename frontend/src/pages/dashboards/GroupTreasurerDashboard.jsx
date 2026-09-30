import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchSavingsDashboard, 
  getUpcomingEMIs, 
  getOverdueEMIs, 
  fetchPendingSavingsRequestsApi,
  approveSavingsRequestApi,
  rejectSavingsRequestApi,
  getLoans,
  reviewLoanApi,
  fetchSavingsAccounts,
  submitDepositRequestApi,
  submitWithdrawalRequestApi,
  fetchMembersList,
  deductEmiFromSavingsApi
} from '../../services/api';
import { 
  Coins, 
  Wallet, 
  Calculator, 
  Clock, 
  FileSpreadsheet, 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  Check,
  X,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Banknote,
  BookOpen,
  CreditCard,
  Plus,
  RefreshCw,
  Eye,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

const GroupTreasurerDashboard = () => {
  const { user, activeGroup } = useAuth();
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Treasury Data
  const [savingsStats, setSavingsStats] = useState(null);
  const [upcomingEmis, setUpcomingEmis] = useState([]);
  const [overdueEmis, setOverdueEmis] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Personal Member Baseline Data
  const [myMember, setMyMember] = useState(null);
  const [mySavings, setMySavings] = useState(null);
  const [myLoans, setMyLoans] = useState([]);

  // Action States
  const [actionProcessingId, setActionProcessingId] = useState(null);
  const [forwardingLoanId, setForwardingLoanId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Auto-Deduct EMI Modal State for Treasurer
  const [selectedEmiForTreasurerDeduction, setSelectedEmiForTreasurerDeduction] = useState(null);
  const [treasurerDeductionRemarks, setTreasurerDeductionRemarks] = useState('');
  const [isTreasurerDeducting, setIsTreasurerDeducting] = useState(false);
  const [activeEmiTab, setActiveEmiTab] = useState('overdue'); // 'overdue' or 'upcoming'

  // Modals for personal deposit / withdrawal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: '', paymentMethod: 'UPI', referenceNumber: '', notes: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', paymentMethod: 'Cash', reason: '' });
  const [submittingModal, setSubmittingModal] = useState(false);

  const handleTreasurerAutoDeduct = async (e) => {
    e.preventDefault();
    if (!selectedEmiForTreasurerDeduction) return;
    setIsTreasurerDeducting(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await deductEmiFromSavingsApi({
        loanId: selectedEmiForTreasurerDeduction.loanId?._id || selectedEmiForTreasurerDeduction.loanId,
        emiId: selectedEmiForTreasurerDeduction._id,
        emiNumber: selectedEmiForTreasurerDeduction.emiNumber,
        remarks: treasurerDeductionRemarks || 'Auto-deducted from member thrift savings by Group Treasurer'
      });
      if (res.data && res.data.success) {
        setActionSuccess(res.data.message || 'EMI auto-deducted from member savings account successfully!');
        setSelectedEmiForTreasurerDeduction(null);
        setTreasurerDeductionRemarks('');
        loadTreasurerData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to auto-deduct EMI from savings.');
    } finally {
      setIsTreasurerDeducting(false);
    }
  };

  const loadTreasurerData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeGroup?._id) params.groupId = activeGroup._id;

      const [savRes, upRes, ovRes, reqRes, loansRes, memRes] = await Promise.all([
        fetchSavingsDashboard(params).catch(() => ({ data: { success: true, data: null } })),
        getUpcomingEMIs(params).catch(() => ({ data: { success: true, data: [] } })),
        getOverdueEMIs(params).catch(() => ({ data: { success: true, data: [] } })),
        fetchPendingSavingsRequestsApi(params).catch(() => ({ data: { success: true, data: [] } })),
        getLoans({ status: 'Submitted' }).catch(() => ({ data: { success: true, data: [] } })),
        fetchMembersList({ search: user?.phone || user?.email || user?.name }).catch(() => ({ data: { success: true, data: [] } }))
      ]);

      if (savRes.data && savRes.data.success) {
        setSavingsStats(savRes.data.data);
      }
      if (upRes.data && upRes.data.success) {
        setUpcomingEmis(upRes.data.data || []);
      }
      if (ovRes.data && ovRes.data.success) {
        setOverdueEmis(ovRes.data.data || []);
      }
      if (reqRes.data && reqRes.data.success) {
        setPendingRequests(reqRes.data.data || []);
      }
      if (loansRes.data && loansRes.data.success) {
        const lData = loansRes.data.data;
        setPendingLoans(Array.isArray(lData) ? lData : []);
      }
      if (memRes.data && memRes.data.success) {
        const list = memRes.data.data || [];
        const resolved = list.find(m => m.userId === user?._id || m.phone === user?.phone || m.email === user?.email) || list[0] || null;
        setMyMember(resolved);
        if (resolved?._id) {
          fetchSavingsAccounts({ memberId: resolved._id, myOnly: 'true' }).then(sRes => {
            if (sRes.data?.success) {
              const list = sRes.data.data || [];
              const acc = list.find(a => (a.groupId?._id || a.groupId)?.toString() === activeGroup?._id?.toString()) || list[0] || null;
              setMySavings(acc);
            }
          }).catch(console.warn);
          getLoans({ memberId: resolved._id, myOnly: 'true' }).then(lRes => {
            if (lRes.data?.success) setMyLoans(lRes.data.data || []);
          }).catch(console.warn);
        }
      }
    } catch (err) {
      console.warn('Error loading treasurer workspace:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreasurerData();
  }, [user, activeGroup]);

  // Approve Member Deposit or Withdrawal
  const handleApproveRequest = async (requestId, type) => {
    try {
      setActionProcessingId(requestId);
      setActionError('');
      const res = await approveSavingsRequestApi(requestId);
      if (res.data?.success) {
        setActionSuccess(res.data.message || `${type} request approved and balance updated successfully!`);
        loadTreasurerData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to approve request.');
    } finally {
      setActionProcessingId(null);
    }
  };

  // Reject Member Deposit or Withdrawal
  const handleRejectRequest = async (requestId, type) => {
    const reason = window.prompt(`Please provide a reason for rejecting this ${type} request:`, 'Discrepancy in receipt / proof');
    if (reason === null) return;

    try {
      setActionProcessingId(requestId);
      setActionError('');
      const res = await rejectSavingsRequestApi(requestId, { reason });
      if (res.data?.success) {
        setActionSuccess(res.data.message || `${type} request has been rejected.`);
        loadTreasurerData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to reject request.');
    } finally {
      setActionProcessingId(null);
    }
  };

  // Forward Loan to Branch Manager
  const handleForwardLoan = async (loanId) => {
    try {
      setForwardingLoanId(loanId);
      setActionError('');
      const res = await reviewLoanApi(loanId, {
        action: 'Recommended',
        remarks: 'Recommended by Group Treasurer and forwarded to Branch Manager for credit sanction.'
      });
      if (res.data?.success) {
        setActionSuccess('Loan application recommended and forwarded to Branch Manager successfully!');
        loadTreasurerData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to forward loan application.');
    } finally {
      setForwardingLoanId(null);
    }
  };

  // Personal Deposit Request Submit
  const handlePersonalDeposit = async (e) => {
    e.preventDefault();
    if (!depositForm.amount || Number(depositForm.amount) <= 0) return;
    setSubmittingModal(true);
    try {
      const res = await submitDepositRequestApi({
        accountId: mySavings?._id,
        amount: Number(depositForm.amount),
        paymentMethod: depositForm.paymentMethod,
        referenceNumber: depositForm.referenceNumber,
        remarks: depositForm.notes || 'Personal Deposit Request'
      });
      if (res.data?.success) {
        setActionSuccess('Deposit request registered! As Treasurer, you can execute it in the queue below.');
        setShowDepositModal(false);
        setDepositForm({ amount: '', paymentMethod: 'UPI', referenceNumber: '', notes: '' });
        loadTreasurerData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to submit deposit.');
    } finally {
      setSubmittingModal(false);
    }
  };

  // Personal Withdrawal Request Submit
  const handlePersonalWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawForm.amount || Number(withdrawForm.amount) <= 0) return;
    setSubmittingModal(true);
    try {
      const res = await submitWithdrawalRequestApi({
        accountId: mySavings?._id,
        amount: Number(withdrawForm.amount),
        paymentMethod: withdrawForm.paymentMethod,
        remarks: withdrawForm.reason || 'Personal Withdrawal Request'
      });
      if (res.data?.success) {
        setActionSuccess('Withdrawal request registered! Review and execute in queue below.');
        setShowWithdrawModal(false);
        setWithdrawForm({ amount: '', paymentMethod: 'Cash', reason: '' });
        loadTreasurerData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to submit withdrawal.');
    } finally {
      setSubmittingModal(false);
    }
  };

  const totalUpcomingAmount = upcomingEmis.reduce((sum, item) => sum + (item.emiAmount || 0), 0);
  const totalOverdueAmount = overdueEmis.reduce((sum, item) => sum + (item.emiAmount || 0), 0);
  const myBalance = mySavings?.currentBalance || 0;


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Group Treasurer Financial Workspace</span>
              </span>
              {activeGroup && (
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  {activeGroup.groupName}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Treasurer Desk: {user?.name || 'Treasurer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Process member deposit requests, approve & disburse savings withdrawals, forward group loans to the Branch Manager, and manage your personal member passbook.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/select-group"
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Switch Group</span>
            </Link>

            <Link
              to="/savings/deposit"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>Record Deposit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Feedback Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {actionError}
          </span>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-800 font-bold">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PERSONAL MEMBER BASELINE CARDS (Passbook & Loans) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal Passbook & Thrift Balance */}
        <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-soft-teal space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300 font-bold border border-white/10">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-teal-200 font-bold">My Personal Passbook</span>
                <h3 className="text-base font-bold text-white">{activeGroup?.groupName || 'Self-Help Group'}</h3>
              </div>
            </div>
            <Link to="/passbook" className="text-xs font-bold text-teal-300 hover:text-white underline">
              Full Statement →
            </Link>
          </div>

          <div>
            <span className="text-xs text-teal-200">My Accumulated Thrift Balance</span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
              {formatCurrency(myBalance)}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit Money</span>
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowDownRight className="w-4 h-4 text-teal-300" />
              <span>Apply for Withdrawal</span>
            </button>
          </div>
        </div>

        {/* Personal Loans / Borrowings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-amber-800 font-bold">My Personal Credit</span>
                <h3 className="text-base font-bold text-slate-900">Personal Borrowings & Loans</h3>
              </div>
            </div>
            <Link to="/my-loans" className="text-xs font-bold text-teal-700 hover:underline">
              View All Loans →
            </Link>
          </div>

          {myLoans.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Active Loan Accounts:</span>
                <strong className="font-mono text-slate-900 font-bold">{myLoans.length} Loans</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{myLoans[0].loanTypeId?.name || 'Micro Credit'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{myLoans[0].applicationId}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  myLoans[0].status === 'Active' ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {myLoans[0].status}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-2">
              You currently have no active personal loans or credit borrowings.
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/loans/apply"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Apply for New Loan</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TREASURY KPI METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Total Thrift</span>
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
              {formatCurrency(savingsStats?.totalSavings || 0)}
            </div>
          </div>
          <Link to="/savings/transactions" className="text-[10px] font-bold text-teal-600 hover:underline mt-3 block">
            View Full Group Statement →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-2 font-mono">
            {pendingRequests.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Deposits & Withdrawals</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-xs bg-teal-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Pending Loans</span>
            <Banknote className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-900 mt-2 font-mono">
            {pendingLoans.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Requires BM Forwarding</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Accounts</span>
            <Coins className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            {savingsStats?.activeAccounts || '28'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MEMBER SAVINGS APPROVAL QUEUE (Deposits & Withdrawals) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-soft-teal space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Pending Member Deposit & Withdrawal Queue ({pendingRequests.length})
              </h2>
              <p className="text-xs text-slate-500">
                Treasurer authorization is required to accept deposits into passbooks or disburse savings withdrawals.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Treasury Processing Desk
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-700">All member savings requests are up to date!</p>
            <p>No pending deposit verifications or withdrawal authorizations in queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => {
              const isProcessing = actionProcessingId === req._id;
              const isDeposit = req.transactionType === 'Deposit';

              return (
                <div
                  key={req._id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 p-3 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        isDeposit ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {isDeposit ? '📥 Member Deposit' : '📤 Savings Withdrawal'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {req.memberId?.fullName || req.createdBy?.name || 'Member'}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">({req.memberId?.memberId || 'MEM-ID'})</span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Amount: <span className="font-mono font-black text-slate-900">{formatCurrency(req.amount)}</span> • Mode: <span className="font-semibold">{req.paymentMethod}</span> {req.referenceNumber && `• UTR/Ref: ${req.referenceNumber}`}
                    </p>
                    {req.remarks && (
                      <p className="text-[11px] text-slate-500 italic">Note: "{req.remarks}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleApproveRequest(req._id, req.transactionType)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 ${
                        isDeposit ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{isDeposit ? 'Accept Deposit' : 'Approve & Disburse'}</span>
                    </button>

                    <button
                      disabled={isProcessing}
                      onClick={() => handleRejectRequest(req._id, req.transactionType)}
                      className="px-3 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. GROUP LOAN APPLICATIONS REVIEW & FORWARD TO BRANCH MANAGER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span>Pending Group Loan Applications ({pendingLoans.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Treasurer and President evaluate credit eligibility and forward applications to the Branch Manager.
            </p>
          </div>
          <Link
            to="/loans/applications"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Loans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingLoans.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            No pending loan applications requiring treasurer recommendation at this time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Application ID</th>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Loan Scheme</th>
                  <th className="px-4 py-3">Requested Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{loan.applicationId}</td>
                    <td className="px-4 py-3 text-slate-700">{loan.memberId?.fullName || loan.memberId?.name || 'Group Member'}</td>
                    <td className="px-4 py-3 text-slate-600">{loan.loanTypeId?.name || 'Standard Loan'}</td>
                    <td className="px-4 py-3 font-bold text-teal-800">{formatCurrency(loan.requestedAmount || loan.principalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800">
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleForwardLoan(loan._id)}
                          disabled={forwardingLoanId === loan._id}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold inline-flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                          title="Forward with recommendation to Branch Manager"
                        >
                          {forwardingLoanId === loan._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileCheck className="w-3.5 h-3.5 text-teal-200" />
                          )}
                          <span>Forward to BM</span>
                        </button>
                        
                        <Link
                          to={`/loans/details/${loan._id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View Loan Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. GROUP LOAN EMI RECOVERY & SAVINGS AUTO-DEBIT DESK */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Group Loan EMI Recovery & Savings Auto-Debit Desk</span>
              </h2>
              <p className="text-xs text-slate-500">
                Collect installments or auto-deduct overdue amounts directly from member thrift savings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveEmiTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeEmiTab === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue EMIs ({overdueEmis.length})</span>
            </button>
            <button
              onClick={() => setActiveEmiTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeEmiTab === 'upcoming'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming Due ({upcomingEmis.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeEmiTab === 'overdue' ? (
          overdueEmis.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700">Zero Overdue EMIs in this group!</p>
              <p>All members are up to date with their loan repayments.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-rose-50/70 text-rose-950 uppercase tracking-wider font-bold border-b border-rose-100 text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Borrower</th>
                    <th className="px-4 py-3">Loan ID</th>
                    <th className="px-4 py-3">EMI #</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Principal / Int</th>
                    <th className="px-4 py-3">Overdue Amount</th>
                    <th className="px-4 py-3 text-right">Treasurer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {overdueEmis.map((emi) => (
                    <tr key={emi._id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div>{emi.memberId?.fullName || emi.memberId?.name || 'Member'}</div>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          {emi.memberId?.memberId || 'MEM-ID'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-800">
                        <Link to={`/loans/details/${emi.loanId?._id || emi.loanId}`} className="hover:underline">
                          {emi.loanId?.applicationId || 'LOAN-APP'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">#{emi.emiNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-rose-800">{formatDate(emi.dueDate)}</div>
                        <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {formatCurrency(emi.principalAmount)} + {formatCurrency(emi.interestAmount)}
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-rose-700 text-sm">
                        {formatCurrency(emi.emiAmount - (emi.paidAmount || 0))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEmiForTreasurerDeduction(emi)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                            title="Auto-Deduct this overdue EMI from borrower's savings"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Deduct from Savings</span>
                          </button>
                          <Link
                            to={`/loans/details/${emi.loanId?._id || emi.loanId}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="View Full Loan Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          upcomingEmis.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No upcoming EMIs due in the next 30 days.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-teal-50/70 text-teal-950 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Borrower</th>
                    <th className="px-4 py-3">Loan ID</th>
                    <th className="px-4 py-3">EMI #</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Principal / Int</th>
                    <th className="px-4 py-3">Amount Due</th>
                    <th className="px-4 py-3 text-right">Treasurer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {upcomingEmis.map((emi) => (
                    <tr key={emi._id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div>{emi.memberId?.fullName || emi.memberId?.name || 'Member'}</div>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          {emi.memberId?.memberId || 'MEM-ID'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-800">
                        <Link to={`/loans/details/${emi.loanId?._id || emi.loanId}`} className="hover:underline">
                          {emi.loanId?.applicationId || 'LOAN-APP'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">#{emi.emiNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {formatDate(emi.dueDate)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {formatCurrency(emi.principalAmount)} + {formatCurrency(emi.interestAmount)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-900 text-sm">
                        {formatCurrency(emi.emiAmount - (emi.paidAmount || 0))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEmiForTreasurerDeduction(emi)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                            title="Auto-Deduct this EMI from borrower's savings"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Deduct from Savings</span>
                          </button>
                          <Link
                            to={`/loans/details/${emi.loanId?._id || emi.loanId}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="View Full Loan Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 0: TREASURER AUTO-DEDUCT EMI FROM SAVINGS */}
      {/* ========================================================================= */}
      {selectedEmiForTreasurerDeduction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-amber-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Auto-Deduct EMI from Savings</h3>
                  <p className="text-xs text-slate-500">
                    Directly recover installment from borrower's thrift account.
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEmiForTreasurerDeduction(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-bold text-slate-900">
                  {selectedEmiForTreasurerDeduction.memberId?.fullName || selectedEmiForTreasurerDeduction.memberId?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Application:</span>
                <span className="font-mono font-bold text-teal-800">
                  {selectedEmiForTreasurerDeduction.loanId?.applicationId || 'LOAN-APP'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Installment:</span>
                <span className="font-mono font-bold text-slate-900">
                  EMI #{selectedEmiForTreasurerDeduction.emiNumber} (Due {formatDate(selectedEmiForTreasurerDeduction.dueDate)})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Deduction Amount:</span>
                <span className="font-mono font-black text-rose-700 text-sm">
                  {formatCurrency(selectedEmiForTreasurerDeduction.emiAmount - (selectedEmiForTreasurerDeduction.paidAmount || 0))}
                </span>
              </div>
            </div>

            <form onSubmit={handleTreasurerAutoDeduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Remarks / Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Authorized by Treasurer in weekly SHG meeting"
                  value={treasurerDeductionRemarks}
                  onChange={(e) => setTreasurerDeductionRemarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEmiForTreasurerDeduction(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTreasurerDeducting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isTreasurerDeducting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm Auto-Debit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DEPOSIT MONEY */}
      {/* ========================================================================= */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
                  <Wallet className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Deposit Money</h3>
                  <p className="text-xs text-slate-500">Group: <strong className="text-teal-900">{activeGroup?.groupName}</strong></p>
                </div>
              </div>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePersonalDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Deposit Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 500"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-base font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Mode *</label>
                <select
                  value={depositForm.paymentMethod}
                  onChange={(e) => setDepositForm({ ...depositForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="Cash">Cash at Treasury</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="Bank Transfer">Bank NEFT/IMPS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">UTR / Reference No.</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-12345678"
                  value={depositForm.referenceNumber}
                  onChange={(e) => setDepositForm({ ...depositForm, referenceNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-xs font-medium text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
                >
                  {submittingModal && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Deposit</span>
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
                  <p className="text-xs text-slate-500">Available Balance: <span className="font-mono font-bold text-teal-800">{formatCurrency(myBalance)}</span></p>
                </div>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePersonalWithdrawal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Withdrawal Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={myBalance}
                  step="1"
                  placeholder="e.g. 1000"
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
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI Payout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for Withdrawal</label>
                <input
                  type="text"
                  placeholder="e.g. Personal expenditure"
                  value={withdrawForm.reason}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-2"
                >
                  {submittingModal && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Withdrawal</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default GroupTreasurerDashboard;
