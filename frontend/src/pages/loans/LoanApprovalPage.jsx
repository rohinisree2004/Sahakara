import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLoanById, approveLoanApi, rejectLoanApi } from '../../services/api';
import { Save, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';

const LoanApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    approvedAmount: '',
    remarks: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchLoanById(id);
        if (response.data.success) {
          setLoan(response.data.data.loan);
          setFormData(f => ({ ...f, approvedAmount: response.data.data.loan.requestedAmount }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAction = async (actionType) => {
    if (!formData.remarks) return alert("Remarks are required.");
    setIsSubmitting(true);
    try {
      if (actionType === 'Approve') {
        if (!formData.approvedAmount) return alert("Approved amount required.");
        await approveLoanApi(id, { approvedAmount: formData.approvedAmount, remarks: formData.remarks });
      } else {
        await rejectLoanApi(id, { remarks: formData.remarks });
      }
      navigate(`/loans/details/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!loan) return <div className="text-center p-20 text-rose-500">Loan not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Loan Approval Decision</h1>
          <p className="text-slate-400 mt-1">Application ID: {loan.applicationId} | Requested: ₹{loan.requestedAmount}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Approved Amount (₹) *</label>
            <input
              type="number"
              value={formData.approvedAmount}
              onChange={(e) => setFormData({ ...formData, approvedAmount: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Decision Remarks *</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows="4"
              required
              placeholder="Enter reasoning for approval or rejection..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-700/50 gap-4">
            <button
              onClick={() => handleAction('Reject')}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/50 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><XCircle className="w-5 h-5" /> Reject Loan</>}
            </button>
            <button
              onClick={() => handleAction('Approve')}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Approve Loan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApprovalPage;
