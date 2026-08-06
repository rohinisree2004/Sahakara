import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLoanById, disburseLoanApi } from '../../services/api';
import { Save, ArrowLeft, Loader2, Banknote } from 'lucide-react';

const LoanDisbursementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    disbursementAmount: '',
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    remarks: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchLoanById(id);
        if (response.data.success) {
          setLoan(response.data.data.loan);
          setFormData(f => ({ ...f, disbursementAmount: response.data.data.loan.approvedAmount }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await disburseLoanApi(id, formData);
      if (response.data.success) {
        navigate(`/loans/details/${id}`);
      }
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Disburse Loan Funds</h1>
          <p className="text-slate-400 mt-1">Application ID: {loan.applicationId} | Approved: ₹{loan.approvedAmount}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Disbursement Amount (₹) *</label>
            <input
              type="number"
              value={formData.disbursementAmount}
              onChange={(e) => setFormData({ ...formData, disbursementAmount: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
              required
              max={loan.approvedAmount}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 appearance-none"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Demand Draft">Demand Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reference / UTR Number</label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Disbursement Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows="3"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700/50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Banknote className="w-5 h-5" /> Process Disbursement</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanDisbursementPage;
