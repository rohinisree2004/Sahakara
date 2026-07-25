import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Wallet, 
  Landmark, 
  Users, 
  TrendingUp, 
  Loader2, 
  CheckCircle2 
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
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Society Financial Analytics & Growth</span>
          </h1>
          <p className="text-xs text-slate-400">
            Monthly savings portfolio accumulation, active loan disbursals, and recovery rate performance
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Member Savings</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">₹ 14.5 Cr</div>
          <div className="text-[11px] text-slate-500">+4.8% growth this quarter</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Loan Disbursals</span>
            <Landmark className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">₹ 9.8 Cr</div>
          <div className="text-[11px] text-slate-500">184 active borrower accounts</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Loan Recovery Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400">99.2%</div>
          <div className="text-[11px] text-slate-500">On-time EMI collections</div>
        </div>

      </div>

      {/* Monthly Bar Charts Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Savings Growth Trend (₹ Cr)</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">2024 YTD</span>
          </h3>

          <div className="space-y-3 pt-2">
            {savingsData.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>{item.month}</span>
                  <span className="font-mono text-emerald-400">₹ {item.amount} Cr</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all duration-500"
                    style={{ width: `${(item.amount / 16) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Loan Portfolio Disbursal (₹ Cr)</span>
            <span className="text-xs font-mono text-cyan-400 font-bold">2024 YTD</span>
          </h3>

          <div className="space-y-3 pt-2">
            {loanData.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>{item.month}</span>
                  <span className="font-mono text-cyan-400">₹ {item.amount} Cr</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
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
