import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchRepaymentDashboard } from '../../services/api';
import { Calculator, Clock, AlertCircle, Activity, Banknote, ShieldAlert, Loader2 } from 'lucide-react';

const RepaymentDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchRepaymentDashboard();
        if (res.data && res.data.success) {
          setData(res.data.data);
          setError(null);
        }
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-400">
        <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>EMI & Repayments Module</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Repayment Operations Center
            </h1>
            <p className="text-sm text-slate-400">
              Monitor active loan amortizations, track overdue EMIs, and record daily collections
            </p>
          </div>
          <Link
            to="/repayments/record"
            className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Banknote className="w-4 h-4" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Outstanding</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{formatCurrency(info.totalOutstanding)}</div>
          <div className="text-[11px] text-indigo-400 font-medium">Across {info.activeLoansCount} Active Loans</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Today's Collections</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{formatCurrency(info.todaysCollections)}</div>
          <div className="text-[11px] text-slate-500">{info.todaysCollectionCount} Transactions Today</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Upcoming EMIs</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.emiSummary.upcoming.count}</div>
          <div className="text-[11px] text-amber-400 font-medium">{formatCurrency(info.emiSummary.upcoming.amount)} Due Soon</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Overdue EMIs</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{info.emiSummary.overdue.count}</div>
          <div className="text-[11px] text-rose-400 font-medium">{formatCurrency(info.emiSummary.overdue.amount)} Past Due</div>
        </div>
      </div>

    </div>
  );
};

export default RepaymentDashboardPage;
