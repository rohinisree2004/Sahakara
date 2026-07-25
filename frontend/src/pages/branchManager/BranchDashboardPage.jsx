import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Users, 
  UserCheck, 
  Landmark, 
  Wallet, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Loader2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { fetchBranchDashboard } from '../../services/api';

const BranchDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchBranchDashboard();
        if (res.data && res.data.success) {
          setData(res.data.data);
          setError(null);
        }
      } catch (err) {
        setError(err.message || 'Unable to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
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

  const info = data || {
    branchName: 'Unknown Branch',
    branchCode: 'N/A',
    managerName: 'Not Assigned',
    totalMembers: 0,
    activeMembers: 0,
    totalEmployees: 0,
    activeLoansCount: 0,
    activeLoansAmount: '₹ 0',
    monthlySavingsManaged: '₹ 0',
    recentTransactions: [],
    upcomingMeetings: [],
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Branch Command Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {info.branchName} <span className="text-teal-400 font-mono">({info.branchCode})</span>
        </h1>
        <p className="text-sm text-slate-400">
          Assigned Branch Manager: <span className="text-white font-bold">{info.managerName}</span> • Vijaya Credit Cooperative Society
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Branch Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.totalMembers}</div>
          <div className="text-[11px] text-emerald-400 font-medium">{info.activeMembers} Active Account Holders</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Branch Staff / Tellers</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400">{info.totalEmployees}</div>
          <div className="text-[11px] text-slate-500">Counter tellers & officers</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Loan Balance</span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{info.activeLoansAmount}</div>
          <div className="text-[11px] text-slate-500">{info.activeLoansCount} active borrower accounts</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Savings Deposits</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400">{info.monthlySavingsManaged}</div>
          <div className="text-[11px] text-slate-500">Daily & recurring deposits</div>
        </div>

      </div>

      {/* Transactions & Meetings Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Counter Transactions</span>
          </h3>

          <div className="space-y-3">
            {info.recentTransactions.map((txn) => (
              <div key={txn.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-white font-bold">{txn.member}</div>
                  <div className="text-slate-400 text-[11px]">{txn.type} • {txn.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-mono font-bold">{txn.amount}</div>
                  <div className="text-[10px] text-slate-500">{txn.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Upcoming Branch Meetings</span>
          </h3>

          <div className="space-y-3">
            {info.upcomingMeetings.map((mtg, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="text-white font-bold">{mtg.title}</div>
                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span>📅 {mtg.date} at {mtg.time}</span>
                  <span>📍 {mtg.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default BranchDashboardPage;
