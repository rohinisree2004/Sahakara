import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  getLoans, 
  fetchEmiSchedule, 
  recordRepaymentApi,
  fetchOrganizations,
  fetchBranches,
  fetchGroups,
  fetchMembers
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Banknote, 
  Receipt, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  CreditCard, 
  User, 
  Calendar,
  Sparkles,
  Printer,
  Building2,
  GitBranch,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';

const RecordRepaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedLoanId = searchParams.get('loanId');
  const preSelectedEmi = searchParams.get('emiNumber') || searchParams.get('emi');

  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const defaultOrg = isSuperAdmin ? 'All' : (user?.organizationId?._id || user?.organizationId || '');
  const defaultBranch = isBranchScoped ? userBranchId : 'All';

  // Cascading scope filters
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedOrgId, setSelectedOrgId] = useState(defaultOrg);
  const [selectedBranchId, setSelectedBranchId] = useState(defaultBranch);
  const [selectedGroupId, setSelectedGroupId] = useState('All');
  const [selectedMemberId, setSelectedMemberId] = useState('All');

  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(preSelectedLoanId || '');
  const [loanDetails, setLoanDetails] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedEmiNumber, setSelectedEmiNumber] = useState(preSelectedEmi || '');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successTxn, setSuccessTxn] = useState(null);

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations().then(res => {
        if (res.data?.success) setOrganizations(res.data.data || []);
      }).catch(console.warn);
    }
  }, [isSuperAdmin]);

  // Load branches
  useEffect(() => {
    const params = {};
    if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
    if (isBranchScoped && userBranchId) params.branchId = userBranchId;
    fetchBranches(params).then(res => {
      if (res.data?.success) {
        const bList = res.data.data || [];
        setBranches(bList);
        if (isBranchScoped && userBranchId) {
          setSelectedBranchId(userBranchId);
        }
      }
    }).catch(console.warn);
  }, [selectedOrgId, isBranchScoped, userBranchId]);

  // Load groups
  useEffect(() => {
    const params = {};
    if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
    const effBranch = isBranchScoped ? userBranchId : selectedBranchId;
    if (effBranch && effBranch !== 'All') params.branchId = effBranch;

    fetchGroups(params).then(res => {
      if (res.data?.success) setGroups(res.data.data || []);
    }).catch(console.warn);
  }, [selectedOrgId, selectedBranchId, isBranchScoped, userBranchId]);

  // Load members
  useEffect(() => {
    const params = { limit: 200 };
    if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
    const effBranch = isBranchScoped ? userBranchId : selectedBranchId;
    if (effBranch && effBranch !== 'All') params.branchId = effBranch;
    if (selectedGroupId !== 'All') params.groupId = selectedGroupId;

    fetchMembers(params).then(res => {
      if (res.data?.success) setMembers(res.data.data || []);
    }).catch(console.warn);
  }, [selectedOrgId, selectedBranchId, selectedGroupId, isBranchScoped, userBranchId]);

  // Load active loans
  const loadActiveLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const params = { status: 'Active', limit: 100 };
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      const effBranch = isBranchScoped ? userBranchId : selectedBranchId;
      if (effBranch && effBranch !== 'All') params.branchId = effBranch;
      if (selectedGroupId !== 'All') params.groupId = selectedGroupId;
      if (selectedMemberId !== 'All') params.memberId = selectedMemberId;

      const res = await getLoans(params);
      if (res.data && res.data.success) {
        const loanList = res.data.data || [];
        setLoans(loanList);
        if (preSelectedLoanId && loanList.some(l => l._id === preSelectedLoanId)) {
          setSelectedLoanId(preSelectedLoanId);
        } else if (loanList.length > 0 && !selectedLoanId) {
          setSelectedLoanId(loanList[0]._id);
        }
      }
    } catch (err) {
      console.warn('Error fetching active loans:', err.message);
    } finally {
      setLoadingLoans(false);
    }
  }, [selectedOrgId, selectedBranchId, selectedGroupId, selectedMemberId, preSelectedLoanId, selectedLoanId, isBranchScoped, userBranchId]);

  useEffect(() => {
    loadActiveLoans();
  }, [loadActiveLoans]);

  // Fetch amortization schedule when loan is selected
  useEffect(() => {
    if (!selectedLoanId) {
      setLoanDetails(null);
      setSchedule([]);
      return;
    }

    const loadSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const res = await fetchEmiSchedule(selectedLoanId);
        if (res.data && res.data.success) {
          const payload = res.data.data;
          setLoanDetails(payload.loan);
          const fullSchedule = payload.schedule || [];
          setSchedule(fullSchedule);

          if (preSelectedEmi) {
            const targetEmi = fullSchedule.find(e => String(e.emiNumber) === String(preSelectedEmi));
            if (targetEmi) {
              setSelectedEmiNumber(targetEmi.emiNumber);
              setAmount(targetEmi.emiAmount - (targetEmi.paidAmount || 0));
            }
          } else {
            const pendingEmi = fullSchedule.find(e => e.status !== 'Paid' && e.status !== 'Waived');
            if (pendingEmi) {
              setSelectedEmiNumber(pendingEmi.emiNumber);
              setAmount(pendingEmi.emiAmount - (pendingEmi.paidAmount || 0));
            }
          }
        }
      } catch (err) {
        console.warn('Error loading schedule:', err.message);
      } finally {
        setLoadingSchedule(false);
      }
    };

    loadSchedule();
  }, [selectedLoanId, preSelectedEmi]);

  const handleEmiChange = (e) => {
    const emiNum = e.target.value;
    setSelectedEmiNumber(emiNum);
    const found = schedule.find(item => String(item.emiNumber) === String(emiNum));
    if (found) {
      setAmount(found.emiAmount - (found.paidAmount || 0));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoanId || !amount || Number(amount) <= 0) {
      setError('Please provide a valid loan and repayment amount.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        loanId: selectedLoanId,
        emiNumber: selectedEmiNumber ? Number(selectedEmiNumber) : undefined,
        amount: Number(amount),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        remarks: remarks.trim() || undefined
      };

      const res = await recordRepaymentApi(payload);
      if (res.data && res.data.success) {
        setSuccessTxn({
          ...res.data.data,
          loan: loanDetails,
          member: loanDetails?.memberId,
          amount: Number(amount),
          paymentMethod,
          referenceNumber
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to record repayment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Success Confirmation Screen
  if (successTxn) {
    return (
      <div className="max-w-xl mx-auto space-y-6 text-center py-8">
        <div className="w-16 h-16 bg-teal-50 border border-teal-200 text-teal-800 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-teal-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-slate-900">Repayment Voucher Credited</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Voucher Ref: <strong className="text-teal-800">{successTxn.transactionId || 'REP-SUCCESS'}</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs text-slate-500 font-bold uppercase">Borrower Member</span>
            <span className="font-bold text-slate-900 text-sm">
              {loanDetails?.memberId?.fullName || loanDetails?.memberId?.firstName} ({loanDetails?.memberId?.memberId})
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs text-slate-500 font-bold uppercase">Loan Application</span>
            <span className="font-bold font-mono text-teal-800">{loanDetails?.applicationId}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs text-slate-500 font-bold uppercase">Amount Credited</span>
            <span className="font-black text-lg font-mono text-teal-800">{formatCurrency(successTxn.amount)}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs text-slate-500 font-bold uppercase">Payment Channel</span>
            <span className="font-bold text-slate-800 text-xs">{paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase">Updated Loan Outstanding</span>
            <span className="font-bold font-mono text-slate-900">
              {formatCurrency(successTxn.balanceAfterTransaction)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Print Receipt</span>
          </button>
          
          <button
            onClick={() => {
              setSuccessTxn(null);
              setAmount('');
              setReferenceNumber('');
              setRemarks('');
              loadActiveLoans();
            }}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            Record Another Repayment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/repayments/dashboard"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Banknote className="w-7 h-7 text-teal-600" />
              <span>Record EMI Repayment</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Credit borrower installments, update amortization ledger, and post journal entries
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3 shadow-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Payment Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        
        {/* Hierarchical Filter Selection Bar */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>1. Borrower & Location Scope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {isSuperAdmin && (
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Society</label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  <option value="All">All Societies</option>
                  {organizations.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Branch</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={isBranchScoped}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {!isBranchScoped && <option value="All">All Branches</option>}
                {branches.map(b => <option key={b._id} value={b._id}>{b.branchName}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">SHG Group</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="All">All Groups</option>
                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Borrower Member</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="All">All Members</option>
                {members
                  .filter(m => {
                    const effBranch = isBranchScoped ? userBranchId : selectedBranchId;
                    if (effBranch && effBranch !== 'All') {
                      const mBranch = (m.branchId?._id || m.branchId)?.toString();
                      if (mBranch && mBranch !== effBranch.toString()) return false;
                    }
                    return true;
                  })
                  .map(m => (
                    <option key={m._id} value={m._id}>{m.fullName} ({m.memberId})</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 2. Loan Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              2. Target Active Loan Account * ({loans.length} available)
            </label>
            {loadingLoans ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>Loading active loans...</span>
              </div>
            ) : (
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                required
              >
                <option value="">-- Choose Active Loan Account --</option>
                {loans
                  .filter(loan => {
                    const effBranch = isBranchScoped ? userBranchId : selectedBranchId;
                    if (effBranch && effBranch !== 'All') {
                      const lBranch = (loan.branchId?._id || loan.branchId)?.toString();
                      if (lBranch && lBranch !== effBranch.toString()) return false;
                    }
                    return true;
                  })
                  .map((loan) => (
                    <option key={loan._id} value={loan._id}>
                      {loan.applicationId} — {loan.memberId?.fullName || loan.memberId?.firstName} [O/S: {formatCurrency(loan.outstandingAmount)}]
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* 3. Loan Dossier Snapshot */}
          {loanDetails && (
            <div className="p-5 rounded-2xl bg-teal-50/30 border border-teal-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {loanDetails.memberId?.fullName || loanDetails.memberId?.firstName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">Member ID: {loanDetails.memberId?.memberId}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold font-mono">
                  {loanDetails.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Sanctioned Principal</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{formatCurrency(loanDetails.approvedAmount || loanDetails.requestedAmount)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Outstanding Balance</span>
                  <div className="text-sm font-bold text-rose-700 font-mono mt-0.5">{formatCurrency(loanDetails.outstandingAmount)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Interest Rate</span>
                  <div className="text-sm font-bold text-teal-800 font-mono mt-0.5">{loanDetails.interestRate}% p.a.</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Tenure</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{loanDetails.tenure} Months</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Payment Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Installment Number *
              </label>
              <select
                value={selectedEmiNumber}
                onChange={handleEmiChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="">Next Due Installment</option>
                {schedule.map((emi) => (
                  <option key={emi.emiNumber} value={emi.emiNumber}>
                    EMI #{emi.emiNumber} ({formatCurrency(emi.emiAmount - (emi.paidAmount || 0))}) - {emi.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2500"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Payment Channel *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="Bank Transfer">Bank Transfer (UPI / IMPS / NEFT)</option>
                <option value="Cheque">Cheque</option>
                <option value="SHG Thrift Deduction">SHG Weekly Thrift Auto-Debit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Transaction / UTR Reference
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UPI-982138921"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Receipt Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Regular monthly installment collected at counter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/repayments/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
              <span>Post Repayment Voucher</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default RecordRepaymentPage;
