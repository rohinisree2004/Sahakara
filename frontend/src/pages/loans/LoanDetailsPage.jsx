import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  fetchLoanById, 
  fetchLoanCibilScoreApi, 
  resubmitLoanApi,
  fetchEmiSchedule,
  deductEmiFromSavingsApi,
  recordRepaymentApi,
  closeLoanAccountApi
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Banknote, 
  Calendar, 
  Activity, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Upload,
  Building2,
  GitBranch,
  Percent,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Award,
  AlertCircle,
  HelpCircle,
  Edit3,
  Wallet,
  BookOpen,
  Lock,
  Coins,
  DollarSign,
  ArrowRight,
  Sparkles,
  Check,
  X
} from 'lucide-react';

const LoanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeGroup } = useAuth();
  
  const [loanData, setLoanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingCibil, setRefreshingCibil] = useState(false);

  // EMI & Repayment Schedule State
  const [emiData, setEmiData] = useState(null);
  const [emiLoading, setEmiLoading] = useState(false);

  // Auto-Deduct from Savings Modal State
  const [selectedEmiForDeduction, setSelectedEmiForDeduction] = useState(null);
  const [deductionRemarks, setDeductionRemarks] = useState('');
  const [isDeductingSavings, setIsDeductingSavings] = useState(false);
  const [deductionError, setDeductionError] = useState('');
  const [deductionSuccess, setDeductionSuccess] = useState('');

  // Cash / Manual Repayment Modal State
  const [selectedEmiForPayment, setSelectedEmiForPayment] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'Cash', referenceNumber: '', remarks: '' });
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  // Resubmit Modal State
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  const [resubmitForm, setResubmitForm] = useState({
    requestedAmount: '',
    tenure: '',
    purpose: '',
    remarks: ''
  });
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState('');
  const [resubmitSuccess, setResubmitSuccess] = useState('');

  // Close Loan Modal State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closureRemarks, setClosureRemarks] = useState('');
  const [settleRemainingChecked, setSettleRemainingChecked] = useState(false);
  const [isClosingLoan, setIsClosingLoan] = useState(false);
  const [closeLoanError, setCloseLoanError] = useState('');
  const [closeLoanSuccess, setCloseLoanSuccess] = useState('');

  const loadDetails = async () => {
    try {
      const response = await fetchLoanById(id);
      if (response.data && response.data.success) {
        setLoanData(response.data.data);
        const l = response.data.data.loan;
        setResubmitForm({
          requestedAmount: l.requestedAmount || l.principalAmount || '',
          tenure: l.tenure || l.tenureMonths || '',
          purpose: l.purpose || '',
          remarks: l.remarks || ''
        });

        // Load EMI schedule if loan is Active, Disbursed, or Closed
        if (l.status === 'Active' || l.status === 'Disbursed' || l.status === 'Closed') {
          loadEmiSchedule();
        }
      } else if (response.data && response.data.loan) {
        setLoanData(response.data);
      }
    } catch (error) {
      console.error('Failed to load loan details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmiSchedule = async () => {
    try {
      setEmiLoading(true);
      const res = await fetchEmiSchedule(id);
      if (res.data && res.data.success) {
        setEmiData(res.data.data);
      }
    } catch (err) {
      console.warn('EMI schedule load failed or not applicable:', err.message);
    } finally {
      setEmiLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleRefreshCibil = async () => {
    setRefreshingCibil(true);
    try {
      const res = await fetchLoanCibilScoreApi(id);
      if (res.data && res.data.success) {
        loadDetails();
      }
    } catch (err) {
      console.error('Failed to refresh CIBIL report', err);
    } finally {
      setRefreshingCibil(false);
    }
  };

  // Execute Savings Auto-Debit
  const handleDeductSavingsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmiForDeduction) return;
    setIsDeductingSavings(true);
    setDeductionError('');
    setDeductionSuccess('');
    try {
      const res = await deductEmiFromSavingsApi({
        loanId: id,
        emiNumber: selectedEmiForDeduction.emiNumber,
        remarks: deductionRemarks || `Auto-deducted in SHG weekly meeting for installment #${selectedEmiForDeduction.emiNumber}`
      });
      if (res.data && res.data.success) {
        setDeductionSuccess(res.data.message || 'Installment auto-deducted from savings successfully!');
        setTimeout(() => {
          setSelectedEmiForDeduction(null);
          setDeductionRemarks('');
          setDeductionSuccess('');
          loadDetails();
          loadEmiSchedule();
        }, 1200);
      }
    } catch (err) {
      setDeductionError(err.response?.data?.error || err.message || 'Failed to auto-deduct installment.');
    } finally {
      setIsDeductingSavings(false);
    }
  };

  // Record Manual Repayment (Cash/UPI)
  const handleManualPaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmiForPayment || !payForm.amount) return;
    setIsPaying(true);
    setPayError('');
    setPaySuccess('');
    try {
      const res = await recordRepaymentApi({
        loanId: id,
        emiNumber: selectedEmiForPayment.emiNumber,
        amount: Number(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        referenceNumber: payForm.referenceNumber,
        remarks: payForm.remarks
      });
      if (res.data && res.data.success) {
        setPaySuccess('Repayment recorded successfully!');
        setTimeout(() => {
          setSelectedEmiForPayment(null);
          setPayForm({ amount: '', paymentMethod: 'Cash', referenceNumber: '', remarks: '' });
          setPaySuccess('');
          loadDetails();
          loadEmiSchedule();
        }, 1200);
      }
    } catch (err) {
      setPayError(err.response?.data?.error || err.message || 'Failed to record repayment.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleResubmitSubmit = async (e) => {
    e.preventDefault();
    setIsResubmitting(true);
    setResubmitError('');
    setResubmitSuccess('');
    try {
      const res = await resubmitLoanApi(id, resubmitForm);
      if (res.data && res.data.success) {
        setResubmitSuccess('Application corrected and resubmitted successfully!');
        setTimeout(() => {
          setIsResubmitOpen(false);
          loadDetails();
        }, 1200);
      }
    } catch (err) {
      setResubmitError(err.response?.data?.message || err.message || 'Failed to resubmit application');
    } finally {
      setIsResubmitting(false);
    }
  };

  // Handle Formal Loan Account Closure (Treasurer, President, Admin)
  const handleCloseLoanSubmit = async (e) => {
    e.preventDefault();
    setIsClosingLoan(true);
    setCloseLoanError('');
    setCloseLoanSuccess('');
    try {
      const res = await closeLoanAccountApi(id, {
        remarks: closureRemarks || 'Formally closed by Treasurer / Executive.',
        settleRemaining: settleRemainingChecked
      });
      if (res.data && res.data.success) {
        setCloseLoanSuccess(res.data.message || 'Loan account closed successfully with zero outstanding balance!');
        setTimeout(() => {
          setIsCloseModalOpen(false);
          setCloseLoanSuccess('');
          loadDetails();
          loadEmiSchedule();
        }, 1200);
      }
    } catch (err) {
      setCloseLoanError(err.response?.data?.error || err.message || 'Failed to close loan.');
    } finally {
      setIsClosingLoan(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!loanData || !loanData.loan) {
    return (
      <div className="text-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto">
        <p className="text-sm font-bold text-rose-600">Loan application record not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const { loan, reviews = [], documents = [], eligibilitySnapshot } = loanData;
  const cibil = loan.cibilReport || {};

  const activeRole = activeGroup?.role || user?.role || 'Member';
  const isSocietyStaff = ['Super Admin', 'Organization Admin', 'Org Admin', 'Branch Manager', 'Employee'].includes(user?.role);
  const isGroupExecutive = ['President', 'Secretary', 'Treasurer'].includes(activeRole);
  const canViewCibil = isSocietyStaff || isGroupExecutive;

  // Authorization for Auto-Deducting from Savings and Closing Loan
  const canDeductSavings = ['Treasurer', 'President', 'Branch Manager', 'Organization Admin', 'Super Admin'].includes(activeRole) ||
                           ['Super Admin', 'Organization Admin', 'Branch Manager'].includes(user?.role);

  const canCloseLoan = ['Treasurer', 'President', 'Branch Manager', 'Organization Admin', 'Super Admin'].includes(activeRole) ||
                       ['Super Admin', 'Organization Admin', 'Branch Manager'].includes(user?.role);

  const canReview = user.role !== 'Member' && (loan.status === 'Pending' || loan.status === 'Under Review');
  const canApprove = (user.role === 'Super Admin' || user.role === 'Organization Admin' || user.role === 'Branch Manager') && (loan.status === 'Recommended' || loan.status === 'Under Review');
  const canDisburse = user.role !== 'Member' && loan.status === 'Approved';
  const isApplicant = user._id === (loan.memberId?.userId || loan.memberId?._id || loan.createdBy);

  const getScoreColorClass = (score) => {
    if (!score) return 'text-slate-500 bg-slate-50 border-slate-200';
    if (score >= 750) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 700) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 650) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (score >= 600) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getEmiStatusBadge = (status, dueDate) => {
    const isPastDue = dueDate && new Date(dueDate) < new Date();
    if (status === 'Paid' || status === 'Auto-Deducted from Savings') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
        </span>
      );
    }
    if (status === 'Overdue' || isPastDue) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-600" /> Overdue
        </span>
      );
    }
    if (status === 'Due') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" /> Due Now
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
        Upcoming
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)} 
            className="text-xs font-bold text-slate-500 hover:text-teal-800 flex items-center gap-1 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <Banknote className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Loan Application Dossier</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono font-bold">
                  {loan.applicationId}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive credit appraisal, EMI installment management, and recovery ledger
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
            loan.status === 'Active' || loan.status === 'Disbursed'
              ? 'bg-teal-50 text-teal-800 border-teal-200'
              : loan.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : loan.status === 'Returned'
              ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
              : loan.status === 'Pending' || loan.status === 'Under Review'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : loan.status === 'Closed'
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {loan.status === 'Returned' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
            {loan.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            {loan.status === 'Closed' && <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{loan.status === 'Returned' ? 'Returned for Correction' : loan.status}</span>
          </span>
          
          {loan.status === 'Returned' && (
            <button 
              onClick={() => setIsResubmitOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Correct & Resubmit</span>
            </button>
          )}

          {canReview && (
            <Link to={`/loans/review/${loan._id}`} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs">
              Process Review
            </Link>
          )}
          {canApprove && (
            <Link to={`/loans/approve/${loan._id}`} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs">
              Sanction & Approve
            </Link>
          )}
          {canDisburse && (
            <Link to={`/loans/disburse/${loan._id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs">
              Disburse Funds
            </Link>
          )}

          {(loan.status === 'Active' || loan.status === 'Disbursed') && canCloseLoan && (
            <button
              onClick={() => {
                setIsCloseModalOpen(true);
                setCloseLoanError('');
                setCloseLoanSuccess('');
                setClosureRemarks('All dues settled; loan formally closed.');
                setSettleRemainingChecked(false);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Close Loan Account</span>
            </button>
          )}
        </div>
      </div>

      {/* LOAN FORMALLY CLOSED ALERT BANNER */}
      {loan.status === 'Closed' && (
        <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                Loan Account Formally Closed
              </h3>
              <p className="text-xs text-emerald-800">
                All installments and dues are fully settled. Outstanding balance: <span className="font-mono font-bold">₹0</span>.
              </p>
            </div>
          </div>
          {loan.closureRemarks && (
            <div className="bg-white/90 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-medium">
              <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider block">
                Closure Audit Notes:
              </span>
              <p className="italic">"{loan.closureRemarks}"</p>
              {loan.closureDate && (
                <p className="text-[10px] text-emerald-700 pt-1 font-mono">
                  Closed on: {formatDate(loan.closureDate)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* RETURNED FOR CORRECTION ALERT BANNER */}
      {loan.status === 'Returned' && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                  Application Returned for Correction
                </h3>
                <p className="text-xs text-amber-800">
                  The credit committee or executive has requested corrections before this application can be approved.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsResubmitOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Correct & Resubmit Now</span>
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
            <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
              Reviewer Notes / Requested Changes:
            </span>
            <p className="italic">
              "{loan.returnReason || loan.remarks || 'Please review application amount and verify guarantor details.'}"
            </p>
            {loan.returnedDate && (
              <p className="text-[10px] text-amber-700 pt-1 font-mono">
                Returned on: {formatDate(loan.returnedDate)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Financials, EMI Schedule & Bureau Report */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Financial Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Banknote className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Financial Breakdown & Sanction Terms
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Requested</p>
                <p className="text-xl font-mono font-black text-slate-900 mt-0.5">{formatCurrency(loan.requestedAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sanctioned</p>
                <p className="text-xl font-mono font-black text-teal-800 mt-0.5">{formatCurrency(loan.approvedAmount || loan.requestedAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Disbursed</p>
                <p className="text-xl font-mono font-black text-cyan-700 mt-0.5">{formatCurrency(loan.disbursedAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Outstanding</p>
                <p className="text-xl font-mono font-black text-emerald-800 mt-0.5">{formatCurrency(loan.outstandingAmount !== undefined ? loan.outstandingAmount : loan.requestedAmount)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-5 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Loan Scheme</p>
                <p className="font-bold text-slate-900 mt-0.5">{loan.loanTypeId?.name || 'Micro Credit'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Interest Rate</p>
                <p className="font-bold text-teal-800 mt-0.5">{loan.interestRate || 12}% p.a.</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Tenure</p>
                <p className="font-bold text-slate-900 mt-0.5">{loan.tenure || 12} Months</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Application Date</p>
                <p className="font-bold text-slate-900 mt-0.5">{formatDate(loan.applicationDate || loan.createdAt)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Purpose of Loan</p>
              <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium">
                {loan.purpose || 'General agriculture / livelihood activities'}
              </p>
            </div>

            {loan.remarks && (
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Remarks & Guarantee Notes</p>
                <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium">
                  {loan.remarks}
                </p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* EMI REPAYMENT SCHEDULE & SAVINGS AUTO-DEDUCTION LEDGER */}
          {/* ========================================================================= */}
          {(loan.status === 'Active' || loan.status === 'Disbursed' || loan.status === 'Closed' || emiData) && (
            <div className="bg-white border-2 border-teal-200/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>EMI Repayment Schedule & Due Dates</span>
                      {emiData?.summary?.overdueCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 animate-pulse">
                          {emiData.summary.overdueCount} Overdue
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track installment deadlines, payments, and execute treasurer savings auto-deductions.
                    </p>
                  </div>
                </div>

                {/* Linked Borrower Savings Account Badge */}
                {emiData?.savingsAccount && (
                  <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-teal-700 shrink-0" />
                      <div>
                        <span className="text-[10px] text-teal-800 uppercase font-bold block">Borrower Thrift Savings A/c</span>
                        <span className="font-mono font-bold text-slate-900">{emiData.savingsAccount.accountNumber}</span>
                        <span className="ml-2 font-mono font-bold text-teal-800">
                          (Bal: {formatCurrency(emiData.savingsAccount.currentBalance)})
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/passbook/${emiData.savingsAccount._id}`}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-xs"
                      title="Open this specific savings account passbook ledger"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Passbook</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Summary KPIs */}
              {emiData?.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Repayable</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(emiData.summary.totalPayable)}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Paid</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {formatCurrency(emiData.summary.totalPaid)}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 uppercase font-bold block">Current Balance</span>
                    <span className="font-mono font-black text-amber-900 text-sm">
                      {formatCurrency(emiData.summary.outstandingBalance)}
                    </span>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-200">
                    <span className="text-[10px] text-teal-800 uppercase font-bold block">Next Installment</span>
                    <span className="font-mono font-bold text-teal-900 text-xs">
                      {emiData.summary.nextEmi 
                        ? `${formatCurrency(emiData.summary.nextEmi.emiAmount)} on ${formatDate(emiData.summary.nextEmi.dueDate)}`
                        : 'Fully Settled ✓'}
                    </span>
                  </div>
                </div>
              )}

              {/* Installment Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">EMI #</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-3">Principal</th>
                      <th className="py-3 px-3">Interest</th>
                      <th className="py-3 px-3">Total Due</th>
                      <th className="py-3 px-3">Paid</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {emiLoading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-2" />
                          <span>Loading repayment installments...</span>
                        </td>
                      </tr>
                    ) : !emiData?.schedule || emiData.schedule.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-400">
                          No EMI installments generated yet for this loan.
                        </td>
                      </tr>
                    ) : (
                      emiData.schedule.map((emi) => {
                        const isSettled = emi.status === 'Paid' || emi.status === 'Waived' || emi.status === 'Auto-Deducted from Savings';
                        const isOverdue = emi.status === 'Overdue' || (new Date(emi.dueDate) < new Date() && !isSettled);
                        const canAutoDeduct = canDeductSavings && !isSettled;
                        const savingsBal = emiData?.savingsAccount?.currentBalance || 0;
                        const hasEnoughSavings = savingsBal >= (emi.emiAmount - (emi.paidAmount || 0));

                        return (
                          <tr key={emi._id} className={`hover:bg-slate-50/70 transition-colors ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                              #{emi.emiNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{formatDate(emi.dueDate)}</div>
                              {emi.paidDate && (
                                <div className="text-[10px] text-emerald-700 font-mono">
                                  Paid: {formatDate(emi.paidDate)}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-700">
                              {formatCurrency(emi.principalAmount)}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-700">
                              {formatCurrency(emi.interestAmount)}
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                              {formatCurrency(emi.emiAmount)}
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-emerald-800">
                              {formatCurrency(emi.paidAmount || 0)}
                            </td>
                            <td className="py-3.5 px-3">
                              {getEmiStatusBadge(emi.status, emi.dueDate)}
                              {emi.paymentMethod && (
                                <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                                  {emi.paymentMethod}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              {isSettled ? (
                                <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Paid
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Treasurer / Executive Auto-Debit from Savings Button */}
                                  {canAutoDeduct && (
                                    <button
                                      onClick={() => setSelectedEmiForDeduction(emi)}
                                      disabled={!hasEnoughSavings}
                                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 ${
                                        hasEnoughSavings 
                                          ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer' 
                                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      }`}
                                      title={hasEnoughSavings ? "Deduct EMI directly from member's savings" : "Insufficient member savings balance"}
                                    >
                                      <Wallet className="w-3 h-3" />
                                      <span>Auto-Deduct</span>
                                    </button>
                                  )}

                                  {/* Manual Pay Button */}
                                  <button
                                    onClick={() => {
                                      setSelectedEmiForPayment(emi);
                                      setPayForm(prev => ({ ...prev, amount: emi.emiAmount - (emi.paidAmount || 0) }));
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[11px] transition-all cursor-pointer"
                                  >
                                    Pay EMI
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CIBIL CREDIT SCORE & BUREAU REPORT CARD (Staff & Executives Only) */}
          {canViewCibil && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    CIBIL Bureau Credit Score Report
                  </h3>
                </div>
                <button
                  onClick={handleRefreshCibil}
                  disabled={refreshingCibil}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshingCibil ? 'animate-spin' : ''}`} />
                  <span>Refresh Score</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                {/* Score Gauge Display */}
                <div className={`p-5 rounded-2xl border text-center space-y-1 ${getScoreColorClass(loan.cibilScore)}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Credit Bureau Score
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono">
                    {loan.cibilScore || '745'}
                    <span className="text-xs font-normal opacity-70"> / 900</span>
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/80 border border-current shadow-2xs">
                    {cibil.rating || 'Good (Prime)'}
                  </div>
                </div>

                {/* Bureau Risk Factors Breakdown */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">On-Time Payments</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {cibil.factors?.onTimePaymentRate || '98.5%'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Credit Utilization</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {cibil.factors?.creditUtilization || '22%'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Accounts</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {cibil.factors?.activeCreditAccounts || 2} Lines
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Credit Age</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {cibil.factors?.creditAgeYears || '3.5 yrs'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Recent Inquiries</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {cibil.factors?.recentInquiries ?? 1}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Level</span>
                    <span className="font-bold text-teal-800 text-xs">
                      {cibil.riskLevel || 'Low Risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary & Recommendation */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <p className="text-slate-700 font-medium">
                  <strong>Bureau Analysis:</strong> {cibil.summary || 'Strong repayment track record with zero write-offs in last 24 months.'}
                </p>
                <p className="text-[11px] text-teal-800 font-bold">
                  ✓ Underwriting Recommendation: {cibil.recommendation || 'Credit profile satisfies standard society credit underwriting criteria.'}
                </p>
              </div>
            </div>
          )}

          {/* Eligibility Snapshot */}
          {eligibilitySnapshot && (
            <div className="bg-white border border-teal-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 bg-teal-50/20">
              <div className="flex items-center gap-2 border-b border-teal-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-teal-950 uppercase tracking-wider">
                  Automated Credit Assessment Snapshot
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Member Savings</p>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {formatCurrency(eligibilitySnapshot.details?.totalSavings)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Current Liabilities</p>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {formatCurrency(eligibilitySnapshot.details?.totalOutstanding)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Savings Multiple (10x)</p>
                  <p className="font-mono font-bold text-teal-800 text-sm mt-0.5">
                    {formatCurrency(eligibilitySnapshot.details?.maxEligibleBasedOnSavings)}
                  </p>
                </div>
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200">
                  <p className="text-[10px] text-teal-800 font-bold uppercase">Adjusted Max Cap</p>
                  <p className="font-mono font-black text-teal-900 text-sm mt-0.5">
                    {formatCurrency(eligibilitySnapshot.details?.adjustedMaxEligible)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Audit / Review History */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Review & Authorization Log
              </h3>
            </div>

            {reviews.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No review logs recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`font-bold ${
                          rev.action === 'Returned for Correction' ? 'text-amber-900' :
                          rev.action === 'Approved' ? 'text-emerald-800' :
                          rev.action === 'Rejected' ? 'text-rose-800' : 'text-slate-900'
                        }`}>
                          {rev.action}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          by {rev.reviewerId?.name || rev.reviewerId?.username || 'Staff'} ({rev.reviewerId?.role || 'Reviewer'})
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(rev.createdAt || rev.reviewedAt)}</span>
                    </div>
                    {rev.remarks && (
                      <p className="text-slate-700 font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                        {rev.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Member Profile & Documents */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Member Profile Widget */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Applicant Details
              </h3>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xl">
                {loan.memberId?.fullName?.charAt(0) || 'M'}
              </div>
              <div>
                <Link to={`/members/profile/${loan.memberId?._id}`} className="font-bold text-slate-900 text-base hover:text-teal-800 transition-colors">
                  {loan.memberId?.fullName}
                </Link>
                <p className="text-xs text-slate-500 font-mono">{loan.memberId?.memberId}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-bold text-slate-900">{loan.memberId?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Society:</span>
                <span className="font-bold text-slate-900">{loan.organizationId?.name || 'Cooperative Society'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch:</span>
                <span className="font-bold text-slate-900">{loan.branchId?.branchName || 'Main Branch'}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <Link 
                to={emiData?.savingsAccount?._id ? `/passbook/${emiData.savingsAccount._id}` : `/passbook?memberId=${loan.memberId?._id || loan.memberId}`} 
                className="w-full block text-center bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                View Savings Passbook
              </Link>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Attached KYC & Docs
                </h3>
              </div>
              {user.role !== 'Member' && (
                <Link to={`/loans/documents/${loan._id}`} className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1">
                  <Upload className="w-3 h-3"/> Manage
                </Link>
              )}
            </div>
            
            {documents.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">No loan documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doc.documentType}</span>
                    </div>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-800 hover:underline">
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AUTO-DEDUCT EMI FROM BORROWER SAVINGS */}
      {/* ========================================================================= */}
      {selectedEmiForDeduction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Auto-Debit EMI from Member Savings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recover overdue/pending installment directly from borrower's thrift account.
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEmiForDeduction(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {deductionError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deductionError}</span>
              </div>
            )}

            {deductionSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{deductionSuccess}</span>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-bold text-slate-900">{loan.memberId?.fullName} ({loan.memberId?.memberId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thrift Savings Account:</span>
                <span className="font-mono font-bold text-slate-900">{emiData?.savingsAccount?.accountNumber || 'Primary Account'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Available Savings Balance:</span>
                <span className="font-mono font-bold text-teal-800">{formatCurrency(emiData?.savingsAccount?.currentBalance)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Installment #{selectedEmiForDeduction.emiNumber} (Due {formatDate(selectedEmiForDeduction.dueDate)}):</span>
                <span className="font-mono font-black text-rose-700 text-sm">
                  {formatCurrency(selectedEmiForDeduction.emiAmount - (selectedEmiForDeduction.paidAmount || 0))}
                </span>
              </div>
            </div>

            <form onSubmit={handleDeductSavingsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Treasurer Remarks / Transaction Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authorized by Group Treasurer as per assembly schedule"
                  value={deductionRemarks}
                  onChange={(e) => setDeductionRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEmiForDeduction(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeductingSavings}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeductingSavings ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5" />
                  )}
                  <span>Execute Auto-Deduction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUAL / CASH EMI REPAYMENT */}
      {/* ========================================================================= */}
      {selectedEmiForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-teal-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Record EMI Payment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Loan {loan.applicationId} • Installment #{selectedEmiForPayment.emiNumber}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEmiForPayment(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {payError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
                {payError}
              </div>
            )}

            {paySuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                {paySuccess}
              </div>
            )}

            <form onSubmit={handleManualPaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode *</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="Cash">Cash at Treasury / Meeting</option>
                  <option value="UPI">UPI / Digital QR</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receipt / UTR Reference No.</label>
                <input
                  type="text"
                  placeholder="e.g. REC-8941 or UPI-402910"
                  value={payForm.referenceNumber}
                  onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEmiForPayment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Confirm EMI Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESUBMISSION MODAL */}
      {isResubmitOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Correct & Resubmit Application
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {loan.applicationId} • Cycle #{((loan.resubmissionCount || 0) + 1)}
                </p>
              </div>
            </div>

            {resubmitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
                {resubmitError}
              </div>
            )}

            {resubmitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                {resubmitSuccess}
              </div>
            )}

            <form onSubmit={handleResubmitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requested Principal Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={resubmitForm.requestedAmount}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, requestedAmount: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tenure (Months) *
                </label>
                <input
                  type="number"
                  required
                  value={resubmitForm.tenure}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, tenure: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Purpose of Loan *
                </label>
                <input
                  type="text"
                  required
                  value={resubmitForm.purpose}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, purpose: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correction Clarifications & Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Explain the changes or adjustments you made based on reviewer feedback..."
                  value={resubmitForm.remarks}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, remarks: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResubmitOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isResubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5" /> Submit Corrections</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLOSE LOAN ACCOUNT (TREASURER / PRESIDENT / ADMIN) */}
      {/* ========================================================================= */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-400 font-bold shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Close Loan Account</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {loan.applicationId} • {loan.memberId?.fullName || loan.applicantName || 'Borrower'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCloseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {closeLoanError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{closeLoanError}</span>
              </div>
            )}

            {closeLoanSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{closeLoanSuccess}</span>
              </div>
            )}

            {/* Financial Status Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Principal Sanctioned:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(loan.principalAmount || loan.requestedAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Current Outstanding Balance:</span>
                <span className="font-mono font-black text-amber-900 text-sm">{formatCurrency(loan.outstandingAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Settled Installments:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {emiData?.schedule 
                    ? `${emiData.schedule.filter(e => e.status === 'Paid' || e.status === 'Waived' || e.status === 'Auto-Deducted from Savings').length} of ${emiData.schedule.length} Paid`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Warning if unpaid EMIs exist */}
            {emiData?.schedule && emiData.schedule.some(e => e.status !== 'Paid' && e.status !== 'Waived' && e.status !== 'Auto-Deducted from Savings') && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Unpaid Installments Remaining</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  There are still unpaid EMI installments on this loan schedule. To formally close this account, you can settle or waive the remaining installments.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-amber-950">
                  <input
                    type="checkbox"
                    checked={settleRemainingChecked}
                    onChange={(e) => setSettleRemainingChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span>Waive / Settle all remaining unpaid installments and close loan</span>
                </label>
              </div>
            )}

            <form onSubmit={handleCloseLoanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Closure Audit Remarks / Notes *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. All installments settled in full; formal loan account closed by Treasurer."
                  value={closureRemarks}
                  onChange={(e) => setClosureRemarks(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosingLoan}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isClosingLoan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-amber-400" />}
                  <span>Confirm Formal Loan Closure</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default LoanDetailsPage;
