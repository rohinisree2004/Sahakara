import React, { useState, useEffect } from 'react';
import { fetchLoanTypes, createLoanTypeApi } from '../../services/api';
import { Layers, Plus, Save, X, AlertCircle } from 'lucide-react';

const LoanTypesPage = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interestRate: '',
    minimumAmount: '',
    maximumAmount: '',
    maximumTenure: ''
  });

  const loadLoanTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetchLoanTypes();
      if (response.data.success) {
        setLoanTypes(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load loan types', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLoanTypes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        interestRate: Number(formData.interestRate),
        minimumAmount: Number(formData.minimumAmount),
        maximumAmount: Number(formData.maximumAmount),
        maximumTenure: Number(formData.maximumTenure),
      };
      const response = await createLoanTypeApi(payload);
      if (response.data.success) {
        setLoanTypes([response.data.data, ...loanTypes]);
        setIsModalOpen(false);
        setFormData({ name: '', description: '', interestRate: '', minimumAmount: '', maximumAmount: '', maximumTenure: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create loan type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-emerald-400" />
            Loan Types Management
          </h1>
          <p className="text-slate-400 mt-1">Configure loan products, interest rates, and limits.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          Create Loan Type
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Loan Product</th>
                <th className="px-6 py-4">Interest Rate</th>
                <th className="px-6 py-4">Limits (Min - Max)</th>
                <th className="px-6 py-4">Max Tenure</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </td>
                </tr>
              ) : loanTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="w-12 h-12 mb-3 text-slate-600 mx-auto" />
                    <p>No loan types configured yet.</p>
                  </td>
                </tr>
              ) : (
                loanTypes.map((type) => (
                  <tr key={type._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{type.name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">{type.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-purple-400">{type.interestRate}% p.a.</td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatCurrency(type.minimumAmount)} - {formatCurrency(type.maximumAmount)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{type.maximumTenure} Months</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        type.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {type.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white">Create Loan Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Product Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. Personal Loan" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-emerald-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Interest Rate (%) *</label>
                  <input required type="number" step="0.01" name="interestRate" value={formData.interestRate} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Tenure (Months) *</label>
                  <input required type="number" name="maximumTenure" value={formData.maximumTenure} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Min Amount (₹) *</label>
                  <input required type="number" name="minimumAmount" value={formData.minimumAmount} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Amount (₹) *</label>
                  <input required type="number" name="maximumAmount" value={formData.maximumAmount} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t border-slate-700/50 gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50">
                  {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save className="w-4 h-4"/> Save Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanTypesPage;
