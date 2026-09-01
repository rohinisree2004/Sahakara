import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAccountingDashboard, fetchOrganizations, fetchBranches } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PieChart, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  BookOpen, 
  FileSpreadsheet, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Building2,
  Sparkles,
  ArrowUpRight,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react';

const AccountingDashboardPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  const [stats, setStats] = useState(null);
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

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;

      const res = await fetchAccountingDashboard(params);
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load accounting data.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, selectedBranchId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const info = stats || {
    cashBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    netSurplus: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    accountsCount: 0
  };

  const navCards = [
    {
      title: 'Chart of Accounts',
      desc: 'Standardized 5-tier cooperative account hierarchy, GL codes, & live balances',
      path: '/accounting/accounts',
      icon: BookOpen,
      badge: `${info.accountsCount} Accounts`
    },
    {
      title: 'Journal Entries & Vouchers',
      desc: 'Double-entry general journal vouchers and balanced debit/credit audits',
      path: '/accounting/journals',
      icon: FileSpreadsheet,
      badge: 'Balanced Double Entry'
    },
    {
      title: 'General Ledger Statements',
      desc: 'Account-wise chronological transaction audit with real-time running balances',
      path: '/accounting/ledger',
      icon: PieChart,
      badge: 'Statement Books'
    },
    {
      title: 'Trial Balance Verification',
      desc: 'Real-time debit vs credit balance verification sheet with balance indicator',
      path: '/accounting/trial-balance',
      icon: Scale,
      badge: 'Balanced Verification'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              <span>Module 13 • Financial Accounting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Accounting & General Ledger Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Standard double-entry chart of accounts, trial balance verification, and financial ledgers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/accounting/journals"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Post Journal Voucher</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scope Filter Bar for Super Admin & Branch Manager */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>Accounting Entity Scope:</span>
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
        <div className="flex flex-col items-center justify-center p-12 text-rose-600 bg-white rounded-3xl border border-rose-100 shadow-xs max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 mb-2" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Liquid Cash & Bank</span>
                <Wallet className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-black font-mono text-slate-900">{formatCurrency(info.cashBalance)}</div>
              <div className="text-[11px] text-teal-700 font-bold">Liquid Reserves Available</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Total Revenue (Income)</span>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-black font-mono text-teal-800">{formatCurrency(info.totalIncome)}</div>
              <div className="text-[11px] text-slate-500 font-medium">Interest & Fees Accrued</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Total Expenditure</span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black font-mono text-rose-800">{formatCurrency(info.totalExpense)}</div>
              <div className="text-[11px] text-slate-500 font-medium">Operational & Interest Outflow</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-xs bg-teal-50/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-800 uppercase tracking-wider">
                <span>Net Surplus / Profit</span>
                <Scale className="w-4 h-4 text-teal-600" />
              </div>
              <div className={`text-3xl font-black font-mono ${info.netSurplus >= 0 ? 'text-teal-900' : 'text-rose-800'}`}>
                {formatCurrency(info.netSurplus)}
              </div>
              <div className="text-[11px] text-teal-700 font-bold">Operating Margin</div>
            </div>
          </div>

          {/* Core Modules Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Accounting Statements & General Ledger Desks</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {navCards.map((card) => {
                const Icon = card.icon || BookOpen;
                return (
                  <Link
                    key={card.path}
                    to={card.path}
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all group flex items-start justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                            {card.title}
                          </h3>
                          {card.badge && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold font-mono">
                              {card.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{card.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0 mt-3" />
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AccountingDashboardPage;
