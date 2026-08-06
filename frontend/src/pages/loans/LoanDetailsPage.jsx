import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchLoanById } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, User, Banknote, Calendar, Activity, CheckCircle, Clock, XCircle, FileText, Upload } from 'lucide-react';

const LoanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loanData, setLoanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const response = await fetchLoanById(id);
        if (response.data.success) {
          setLoanData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load loan details', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadDetails();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    if (status === 'Active' || status === 'Disbursed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Approved' || status === 'Recommended') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (status === 'Rejected') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (status === 'Closed') return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!loanData || !loanData.loan) {
    return (
      <div className="text-center py-20">
        <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Loan Not Found</h2>
        <Link to="/loans/applications" className="text-emerald-400 hover:underline">Return to List</Link>
      </div>
    );
  }

  const { loan, reviews, documents, eligibilitySnapshot } = loanData;

  const canReview = user.role !== 'Member' && (loan.status === 'Pending' || loan.status === 'Under Review');
  const canApprove = (user.role === 'Super Admin' || user.role === 'Organization Admin') && loan.status === 'Recommended';
  const canDisburse = user.role !== 'Member' && loan.status === 'Approved';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Loan Application Details
            </h1>
            <p className="text-slate-400 mt-1 font-mono">APP ID: {loan.applicationId}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border ${getStatusColor(loan.status)}`}>
            {loan.status}
          </span>
          
          {canReview && (
            <Link to={`/loans/review/${loan._id}`} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              Process Review
            </Link>
          )}
          {canApprove && (
            <Link to={`/loans/approve/${loan._id}`} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              Approve Loan
            </Link>
          )}
          {canDisburse && (
            <Link to={`/loans/disburse/${loan._id}`} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              Disburse Funds
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Financials & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Financial Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" />
              Loan Financial Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">Requested Amount</p>
                <p className="text-xl font-bold text-white">{formatCurrency(loan.requestedAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Approved Amount</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(loan.approvedAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Disbursed Amount</p>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(loan.disbursedAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Outstanding Balance</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrency(loan.outstandingAmount)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-700/50">
              <div>
                <p className="text-xs text-slate-400 mb-1">Loan Type</p>
                <p className="text-sm font-semibold text-white">{loan.loanTypeId?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
                <p className="text-sm font-semibold text-white">{loan.interestRate}% p.a.</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Tenure</p>
                <p className="text-sm font-semibold text-white">{loan.tenure} Months</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Application Date</p>
                <p className="text-sm font-semibold text-white">{formatDate(loan.applicationDate)}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-xs text-slate-400 mb-1">Purpose of Loan</p>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">{loan.purpose}</p>
            </div>
            {loan.remarks && (
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-1">Additional Remarks</p>
                <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">{loan.remarks}</p>
              </div>
            )}
            {loan.rejectionReason && (
              <div className="mt-4">
                <p className="text-xs text-rose-400 mb-1 font-bold">Rejection Reason</p>
                <p className="text-sm text-rose-300 bg-rose-900/20 p-3 rounded-lg border border-rose-500/30">{loan.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Eligibility Snapshot (Only visible if pending/under review and user is staff) */}
          {eligibilitySnapshot && user.role !== 'Member' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Live Eligibility Snapshot
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Total Savings</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(eligibilitySnapshot.details?.totalSavings)}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Existing Outstanding</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(eligibilitySnapshot.details?.totalOutstanding)}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Raw Base Limit (10x)</p>
                  <p className="text-lg font-bold text-slate-300">{formatCurrency(eligibilitySnapshot.details?.maxEligibleBasedOnSavings)}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <p className="text-xs text-emerald-400 mb-1">Adjusted Max Eligible</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(eligibilitySnapshot.details?.adjustedMaxEligible)}</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg border flex items-center gap-3 ${eligibilitySnapshot.isEligible ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                {eligibilitySnapshot.isEligible ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                <span className="font-semibold text-sm">
                  {eligibilitySnapshot.isEligible ? 'Applicant meets system eligibility criteria for requested amount.' : `Applicant is NOT eligible: ${eligibilitySnapshot.reason}`}
                </span>
              </div>
            </div>
          )}

          {/* Audit / Review History */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Review & Audit History
            </h3>
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">No review history recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="relative pl-6 border-l-2 border-slate-700 pb-2 last:border-0 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-blue-500"></div>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">{rev.action}</p>
                          <p className="text-xs text-slate-400">by {rev.reviewerId?.fullName} ({rev.reviewerId?.role})</p>
                        </div>
                        <span className="text-xs text-slate-500">{formatDate(rev.reviewedAt)}</span>
                      </div>
                      <p className="text-sm text-slate-300 mt-2">{rev.remarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Member Info & Documents */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Member Profile Widget */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Applicant Info
            </h3>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
              {loan.memberId?.profileImage ? (
                <img src={loan.memberId.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-2xl border-2 border-slate-600">
                  {loan.memberId?.fullName?.charAt(0) || 'M'}
                </div>
              )}
              <div>
                <Link to={`/members/profile/${loan.memberId?._id}`} className="font-bold text-white text-lg hover:text-emerald-400 transition-colors">
                  {loan.memberId?.fullName}
                </Link>
                <p className="text-sm text-slate-400 font-mono">{loan.memberId?.memberId}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="text-white font-medium">{loan.memberId?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch</span>
                <span className="text-white font-medium">{loan.branchId?.branchName || 'N/A'}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <Link to={`/savings/accounts?memberId=${loan.memberId?._id}`} className="w-full block text-center bg-slate-900/50 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                View Member Savings Profile
              </Link>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Loan Documents
              </h3>
              {user.role !== 'Member' && (
                <Link to={`/loans/documents/${loan._id}`} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <Upload className="w-3 h-3"/> Manage
                </Link>
              )}
            </div>
            
            {documents.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No documents uploaded.</p>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc._id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-white">{doc.documentType}</span>
                    </div>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-400 hover:underline">
                      View
                    </a>
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

export default LoanDetailsPage;
