import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchGeneralLedger, fetchChartOfAccounts, fetchOrganizations, fetchBranches } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PieChart, 
  ArrowLeft, 
  Search, 
  Filter, 
  Printer, 
  Loader2, 
  AlertCircle,
  BookOpen,
  Calendar,
  Building2,
  GitBranch,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

const GeneralLedgerPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('All');
  const [ledgerData, setLedgerData] = useState([]);
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

  // Load Accounts for dropdown
  useEffect(() => {
    const params = {};
    if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
    fetchChartOfAccounts(params).then(res => {
      if (res.data?.success) {
        setAccounts(res.data.data || []);
      }
    }).catch(console.warn);
  }, [selectedOrgId]);

  const loadLedger = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;
      if (selectedAccountId !== 'All') params.accountId = selectedAccountId;

      const res = await fetchGeneralLedger(params);
      if (res.data && res.data.success) {
        setLedgerData(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load general ledger statements.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedBranchId, selectedAccountId]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
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
              <PieChart className="w-7 h-7 text-teal-600" />
              <span>General Ledger Statements</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Chronological double-entry posting ledger by account folio with running balance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Print Ledger Book</span>
          </button>
        </div>
      </div>

      {/* Scope & Account Selector Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filter Ledger Scope:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {isSuperAdmin && (
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Society</label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                {organizations.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Branch</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="All">All Branches (Consolidated)</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.branchName}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Account Folio</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="All">All Accounts (Full Ledger Book)</option>
              {accounts.map(a => (
                <option key={a._id} value={a._id}>
                  {a.accountCode} - {a.accountName} ({a.accountType})
                </option>
              ))}
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
      ) : ledgerData.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No ledger statements found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ledgerData.map((accBook) => {
            return (
              <div key={accBook.accountId} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                
                {/* Account Folio Header */}
                <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
                      {accBook.accountCode}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{accBook.accountName}</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{accBook.accountType} • Normal: {accBook.normalBalance}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Total Debits</span>
                      <span className="font-bold text-slate-800">{formatCurrency(accBook.totalDebit)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Total Credits</span>
                      <span className="font-bold text-slate-800">{formatCurrency(accBook.totalCredit)}</span>
                    </div>
                    <div>
                      <span className="text-teal-800 text-[10px] uppercase font-bold block">Closing Balance</span>
                      <span className="font-black text-teal-900 text-sm">{formatCurrency(accBook.closingBalance)}</span>
                    </div>
                  </div>
                </div>

                {/* Ledger Transactions Table */}
                {accBook.transactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No journal postings recorded for this account folio.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-6">Date</th>
                          <th className="py-3 px-6">Voucher #</th>
                          <th className="py-3 px-6">Reference / Module</th>
                          <th className="py-3 px-6">Description / Particulars</th>
                          <th className="py-3 px-6 text-right">Debit (Dr)</th>
                          <th className="py-3 px-6 text-right">Credit (Cr)</th>
                          <th className="py-3 px-6 text-right">Running Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {accBook.transactions.map((txn) => (
                          <tr key={txn.lineId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-6 font-mono text-slate-700">
                              {formatDate(txn.date)}
                            </td>
                            <td className="py-3 px-6 font-mono font-bold text-teal-800">
                              {txn.entryNumber}
                            </td>
                            <td className="py-3 px-6">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                                {txn.referenceType}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-slate-800">
                              {txn.description}
                            </td>
                            <td className="py-3 px-6 text-right font-mono font-bold text-slate-900">
                              {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                            </td>
                            <td className="py-3 px-6 text-right font-mono font-bold text-slate-900">
                              {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                            </td>
                            <td className="py-3 px-6 text-right font-mono font-black text-teal-900">
                              {formatCurrency(txn.runningBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default GeneralLedgerPage;
