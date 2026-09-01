import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchChartOfAccounts, createAccountApi, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Search, 
  ArrowLeft, 
  Scale, 
  Loader2, 
  AlertCircle,
  Filter,
  Plus,
  Building2,
  CheckCircle2,
  FolderTree,
  DollarSign,
  X
} from 'lucide-react';

const ChartOfAccountsPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalOrgId, setModalOrgId] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Asset');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations().then(res => {
        if (res.data?.success) {
          const orgList = res.data.data || [];
          setOrganizations(orgList);
          if (orgList.length > 0 && selectedOrgId === 'All') {
            setSelectedOrgId(orgList[0]._id);
            setModalOrgId(orgList[0]._id);
          }
        }
      }).catch(console.warn);
    }
  }, [isSuperAdmin]);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;

      const res = await fetchChartOfAccounts(params);
      if (res.data && res.data.success) {
        setAccounts(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load chart of accounts.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const res = await createAccountApi({
        organizationId: isSuperAdmin ? modalOrgId : undefined,
        accountCode: accountCode.trim(),
        accountName: accountName.trim(),
        accountType
      });

      if (res.data && res.data.success) {
        setShowModal(false);
        setAccountCode('');
        setAccountName('');
        loadAccounts();
      }
    } catch (err) {
      setModalError(err.response?.data?.error || err.message || 'Failed to create account');
    } finally {
      setModalLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const accountTypes = ['All', 'Asset', 'Liability', 'Equity', 'Income', 'Expense'];

  const filteredAccounts = accounts.filter((acc) => {
    const matchesType = selectedType === 'All' || acc.accountType === selectedType;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      acc.accountCode.toLowerCase().includes(term) ||
      acc.accountName.toLowerCase().includes(term) ||
      acc.accountType.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Asset': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Liability': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Equity': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Income': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Expense': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/accounting/dashboard"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-teal-600" />
              <span>Chart of Accounts</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Master cooperative general ledger accounts, 5-tier classification, and running balances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/accounting/trial-balance"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Trial Balance</span>
          </Link>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add GL Account</span>
          </button>
        </div>
      </div>

      {/* Society Scope Selector for Super Admin */}
      {isSuperAdmin && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Cooperative Society:</span>
          </div>
          <select
            value={selectedOrgId}
            onChange={(e) => {
              setSelectedOrgId(e.target.value);
              setModalOrgId(e.target.value);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
          >
            {organizations.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
        
        {/* Filters and Search Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search account code, account name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {accountTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedType === type
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No chart of accounts found.</p>
            <p className="text-xs text-slate-500">Standard general ledger accounts will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">GL Account Code</th>
                  <th className="py-4 px-6">Account Title</th>
                  <th className="py-4 px-6">Classification</th>
                  <th className="py-4 px-6">Normal Balance</th>
                  <th className="py-4 px-6">Total Debits</th>
                  <th className="py-4 px-6">Total Credits</th>
                  <th className="py-4 px-6 text-right">Current Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAccounts.map((acc) => {
                  return (
                    <tr key={acc._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-black text-teal-800 text-sm">
                        {acc.accountCode}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                        {acc.accountName}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${getTypeBadgeColor(acc.accountType)}`}>
                          {acc.accountType}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-slate-700">
                        {acc.normalBalance}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-700">
                        {formatCurrency(acc.totalDebit || 0)}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-700">
                        {formatCurrency(acc.totalCredit || 0)}
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-black text-slate-900 text-sm">
                        {formatCurrency(acc.currentBalance || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Custom GL Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-black text-slate-900">Add General Ledger Account</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4">
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Society *</label>
                  <select
                    value={modalOrgId}
                    onChange={(e) => setModalOrgId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                    required
                  >
                    {organizations.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Code * (e.g. 1020)</label>
                <input
                  type="text"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  placeholder="e.g. 1020 or 5020"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Name *</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Petty Cash / Audit Fees"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Classification *</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                  required
                >
                  <option value="Asset">Asset (Normal: Debit)</option>
                  <option value="Liability">Liability (Normal: Credit)</option>
                  <option value="Equity">Equity (Normal: Credit)</option>
                  <option value="Income">Income (Normal: Credit)</option>
                  <option value="Expense">Expense (Normal: Debit)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChartOfAccountsPage;
