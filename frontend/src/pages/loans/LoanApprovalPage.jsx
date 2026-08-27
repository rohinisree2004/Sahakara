import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLoanById, approveLoanApi, rejectLoanApi, reviewLoanApi, fetchLoanCibilScoreApi } from '../../services/api';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  AlertCircle, 
  Award, 
  AlertTriangle,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

const LoanApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refreshingCibil, setRefreshingCibil] = useState(false);

  const [formData, setFormData] = useState({
    approvedAmount: '',
    remarks: '',
    action: 'Approve'
  });

  const loadData = async () => {
    try {
      const response = await fetchLoanById(id);
      if (response.data && response.data.success) {
        const l = response.data.data.loan;
        setLoan(l);
        setFormData(f => ({ 
          ...f, 
          approvedAmount: l.approvedAmount || l.requestedAmount || '' 
        }));
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

  const handleAction = async (actionType) => {
    if (!formData.remarks) {
      setError('Resolution / Decision remarks are required.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      if (actionType === 'Approve') {
        if (!formData.approvedAmount) {
          setError('Approved sanctioned amount is required.');
          setIsSubmitting(false);
          return;
        }
        await approveLoanApi(id, { approvedAmount: Number(formData.approvedAmount), remarks: formData.remarks });
      } else if (actionType === 'Return') {
        await reviewLoanApi(id, { action: 'Returned for Correction', remarks: formData.remarks });
      } else if (actionType === 'Reject') {
        await rejectLoanApi(id, { remarks: formData.remarks });
      }
      navigate(`/loans/details/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record decision');
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
            <ShieldCheck className="w-7 h-7 text-teal-600" />
            <span>Loan Sanction & Credit Decision</span>
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

      {/* CIBIL Bureau Snapshot */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              TransUnion CIBIL Bureau Credit Report
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
              <span className="text-[10px] text-slate-400 font-bold block">On-Time Payment %</span>
              <span className="font-mono font-bold text-emerald-700">{cibil.factors?.onTimePaymentRate || '98.5%'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Credit Utilization</span>
              <span className="font-mono font-bold text-slate-900">{cibil.factors?.creditUtilization || '22%'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Requested Principal</span>
              <span className="font-mono font-bold text-slate-900">₹{(loan.requestedAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Risk Rating</span>
              <span className="font-bold text-teal-800">{cibil.riskLevel || 'Low Risk'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Desk */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sanctioned Approved Amount (₹) *
            </label>
            <input
              type="number"
              value={formData.approvedAmount}
              onChange={(e) => setFormData({ ...formData, approvedAmount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resolution Remarks / Instructions *
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows="4"
              required
              placeholder="Enter sanction terms, resolution notes, or return instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => handleAction('Reject')}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Reject Loan</>}
            </button>

            <button
              type="button"
              onClick={() => handleAction('Return')}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4" /> Return for Correction</>}
            </button>

            <button
              type="button"
              onClick={() => handleAction('Approve')}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Sanction & Approve</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApprovalPage;
