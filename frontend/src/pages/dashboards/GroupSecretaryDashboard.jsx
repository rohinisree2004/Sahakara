import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchMeetingsList, 
  fetchMembersList, 
  fetchGroupsList,
  fetchSavingsAccounts,
  getLoans,
  submitDepositRequestApi,
  submitWithdrawalRequestApi,
  fetchGroupReports
} from '../../services/api';
import { 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Bell, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  ArrowRight,
  BookOpen,
  FileSpreadsheet,
  FileCheck,
  CreditCard,
  Plus,
  RefreshCw,
  ArrowDownRight,
  Download,
  AlertCircle,
  X,
  Wallet
} from 'lucide-react';

const GroupSecretaryDashboard = () => {
  const { user, activeGroup } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Personal Member Baseline Data
  const [myMember, setMyMember] = useState(null);
  const [mySavings, setMySavings] = useState(null);
  const [myLoans, setMyLoans] = useState([]);

  // Action States
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals for personal deposit / withdrawal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: '', paymentMethod: 'UPI', referenceNumber: '', notes: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', paymentMethod: 'Cash', reason: '' });
  const [submittingModal, setSubmittingModal] = useState(false);

  const loadSecretaryData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeGroup?._id) params.groupId = activeGroup._id;

      const [mRes, memRes, gRes, myMemRes] = await Promise.all([
        fetchMeetingsList(params).catch(() => ({ data: { success: true, data: [] } })),
        fetchMembersList(params).catch(() => ({ data: { success: true, data: [] } })),
        fetchGroupsList().catch(() => ({ data: { success: true, data: [] } })),
        fetchMembersList({ search: user?.phone || user?.email || user?.name }).catch(() => ({ data: { success: true, data: [] } }))
      ]);

      if (mRes.data && mRes.data.success) {
        setMeetings(mRes.data.data || []);
      }
      if (memRes.data && memRes.data.success) {
        setMembers(memRes.data.data || []);
      }
      if (gRes.data && gRes.data.success) {
        setGroups(gRes.data.data || []);
      }
      if (myMemRes.data && myMemRes.data.success) {
        const list = myMemRes.data.data || [];
        const resolved = list.find(m => m.userId === user?._id || m.phone === user?.phone || m.email === user?.email) || list[0] || null;
        setMyMember(resolved);
        if (resolved?._id) {
          fetchSavingsAccounts({ memberId: resolved._id }).then(sRes => {
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
      console.warn('Error loading secretary desk data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecretaryData();
  }, [user, activeGroup]);

  // Personal Deposit Request Submit
  const handlePersonalDeposit = async (e) => {
    e.preventDefault();
    if (!depositForm.amount || Number(depositForm.amount) <= 0) return;
    setSubmittingModal(true);
    try {
      const res = await submitDepositRequestApi({
        memberId: myMember?._id,
        groupId: activeGroup?._id,
        amount: Number(depositForm.amount),
        paymentMethod: depositForm.paymentMethod,
        referenceNumber: depositForm.referenceNumber,
        remarks: depositForm.notes || 'Personal Deposit Request'
      });
      if (res.data?.success) {
        setActionSuccess('Deposit request submitted! The Group Treasurer will process it into your passbook.');
        setShowDepositModal(false);
        setDepositForm({ amount: '', paymentMethod: 'UPI', referenceNumber: '', notes: '' });
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
        memberId: myMember?._id,
        groupId: activeGroup?._id,
        amount: Number(withdrawForm.amount),
        paymentMethod: withdrawForm.paymentMethod,
        remarks: withdrawForm.reason || 'Personal Withdrawal Request'
      });
      if (res.data?.success) {
        setActionSuccess('Withdrawal request submitted! It will be verified and disbursed by the Group Treasurer.');
        setShowWithdrawModal(false);
        setWithdrawForm({ amount: '', paymentMethod: 'Cash', reason: '' });
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to submit withdrawal.');
    } finally {
      setSubmittingModal(false);
    }
  };

  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'Scheduled' || new Date(m.scheduledDate) >= new Date()
  ).slice(0, 5);

  const myBalance = mySavings?.account?.currentBalance || 0;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

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
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-xs">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Group Secretary Secretarial Hub</span>
              </span>
              {activeGroup && (
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  {activeGroup.groupName}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Secretary Desk: {user?.name || 'Secretary'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Organize group assemblies, record minutes and attendance, create and export official group reports, and maintain your personal member savings account.
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
              to="/meetings/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule Assembly</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Alerts */}
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
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-blue-800 font-bold">My Personal Credit</span>
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
      {/* 2. SECRETARY KPI STATS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Members</span>
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            {members.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Active enrolled roster</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Assemblies</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            {upcomingMeetings.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Upcoming sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Reports</span>
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            5
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Ready for generation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            96%
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">High meeting compliance</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECRETARIAT REPORTS & ASSEMBLIES WORKSPACE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create & Generate Official Group Reports */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Official Group Reports & Statements</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Secretary Duty
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compile monthly thrift collection registers, loan repayment performance statements, member attendance summaries, and official balance sheets for the cooperative society.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">Monthly Thrift Statement</div>
                <div className="text-[10px] text-slate-500">Savings & deposits log</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">Attendance Register</div>
                <div className="text-[10px] text-slate-500">Assembly presence %</div>
              </div>
            </div>

            <Link
              to="/groups/reports"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Open Reports Studio & Export PDF/Excel</span>
            </Link>
          </div>
        </div>

        {/* Scheduled Group Assemblies & Minutes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-black text-slate-900">Upcoming Group Assemblies</h3>
            </div>
            <Link to="/meetings/dashboard" className="text-xs font-bold text-teal-700 hover:underline">
              View Calendar
            </Link>
          </div>

          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No scheduled assemblies found.</p>
              <p>Click below to schedule the next group assembly.</p>
              <div className="pt-2">
                <Link
                  to="/meetings/create"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Schedule Assembly Now</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingMeetings.map((m) => (
                <div key={m._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{new Date(m.scheduledDate).toLocaleDateString('en-IN')}</span>
                      <span>•</span>
                      <span>{m.location || 'Society Hall'}</span>
                    </p>
                  </div>
                  <Link
                    to={`/meetings/attendance`}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors shrink-0 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Attendance</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

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
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-base font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Payout Mode *</label>
                <select
                  value={withdrawForm.paymentMethod}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-bold text-slate-900 bg-white"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium text-slate-900"
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
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

export default GroupSecretaryDashboard;
