import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchRepaymentDashboard } from '../../services/api';
import { 
  Calculator, 
  Clock, 
  AlertCircle, 
  Activity, 
  Banknote, 
  ShieldAlert, 
  Loader2, 
  Receipt,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';

const RepaymentDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterParams, setFilterParams] = useState({});

  const loadDashboard = useCallback(async (currentFilters = filterParams) => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilters.organizationId && currentFilters.organizationId !== 'All') params.organizationId = currentFilters.organizationId;
      if (currentFilters.branchId && currentFilters.branchId !== 'All') params.branchId = currentFilters.branchId;
      if (currentFilters.groupId && currentFilters.groupId !== 'All') params.groupId = currentFilters.groupId;
      if (currentFilters.memberId && currentFilters.memberId !== 'All') params.memberId = currentFilters.memberId;

      const res = await fetchRepaymentDashboard(params);
      if (res.data && res.data.success) {
        setData(res.data.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    loadDashboard(filterParams);
  }, [loadDashboard, filterParams]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const info = data || {
    activeLoansCount: 0,
    closedLoansCount: 0,
    totalOutstanding: 0,
    todaysCollections: 0,
    todaysCollectionCount: 0,
    emiSummary: {
      upcoming: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 }
    }
  };

  const quickActions = [
    {
      title: 'Record Repayment Voucher',
      desc: 'Process cash, bank transfer, or SHG group weekly thrift installment credit',
      path: '/repayments/record',
      icon: Banknote,
      color: 'text-teal-700',
      badge: 'Counter Collection'
    },
    {
      title: 'Upcoming EMI Due Schedule',
      desc: 'Review & collect scheduled loan installments falling due in the next 30 days',
      path: '/repayments/upcoming',
      icon: Clock,
      color: 'text-amber-700',
      badge: `${info.emiSummary.upcoming.count} Upcoming`
    },
    {
      title: 'Overdue Delinquency Recovery',
      desc: 'Monitor defaulted and past-due EMIs with contact details & risk tracking',
      path: '/repayments/overdue',
      icon: AlertCircle,
      color: 'text-rose-700',
      badge: `${info.emiSummary.overdue.count} Delinquent`
    },
    {
      title: 'Repayment Receipts & Journals',
      desc: 'Audit real-time repayment receipts, transaction UTR numbers, and cash flow ledger',
      path: '/repayments/transactions',
      icon: Receipt,
      color: 'text-teal-800',
      badge: 'Audit Trail'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Calculator className="w-3.5 h-3.5 text-teal-600" />
              <span>EMI & Repayments Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Repayment Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Monitor active loan amortizations, track overdue collections, and balance cashier recoveries
            </p>
          </div>
          <Link
            to="/repayments/record"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <Banknote className="w-4 h-4" />
            <span>Record Repayment</span>
          </Link>
        </div>
      </div>

      {/* Hierarchical Governance Filter Bar */}
      <HierarchicalFilterBar onFilterChange={handleFilterChange} initialValues={filterParams} />

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-rose-600 bg-white rounded-3xl border border-rose-100 shadow-xs max-w-lg mx-auto">
          <ShieldAlert className="w-12 h-12 mb-3 text-rose-500" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Failed to Load Metrics</h2>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Total Outstanding</span>
                <Activity className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-black font-mono text-slate-900">{formatCurrency(info.totalOutstanding)}</div>
              <div className="text-[11px] text-teal-700 font-bold">Across {info.activeLoansCount} Active Borrowings</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Today's Collections</span>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-black font-mono text-teal-800">{formatCurrency(info.todaysCollections)}</div>
              <div className="text-[11px] text-slate-500 font-medium">{info.todaysCollectionCount} Vouchers Credited Today</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xs bg-amber-50/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wider">
                <span>Upcoming Due EMIs</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black font-mono text-amber-900">{info.emiSummary.upcoming.count}</div>
              <div className="text-[11px] text-amber-700 font-bold">{formatCurrency(info.emiSummary.upcoming.amount)} Scheduled in 30 Days</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-xs bg-rose-50/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider">
                <span>Delinquent Overdue</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black font-mono text-rose-800">{info.emiSummary.overdue.count}</div>
              <div className="text-[11px] text-rose-700 font-bold">{formatCurrency(info.emiSummary.overdue.amount)} Past Due Balance</div>
            </div>
          </div>

          {/* Quick Action Navigation Tiles */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Repayment Desks & Workflow</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all group flex items-start justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                            {action.title}
                          </h3>
                          {action.badge && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold font-mono">
                              {action.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{action.desc}</p>
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

export default RepaymentDashboardPage;
