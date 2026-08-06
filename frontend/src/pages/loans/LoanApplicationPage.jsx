import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLoanTypes, fetchMembersList, checkLoanEligibilityApi, applyForLoanApi } from '../../services/api';
import { Banknote, User, Calendar, Save, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoanApplicationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loanTypes, setLoanTypes] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [formData, setFormData] = useState({
    memberId: user.role === 'Member' ? user._id : '',
    loanTypeId: '',
    requestedAmount: '',
    tenure: '',
    purpose: '',
    remarks: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const typesRes = await fetchLoanTypes({ status: 'Active' });
        if (typesRes.data.success) setLoanTypes(typesRes.data.data);
        
        if (user.role !== 'Member') {
          const memRes = await fetchMembersList({ status: 'Active', limit: 1000 });
          if (memRes.data.success) setMembers(memRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setEligibility(null); // Reset eligibility on change
  };

  const checkEligibility = async () => {
    if (!formData.memberId || !formData.loanTypeId || !formData.requestedAmount) return;
    
    setCheckingEligibility(true);
    try {
      const response = await checkLoanEligibilityApi({
        memberId: formData.memberId,
        loanTypeId: formData.loanTypeId,
        requestedAmount: formData.requestedAmount
      });
      if (response.data.success) {
        setEligibility(response.data.data);
      }
    } catch (err) {
      setEligibility({ isEligible: false, reason: err.response?.data?.message || err.message });
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (eligibility && !eligibility.isEligible) return;

    setIsSubmitting(true);
    try {
      const response = await applyForLoanApi(formData);
      if (response.data.success) {
        navigate(user.role === 'Member' ? '/loans/my-loans' : '/loans/applications');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Banknote className="w-8 h-8 text-emerald-400" />
          Apply for Loan
        </h1>
        <p className="text-slate-400 mt-1">Submit a new loan application for review.</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Selection (Hidden for Member Role) */}
            {user.role !== 'Member' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Select Member *
                </label>
                <select
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none"
                >
                  <option value="">{isLoading ? 'Loading...' : '-- Select Member --'}</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.memberId} - {m.fullName}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Loan Product *</label>
              <select
                name="loanTypeId"
                value={formData.loanTypeId}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="">-- Select Product --</option>
                {loanTypes.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.interestRate}% p.a.)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Requested Amount (₹) *</label>
              <input
                type="number"
                name="requestedAmount"
                value={formData.requestedAmount}
                onChange={handleChange}
                onBlur={checkEligibility}
                required
                min="1"
                placeholder="e.g. 50000"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Tenure (Months) *
              </label>
              <input
                type="number"
                name="tenure"
                value={formData.tenure}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g. 12"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Purpose of Loan *</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                placeholder="e.g. Medical Emergency"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Remarks / Notes</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="2"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* Eligibility Check Area */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-h-[80px] flex items-center">
            {!formData.memberId || !formData.loanTypeId || !formData.requestedAmount ? (
              <p className="text-slate-500 text-sm italic">Fill member, loan product, and amount to see eligibility preview.</p>
            ) : checkingEligibility ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Checking eligibility rules...
              </div>
            ) : eligibility ? (
              eligibility.isEligible ? (
                <div className="flex items-start gap-3 w-full">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-emerald-400 font-bold">Eligible for Application</h4>
                    {eligibility.details && (
                      <p className="text-xs text-slate-400 mt-1">
                        Max Allowed: <span className="text-white">{formatCurrency(eligibility.details.adjustedMaxEligible)}</span> based on Savings (<span className="text-white">{formatCurrency(eligibility.details.totalSavings)}</span>).
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 w-full">
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-rose-400 font-bold">Not Eligible</h4>
                    <p className="text-sm text-rose-300/80 mt-1">{eligibility.reason}</p>
                  </div>
                </div>
              )
            ) : (
              <button type="button" onClick={checkEligibility} className="text-emerald-400 text-sm hover:underline">Check Eligibility Now</button>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700/50">
            <button
              type="submit"
              disabled={isSubmitting || (eligibility && !eligibility.isEligible)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Save className="w-5 h-5" /> Submit Application</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanApplicationPage;
