import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchJournalEntries, 
  createJournalEntryApi, 
  fetchChartOfAccounts, 
  fetchOrganizations, 
  fetchBranches 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileSpreadsheet, 
  Search, 
  ArrowLeft, 
  Scale, 
  Loader2, 
  AlertCircle,
  Calendar,
  BookOpen,
  Plus,
  Building2,
  GitBranch,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';

const JournalEntryPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalOrgId, setModalOrgId] = useState('');
  const [modalBranchId, setModalBranchId] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [referenceType, setReferenceType] = useState('ManualExpense');
  const [lines, setLines] = useState([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' }
  ]);
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

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

  // Load branches
  useEffect(() => {
    const params = {};
    if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
    fetchBranches(params).then(res => {
      if (res.data?.success) {
        setBranches(res.data.data || []);
        if (res.data.data?.length > 0 && !modalBranchId) {
          setModalBranchId(res.data.data[0]._id);
        }
      }
    }).catch(console.warn);
  }, [selectedOrgId, modalBranchId]);

  // Load accounts for modal dropdown
  useEffect(() => {
    const params = {};
    if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
    fetchChartOfAccounts(params).then(res => {
      if (res.data?.success) setAccounts(res.data.data || []);
    }).catch(console.warn);
  }, [selectedOrgId]);

  const loadJournals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;

      const res = await fetchJournalEntries(params);
      if (res.data && res.data.success) {
        setJournals(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedBranchId]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  // Add line to journal voucher modal
  const handleAddLine = () => {
    setLines([...lines, { accountId: '', debit: 0, credit: 0, description: '' }]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!isBalanced) {
      setModalError(`Voucher is not balanced! Total Debit (₹${totalDebit}) must equal Total Credit (₹${totalCredit})`);
      return;
    }

    if (lines.some(l => !l.accountId)) {
      setModalError('Please select a GL account for every line.');
      return;
    }

    setModalSubmitting(true);
    try {
      const payload = {
        organizationId: isSuperAdmin ? modalOrgId : undefined,
        branchId: modalBranchId || undefined,
        date: entryDate,
        description: description.trim(),
        referenceType,
        lines: lines.map(l => ({
          accountId: l.accountId,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description || description
        }))
      };

      const res = await createJournalEntryApi(payload);
      if (res.data && res.data.success) {
        setShowModal(false);
        setDescription('');
        setLines([
          { accountId: '', debit: 0, credit: 0, description: '' },
          { accountId: '', debit: 0, credit: 0, description: '' }
        ]);
        loadJournals();
      }
    } catch (err) {
      setModalError(err.response?.data?.error || err.message || 'Failed to post voucher');
    } finally {
      setModalSubmitting(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const filteredJournals = journals.filter((j) => {
    const term = searchTerm.toLowerCase();
    const entryNum = (j.entryNumber || '').toLowerCase();
    const desc = (j.description || '').toLowerCase();
    const ref = (j.referenceType || '').toLowerCase();
    return entryNum.includes(term) || desc.includes(term) || ref.includes(term);
  });

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
              <FileSpreadsheet className="w-7 h-7 text-teal-600" />
              <span>General Journal Entries</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Chronological double-entry voucher log, auto-posting audits, and debit/credit balanced sheets
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
            <span>Post New Voucher</span>
          </button>
        </div>
      </div>

      {/* Scope Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search voucher #, description, reference..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Society:</span>
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="All">All Branches</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.branchName}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : error ? (
        <div className="p-12 text-center text-rose-600 bg-white rounded-3xl border border-rose-100 shadow-xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
          <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No journal vouchers found.</p>
          <p className="text-xs text-slate-500">Automatic loan & savings journal postings or manual vouchers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJournals.map((journal) => {
            const jDebit = (journal.lines || []).reduce((s, l) => s + (l.debit || 0), 0);

            return (
              <div
                key={journal._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Voucher Header */}
                <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
                      {journal.entryNumber}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{journal.description}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono">{formatDate(journal.entryDate)}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-600">{journal.organizationId?.name || 'Cooperative Society'}</span>
                        {journal.branchId && (
                          <>
                            <span>•</span>
                            <span>{journal.branchId.branchName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                      {journal.referenceType}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Voucher Total</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(jDebit)}</span>
                    </div>
                  </div>
                </div>

                {/* Voucher Lines Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-6">Account Folio</th>
                        <th className="py-3 px-6">Line Particulars</th>
                        <th className="py-3 px-6 text-right">Debit (₹)</th>
                        <th className="py-3 px-6 text-right">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(journal.lines || []).map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-6">
                            <span className="font-mono font-bold text-teal-800">{line.accountId?.accountCode}</span>
                            <span className="font-bold text-slate-900 ml-2">{line.accountId?.accountName}</span>
                          </td>
                          <td className="py-3 px-6 text-slate-600">
                            {line.description || journal.description}
                          </td>
                          <td className="py-3 px-6 text-right font-mono font-bold text-slate-900">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td className="py-3 px-6 text-right font-mono font-bold text-slate-900">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Post Double-Entry Journal Voucher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-black text-slate-900">Post General Journal Voucher</h3>
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

            <form onSubmit={handleCreateJournal} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Posting Date *</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Voucher Description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Office Stationery / Annual Maintenance adjustment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              {/* Multi-line Debit / Credit Rows */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-900 uppercase">Double-Entry Lines (Dr / Cr)</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                        className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                        required
                      >
                        <option value="">-- Choose GL Account --</option>
                        {accounts.map(a => (
                          <option key={a._id} value={a._id}>{a.accountCode} - {a.accountName} ({a.accountType})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Debit (₹)"
                        value={line.debit || ''}
                        onChange={(e) => {
                          handleLineChange(idx, 'debit', e.target.value);
                          if (e.target.value > 0) handleLineChange(idx, 'credit', 0);
                        }}
                        className="w-full sm:w-1/4 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                      />

                      <input
                        type="number"
                        placeholder="Credit (₹)"
                        value={line.credit || ''}
                        onChange={(e) => {
                          handleLineChange(idx, 'credit', e.target.value);
                          if (e.target.value > 0) handleLineChange(idx, 'debit', 0);
                        }}
                        className="w-full sm:w-1/4 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-teal-600"
                      />

                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Balancing Verification Footer */}
                <div className={`p-4 rounded-2xl border text-xs font-mono font-bold flex justify-between items-center ${
                  isBalanced ? 'bg-teal-50 border-teal-200 text-teal-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div>
                    <span>Total Debits: ₹{totalDebit} | Total Credits: ₹{totalCredit}</span>
                  </div>
                  <div>
                    {isBalanced ? (
                      <span className="flex items-center gap-1 text-teal-800">
                        <CheckCircle2 className="w-4 h-4" /> Perfectly Balanced
                      </span>
                    ) : (
                      <span className="text-rose-700">Difference: ₹{Math.abs(totalDebit - totalCredit)}</span>
                    )}
                  </div>
                </div>
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
                  disabled={modalSubmitting || !isBalanced}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Post Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JournalEntryPage;
