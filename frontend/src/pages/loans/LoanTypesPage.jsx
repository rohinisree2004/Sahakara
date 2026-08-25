import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchLoanTypes, createLoanTypeApi, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Layers, 
  Plus, 
  Save, 
  X, 
  AlertCircle,
  Building2,
  Percent,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Sparkles
} from 'lucide-react';

const LoanTypesPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [loanTypes, setLoanTypes] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    organizationId: '',
    name: '',
    description: '',
    interestRate: '',
    minimumAmount: '',
    maximumAmount: '',
    maximumTenure: ''
  });

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations();
          if (res.data?.success) {
            const orgs = res.data.data || [];
            setOrganizations(orgs);
            if (orgs.length > 0) {
              setFormData(f => ({ ...f, organizationId: orgs[0]._id }));
            }
          }
        } catch (err) {
          console.warn('Error loading orgs for loan types:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  const loadLoanTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedOrgId && selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

      const response = await fetchLoanTypes(params);
      if (response.data && response.data.success) {
        setLoanTypes(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load loan types', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrgId, statusFilter]);

  useEffect(() => {
    loadLoanTypes();
  }, [loadLoanTypes]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOpenModal = () => {
    const defaultOrg = selectedOrgId !== 'All' 
      ? selectedOrgId 
      : (organizations[0]?._id || user?.organizationId?._id || user?.organizationId || '');
    
    setFormData({
      organizationId: defaultOrg,
      name: '',
      description: '',
      interestRate: '',
      minimumAmount: '',
      maximumAmount: '',
      maximumTenure: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const targetOrg = isSuperAdmin 
        ? (formData.organizationId || organizations[0]?._id) 
        : (user?.organizationId?._id || user?.organizationId);

      const payload = {
        ...formData,
        organizationId: targetOrg,
        interestRate: Number(formData.interestRate),
        minimumAmount: Number(formData.minimumAmount),
        maximumAmount: Number(formData.maximumAmount),
        maximumTenure: Number(formData.maximumTenure),
      };
      
      const response = await createLoanTypeApi(payload);
      if (response.data && response.data.success) {
        await loadLoanTypes();
        setIsModalOpen(false);
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

  const filteredLoanTypes = loanTypes.filter(lt => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      lt.name?.toLowerCase().includes(s) ||
      lt.description?.toLowerCase().includes(s) ||
      lt.organizationId?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link 
            to="/loans/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Loan Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold shadow-xs">
              <Layers className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Loan Schemes & Products
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Configure cooperative credit schemes, interest rates, caps, and tenures
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Loan Product</span>
        </button>
      </div>

      {/* Scope and Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Search scheme name or details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Society Filter (for Super Admin) */}
          {isSuperAdmin && (
            <div>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="All">All Cooperative Societies ({organizations.length})</option>
                {organizations.map(org => (
                  <option key={org._id} value={org._id}>{org.name} ({org.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active Schemes</option>
              <option value="Inactive">Inactive Schemes</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredLoanTypes.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Layers className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No loan types configured yet.</p>
            <p className="text-xs text-slate-500">Click the button above to create a new loan scheme.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Loan Product Scheme</th>
                  <th className="py-4 px-6">Society Affiliation</th>
                  <th className="py-4 px-6">Interest Rate</th>
                  <th className="py-4 px-6">Limits (Min - Max)</th>
                  <th className="py-4 px-6">Max Tenure</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLoanTypes.map((type) => (
                  <tr key={type._id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{type.name}</div>
                      <div className="text-[10px] text-slate-500 max-w-sm mt-0.5">{type.description || 'Standard micro-finance scheme'}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{type.organizationId?.name || 'Global Platform Scheme'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{type.organizationId?.code || 'ORG-ALL'}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                        {type.interestRate}% p.a.
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {formatCurrency(type.minimumAmount)} — {formatCurrency(type.maximumAmount)}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {type.maximumTenure} Months
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        type.status === 'Active' 
                          ? 'bg-teal-50 text-teal-800 border-teal-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {type.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
                  <Plus className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Create Loan Product</h2>
                  <p className="text-xs text-slate-500 font-medium">Add a new credit scheme to the society catalogue</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Society Selector (for Super Admin) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Target Cooperative Society *</span>
                  </label>
                  <select
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    {organizations.map(org => (
                      <option key={org._id} value={org._id}>{org.name} ({org.code})</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Scheme Name *</label>
                <input 
                  required 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600" 
                  placeholder="e.g. Micro Business Support Loan" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Description</label>
                <input 
                  type="text" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="e.g. Low interest credit for livestock and agriculture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interest Rate (% p.a.) *</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    name="interestRate" 
                    value={formData.interestRate} 
                    onChange={handleChange} 
                    placeholder="e.g. 10.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Tenure (Months) *</label>
                  <input 
                    required 
                    type="number" 
                    name="maximumTenure" 
                    value={formData.maximumTenure} 
                    onChange={handleChange} 
                    placeholder="e.g. 36"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Sanction (₹) *</label>
                  <input 
                    required 
                    type="number" 
                    name="minimumAmount" 
                    value={formData.minimumAmount} 
                    onChange={handleChange} 
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Sanction (₹) *</label>
                  <input 
                    required 
                    type="number" 
                    name="maximumAmount" 
                    value={formData.maximumAmount} 
                    onChange={handleChange} 
                    placeholder="e.g. 200000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4"/>}
                  <span>Save Scheme Product</span>
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
