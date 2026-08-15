import React, { useEffect, useState } from 'react';
import { getAccountingDashboard } from '../../services/api';
import { Loader2 } from 'lucide-react';

const AccountingDashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAccountingDashboard().then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Accounting Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Cash Balance</p>
          <p className="text-2xl font-bold text-emerald-400">₹{stats.cashBalance}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Total Income</p>
          <p className="text-2xl font-bold text-blue-400">₹{stats.totalIncome}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Total Expense</p>
          <p className="text-2xl font-bold text-rose-400">₹{stats.totalExpense}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Net Income</p>
          <p className="text-2xl font-bold text-indigo-400">₹{stats.netIncome}</p>
        </div>
      </div>
    </div>
  );
};
export default AccountingDashboardPage;
