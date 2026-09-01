import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrialBalance, fetchOrganizations, fetchBranches } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Scale, 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  FileSpreadsheet,
  Building2,
  GitBranch,
  ShieldCheck
} from 'lucide-react';

const TrialBalancePage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  const [tb, setTb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations().then(res => {
        if (res.data?.success) {
          const orgList = res.data.data || [];
          setOrganizations(orgList);
          if (orgList.length > 0 && selectedOrgId === 'All') {
            setSelectedOrgId(orgList[0]._id);
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
      if (res.data?.success) setBranches(res.data.data || []);
    }).catch(console.warn);
  }, [selectedOrgId]);

  const loadTrialBalance = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;

      const res = await fetchTrialBalance(params);
      if (res.data && res.data.success) {
        setTb(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate Trial Balance.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedBranchId]);

  useEffect(() => {
    loadTrialBalance();
  }, [loadTrialBalance]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const lines = tb?.lines || [];
  const isBalanced = tb?.isBalanced ?? true;
  const totalDebit = tb?.totalDebit || 0;
  const totalCredit = tb?.totalCredit || 0;

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
              <Scale className="w-7 h-7 text-teal-600" />
              <span>Trial Balance Sheet</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Double-entry debit vs credit reconciliation statement & general ledger audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Print Statement</span>
          </button>

          <Link
            to="/accounting/journals"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Journal Vouchers</span>
          </Link>
        </div>
      </div>

      {/* Scope Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>Trial Balance Entity:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Society:</span>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
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
              <option value="All">All Branches (Consolidated)</option>
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
      ) : (
        <>
          {/* Balance Health Banner */}
          <div
            className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
              isBalanced ? 'border-teal-200 bg-teal-50/40' : 'border-rose-200 bg-rose-50/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold ${
                  isBalanced ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {isBalanced ? <CheckCircle2 className="w-6 h-6 text-teal-600" /> : <AlertCircle className="w-6 h-6 text-rose-600" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isBalanced ? 'Books Reconciled & Perfectly Balanced' : 'Imbalance Detected in General Ledger'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isBalanced
                    ? 'Total debits exactly equal total credits across all active accounts.'
                    : `Discrepancy of ${formatCurrency(Math.abs(totalDebit - totalCredit))} between debit and credit sides.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Debits</span>
                <span className="font-black text-slate-900 text-base">{formatCurrency(totalDebit)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Credits</span>
                <span className="font-black text-slate-900 text-base">{formatCurrency(totalCredit)}</span>
              </div>
            </div>
          </div>

          {/* Trial Balance Statement Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Accounts Balance Sheet ({lines.length} Accounts)
              </h3>
              <span className="text-xs font-mono font-bold text-teal-800">
                Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">GL Code</th>
                    <th className="py-4 px-6">Account Title</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6 text-right">Debit Balance (₹)</th>
                    <th className="py-4 px-6 text-right">Credit Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {lines.map((line) => (
                    <tr key={line.accountId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-black text-teal-800 text-sm">
                        {line.accountCode}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900">
                        {line.accountName}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                          {line.accountType || 'Account'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                        {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                        {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-teal-50/60 border-t-2 border-teal-200 font-mono font-black text-slate-900 text-sm">
                    <td colSpan="3" className="py-4 px-6 uppercase tracking-wider text-xs font-bold text-teal-950">
                      Total Balanced Sum
                    </td>
                    <td className="py-4 px-6 text-right text-teal-900">
                      {formatCurrency(totalDebit)}
                    </td>
                    <td className="py-4 px-6 text-right text-teal-900">
                      {formatCurrency(totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default TrialBalancePage;
