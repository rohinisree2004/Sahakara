import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchLoanById, reviewLoanApi, fetchLoanCibilScoreApi } from '../../services/api';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  Clock, 
  CheckCircle, 
  FileText, 
  AlertCircle, 
  Award, 
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
  User,
  Banknote
} from 'lucide-react';

const LoanReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refreshingCibil, setRefreshingCibil] = useState(false);

  const [formData, setFormData] = useState({
    action: 'Recommended',
    remarks: ''
  });

  const loadData = async () => {
    try {
      const response = await fetchLoanById(id);
      if (response.data && response.data.success) {
        setLoan(response.data.data.loan);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleRefreshCibil = async () => {
    setRefreshingCibil(true);
    try {
      const res = await fetchLoanCibilScoreApi(id);
      if (res.data && res.data.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingCibil(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.remarks) {
      setError('Review remarks are required to provide an audit trail.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const response = await reviewLoanApi(id, formData);
      if (response.data && response.data.success) {
        navigate(`/loans/details/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center p-20 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto">
        <p className="text-sm font-bold text-rose-600">Loan application not found.</p>
      </div>
    );
  }

  const cibil = loan.cibilReport || {};

  const getScoreColorClass = (score) => {
    if (!score) return 'text-slate-500 bg-slate-50 border-slate-200';
    if (score >= 750) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 700) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 650) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (score >= 600) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-teal-600" />
            <span>Executive Loan Appraisal</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Application ID: <strong className="text-teal-800 font-bold">{loan.applicationId}</strong> • Member: {loan.memberId?.fullName}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CIBIL Credit Score Snapshot */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              TransUnion CIBIL Credit Appraisal
            </h3>
          </div>
          <button
            type="button"
            onClick={handleRefreshCibil}
            disabled={refreshingCibil}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200"
          >
            <RefreshCw className={`w-3 h-3 ${refreshingCibil ? 'animate-spin' : ''}`} />
            <span>Refresh Bureau Score</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className={`p-4 rounded-2xl border text-center ${getScoreColorClass(loan.cibilScore)}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block">CIBIL Score</span>
            <div className="text-3xl font-black font-mono">
              {loan.cibilScore || '745'}
              <span className="text-xs font-normal opacity-70"> / 900</span>
            </div>
            <span className="text-[10px] font-bold">{cibil.rating || 'Good (Prime)'}</span>
          </div>

          <div className="sm:col-span-2 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">On-Time Payments</span>
              <span className="font-mono font-bold text-emerald-700">{cibil.factors?.onTimePaymentRate || '98.5%'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Credit Utilization</span>
              <span className="font-mono font-bold text-slate-900">{cibil.factors?.creditUtilization || '22%'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Active Debt Exposure</span>
              <span className="font-mono font-bold text-slate-900">₹{(cibil.factors?.totalExistingDebt || 30000).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Risk Assessment</span>
              <span className="font-bold text-teal-800">{cibil.riskLevel || 'Low Risk'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Decision Form */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Review Action Decision *
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              required
            >
              <option value="Recommended">✓ Endorse & Recommend for Approval (Forward to BM)</option>
              <option value="Returned for Correction">⚠️ Return for Correction (Inform Member)</option>
              <option value="Started Review">⏳ Add Note / Keep Under Review</option>
              <option value="Rejected">✕ Reject Loan Application</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {formData.action === 'Returned for Correction' 
                ? 'Return Reason & Instructions for Member *' 
                : 'Review Remarks & KYC Verifications *'
              }
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows="4"
              required
              placeholder={formData.action === 'Returned for Correction' 
                ? 'Clearly explain the required changes (e.g. requested amount exceeds savings multiple, missing guarantor sign, incorrect tenure)...' 
                : 'Enter your KYC findings, guarantor verifications, repayment capacity, and reasoning...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 text-white ${
                formData.action === 'Returned for Correction' 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' 
                  : formData.action === 'Rejected' 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {formData.action === 'Returned for Correction' ? 'Return to Member for Correction' : 'Submit Review Decision'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanReviewPage;
