import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchMembersList, createSavingsAccountApi } from '../../services/api';
import { ArrowLeft, Save, User, Wallet, Percent, FileText } from 'lucide-react';

const CreateSavingsAccountPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    memberId: '',
    accountType: 'Regular Savings',
    openingBalance: '',
    minimumBalance: '0',
    interestRate: '0',
    remarks: ''
  });

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        // Fetch a list of active members
        const response = await fetchMembersList({ status: 'Active', limit: 1000 });
        if (response.data.success) {
          setMembers(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load members', err);
        setError('Failed to load members for selection.');
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.memberId) {
      setError('Please select a member.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await createSavingsAccountApi({
        ...formData,
        openingBalance: Number(formData.openingBalance),
        minimumBalance: Number(formData.minimumBalance),
        interestRate: Number(formData.interestRate)
      });

      if (response.data.success) {
        navigate('/savings/accounts');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create savings account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/savings/accounts"
          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Savings Account</h1>
          <p className="text-slate-400 mt-1">Open a new savings account for a member.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Member Selection */}
            <div className="col-span-1 md:col-span-2">
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
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="">{isLoading ? 'Loading members...' : '-- Select a Member --'}</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.memberId} - {member.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                Account Type *
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="Regular Savings">Regular Savings</option>
                <option value="Recurring Deposit">Recurring Deposit (RD)</option>
                <option value="Fixed Deposit">Fixed Deposit (FD)</option>
                <option value="Pigmy Account">Pigmy Account</option>
              </select>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Opening Balance (₹) *
              </label>
              <input
                type="number"
                name="openingBalance"
                value={formData.openingBalance}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="e.g. 500"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Minimum Balance */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                Minimum Balance (₹)
              </label>
              <input
                type="number"
                name="minimumBalance"
                value={formData.minimumBalance}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 0"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                Interest Rate (%)
              </label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 4.5"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Remarks */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Remarks / Notes
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional notes..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700/50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSavingsAccountPage;
