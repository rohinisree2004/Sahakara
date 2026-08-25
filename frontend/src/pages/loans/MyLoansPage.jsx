import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLoans } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Banknote, 
  AlertCircle, 
  Plus, 
  Calendar, 
  Clock, 
  Activity, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  TrendingUp, 
  Percent, 
  ShieldCheck, 
  RefreshCw,
  DollarSign
} from 'lucide-react';

const MyLoansPage = () => {
  const { user, activeGroup } = useAuth();
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadMyLoans = async () => {
    setIsLoading(true);
    try {
      // Backend automatically resolves the member's profile for the logged in user
      const response = await fetchLoans({ limit: 100, myOnly: 'true' });
      if (response.data && response.data.success) {
        setLoans(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load my loans', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      loadMyLoans();
    }
  }, [user, activeGroup]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Compute Metrics
  const activeLoans = loans.filter(l => ['Active', 'Disbursed'].includes(l.status));
  const returnedLoans = loans.filter(l => l.status === 'Returned');
  const pendingLoans = loans.filter(l => ['Pending', 'Under Review', 'Recommended', 'Draft'].includes(l.status));
  const approvedLoans = loans.filter(l => l.status === 'Approved');
  const closedLoans = loans.filter(l => l.status === 'Closed');
  const rejectedLoans = loans.filter(l => l.status === 'Rejected');

  const totalOutstanding = activeLoans.reduce((acc, curr) => acc + (curr.outstandingAmount || curr.principalAmount || curr.requestedAmount || 0), 0);
  const totalSanctioned = activeLoans.reduce((acc, curr) => acc + (curr.disbursedAmount || curr.approvedAmount || curr.principalAmount || curr.requestedAmount || 0), 0);

  // Filter List
  const filteredLoans = loans.filter(loan => {
    if (statusFilter === 'ACTIVE') return ['Active', 'Disbursed'].includes(loan.status);
    if (statusFilter === 'RETURNED') return loan.status === 'Returned';
    if (statusFilter === 'PENDING') return ['Pending', 'Under Review', 'Recommended', 'Draft'].includes(loan.status);
    if (statusFilter === 'APPROVED') return loan.status === 'Approved';
    if (statusFilter === 'CLOSED') return loan.status === 'Closed';
    if (statusFilter === 'REJECTED') return loan.status === 'Rejected';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Disbursed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-teal-50 text-teal-800 border border-teal-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
            Active & Disbursed
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved (Awaiting Payout)
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-xs animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Returned for Correction
          </span>
        );
      case 'Pending':
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case 'Under Review':
      case 'Recommended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-xs">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            Under Credit Appraisal
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            Fully Repaid / Closed
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-800 border border-rose-200 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Application Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold shadow-xs shrink-0">
            <Banknote className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Credit Accounts & Loans
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Personal borrowings, running EMI schedule, and real-time approval status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMyLoans}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold transition-all shadow-xs"
            title="Refresh Loans"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
          
          <Link 
            to="/loans/apply"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for New Loan</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Active Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-teal-900">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
            <span>Across {activeLoans.length} active loan accounts</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Sanctioned</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatCurrency(totalSanctioned)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Cumulative disbursed credit</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Under Review / Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700">
            {pendingLoans.length + approvedLoans.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {pendingLoans.length} in appraisal • {approvedLoans.length} approved
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Applications</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {loans.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {closedLoans.length} closed / repaid loans
          </p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            statusFilter === 'ALL'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Applications ({loans.length})
        </button>

        {returnedLoans.length > 0 && (
          <button
            onClick={() => setStatusFilter('RETURNED')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'RETURNED'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
          >
            <span>⚠️ Action Needed ({returnedLoans.length})</span>
          </button>
        )}

        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            statusFilter === 'ACTIVE'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Active Loans ({activeLoans.length})
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            statusFilter === 'PENDING'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Pending / Review ({pendingLoans.length})
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            statusFilter === 'APPROVED'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Approved ({approvedLoans.length})
        </button>

        <button
          onClick={() => setStatusFilter('CLOSED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            statusFilter === 'CLOSED'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Closed ({closedLoans.length})
        </button>

        {rejectedLoans.length > 0 && (
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Rejected ({rejectedLoans.length})
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="w-9 h-9 animate-spin text-teal-600" />
          <p className="text-xs font-bold text-slate-500">Loading your loan records & sanction applications...</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-xs space-y-3 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Banknote className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900">
            {statusFilter === 'ALL' ? 'No Credit Accounts or Applications Found' : `No ${statusFilter.toLowerCase()} loans found`}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {statusFilter === 'ALL' 
              ? 'You do not have any credit records in the cooperative society yet. Apply for a low-interest micro-credit or agricultural loan today.'
              : `You have no loan applications matching the selected '${statusFilter}' filter.`}
          </p>
          <div className="pt-3">
            <Link 
              to="/loans/apply" 
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Loan Application</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLoans.map(loan => {
            const reqAmt = loan.requestedAmount || loan.principalAmount || 0;
            const sanctionedAmt = loan.disbursedAmount || loan.approvedAmount || reqAmt;
            const outstanding = loan.outstandingAmount !== undefined ? loan.outstandingAmount : reqAmt;
            const tenureVal = loan.tenure || loan.tenureMonths || 12;
            const intRate = loan.interestRate || 11.5;
            const appDate = loan.applicationDate || loan.createdAt;

            // Repayment percentage
            const repaidAmt = Math.max(0, sanctionedAmt - outstanding);
            const repaidPercent = sanctionedAmt > 0 ? Math.min(100, Math.round((repaidAmt / sanctionedAmt) * 100)) : 0;

            return (
              <div 
                key={loan._id} 
                className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-soft-teal transition-all space-y-5 relative overflow-hidden ${
                  loan.status === 'Returned' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80 hover:border-teal-200'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Top Status & ID Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      {getStatusBadge(loan.status)}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      {loan.applicationId || 'LOAN-PENDING'}
                    </span>
                  </div>

                  {/* Scheme & Purpose */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {loan.loanTypeId?.name || 'Micro Credit Scheme'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                      Purpose: <span className="text-slate-700 font-medium not-italic">{loan.purpose || 'Personal / Business Needs'}</span>
                    </p>
                  </div>

                  {/* Financial Metrics Box */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Principal Applied</span>
                      <div className="text-lg font-black font-mono text-slate-900">
                        {formatCurrency(reqAmt)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {['Active', 'Disbursed'].includes(loan.status) ? 'Current Outstanding' : 'Sanction Amount'}
                      </span>
                      <div className={`text-lg font-black font-mono ${['Active', 'Disbursed'].includes(loan.status) ? 'text-teal-800' : 'text-slate-700'}`}>
                        {formatCurrency(['Active', 'Disbursed'].includes(loan.status) ? outstanding : sanctionedAmt)}
                      </div>
                    </div>
                  </div>

                  {/* Loan Repayment Progress Bar (for Active loans) */}
                  {['Active', 'Disbursed'].includes(loan.status) && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Repayment Progress</span>
                        <span className="text-teal-800 font-mono">{repaidPercent}% Repaid</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all"
                          style={{ width: `${repaidPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Applied: <strong className="text-slate-800">{new Date(appDate).toLocaleDateString('en-IN')}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Interest: <strong className="text-teal-800 font-mono">{intRate}% p.a.</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Tenure: <strong className="text-slate-800">{tenureVal} Months</strong></span>
                    </div>

                    {loan.branchId && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{loan.branchId.branchName || 'Branch'}</span>
                      </div>
                    )}
                  </div>

                  {/* RETURNED ALERT BOX */}
                  {loan.status === 'Returned' && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5">
                      <strong className="font-bold flex items-center gap-1.5 text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Action Required — Correction Requested:</span>
                      </strong>
                      <p className="text-[11px] text-amber-800 italic pl-5">
                        "{loan.returnReason || loan.remarks || 'Please verify amount or requested terms and resubmit.'}"
                      </p>
                    </div>
                  )}

                  {/* Rejection notice if rejected */}
                  {loan.status === 'Rejected' && loan.rejectionReason && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                      <strong className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Reason for Rejection:
                      </strong>
                      <p className="text-[11px] text-rose-800 leading-relaxed pl-4">
                        {loan.rejectionReason}
                      </p>
                    </div>
                  )}

                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-slate-100">
                  {loan.status === 'Returned' ? (
                    <Link 
                      to={`/loans/details/${loan._id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-amber-600/20"
                    >
                      <span>Correct & Resubmit Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link 
                      to={`/loans/details/${loan._id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-50/60 hover:bg-teal-100/80 text-teal-900 border border-teal-200/80 rounded-2xl font-bold text-xs transition-all shadow-2xs"
                    >
                      <span>View Sanction Details & Repayment Schedule</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
                    </Link>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyLoansPage;
