import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { fetchSavingsAccounts, recordDepositApi } from '../../services/api';
import { ArrowLeft, Save, Wallet, Calendar, FileText, CheckCircle } from 'lucide-react';

const RecordDepositPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillAccountId = location.state?.prefillAccountId || '';

  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null); // Will hold transaction details on success

  const [formData, setFormData] = useState({
    accountId: prefillAccountId,
    amount: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      try {
        const response = await fetchSavingsAccounts({ status: 'Active', limit: 1000 });
        if (response.data.success) {
          setAccounts(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load accounts', err);
        setError('Failed to load accounts for selection.');
      } finally {
        setIsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId) {
      setError('Please select a savings account.');
      return;
    }
    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await recordDepositApi({
        ...formData,
        amount: Number(formData.amount)
      });

      if (response.data.success) {
        setSuccessData(response.data.data); // Transaction data
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to record deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">Deposit Successful</h2>
        <p className="text-slate-400">Transaction ID: <span className="font-mono text-emerald-400">{successData.transactionId}</span></p>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-left my-8 backdrop-blur-sm max-w-md mx-auto">
          <div className="flex justify-between py-2 border-b border-slate-700/50">
            <span className="text-slate-400">Amount Deposited</span>
            <span className="text-white font-bold text-lg text-emerald-400">+{formatCurrency(successData.amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700/50">
            <span className="text-slate-400">Payment Method</span>
            <span className="text-white font-medium">{successData.paymentMethod}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">New Balance</span>
            <span className="text-white font-bold">{formatCurrency(successData.balanceAfterTransaction)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to={`/savings/passbook/${successData.savingsAccountId}`}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            View Passbook
          </Link>
          <button 
            onClick={() => {
              setSuccessData(null);
              setFormData({ ...formData, amount: '', referenceNumber: '', remarks: '' });
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            Record Another Deposit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/savings/dashboard"
          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Record Deposit</h1>
          <p className="text-slate-400 mt-1">Add funds to a member's savings account.</p>
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
            
            {/* Account Selection */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Select Active Savings Account *
              </label>
              <select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="">{isLoading ? 'Loading accounts...' : '-- Select Account --'}</option>
                {accounts.map(acc => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountNumber} - {acc.memberId?.fullName} ({acc.accountType})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Deposit Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 1000"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Deposit Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reference Number / UTR
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="e.g. UTR123456789"
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
                rows="2"
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
                  Complete Deposit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordDepositPage;
