import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Wallet, 
  Landmark, 
  Users, 
  TrendingUp, 
  Loader2, 
  CheckCircle2,
  ShieldCheck,
  Building2,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { fetchOrgStats } from '../../services/api';

const OrgStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchOrgStats();
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading org stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 max-w-7xl mx-auto my-12 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
        <p className="text-xs font-bold text-slate-700">Compiling financial growth telemetry...</p>
      </div>
    );
  }

  const savingsData = stats?.monthlySavingsGrowth || [
    { month: 'Jan', amount: 12.4 },
    { month: 'Feb', amount: 13.1 },
    { month: 'Mar', amount: 13.8 },
    { month: 'Apr', amount: 14.2 },
    { month: 'May', amount: 14.5 },
  ];

  const loanData = stats?.monthlyLoanDisbursement || [
    { month: 'Jan', amount: 8.2 },
    { month: 'Feb', amount: 8.8 },
    { month: 'Mar', amount: 9.1 },
    { month: 'Apr', amount: 9.5 },
    { month: 'May', amount: 9.8 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Financial Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span>Society Financial Statistics & Trends</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Comprehensive telemetry of savings mobilization, loan portfolio growth, and capital asset velocity.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Savings Mobilized</span>
            <Wallet className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800">₹ 14.5 Lakhs</div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% Annual Growth</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credit Disbursed</span>
            <Landmark className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800">₹ 9.8 Lakhs</div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.2% Portfolio Expansion</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Share Capital Value</span>
            <Building2 className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹ 4.2 Lakhs</div>
          <div className="text-xs text-slate-500 font-medium">854 Member shares</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recovery Efficiency</span>
            <Activity className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">98.4%</div>
          <div className="text-xs text-emerald-600 font-medium">Statutory recovery index</div>
        </div>

      </div>

      {/* Monthly Trends Visualization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Savings Growth */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-teal-600" />
              <span>Monthly Savings Deposits Inflow (₹ Lakhs)</span>
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {savingsData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{item.month}</span>
                  <span className="text-teal-800">₹ {item.amount} L</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 rounded-full transition-all duration-500" 
                    style={{ width: `${(item.amount / 15) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loan Disbursement */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-600" />
              <span>Monthly Loan Disbursal Velocity (₹ Lakhs)</span>
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {loanData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{item.month}</span>
                  <span className="text-teal-800">₹ {item.amount} L</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-teal-700 rounded-full transition-all duration-500" 
                    style={{ width: `${(item.amount / 12) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrgStatsPage;
