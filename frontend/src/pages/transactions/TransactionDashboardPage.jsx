import React, { useState, useEffect } from 'react';
import { fetchTransactionDashboard } from '../../services/api';
import { 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Banknote, 
  Calculator 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TransactionDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchTransactionDashboard();
        setDashboardData(data.data);
      } catch (err) {
        setError(err.message || 'Failed to load transaction dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  const { summary, recentTransactions } = dashboardData;

  const cards = [
    {
      title: 'Total Inflow',
      amount: summary.totalInflow,
      icon: ArrowDownRight,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Total Outflow',
      amount: summary.totalOutflow,
      icon: ArrowUpRight,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      title: 'Net Flow',
      amount: summary.totalInflow - summary.totalOutflow,
      icon: ArrowRightLeft,
      color: summary.totalInflow >= summary.totalOutflow ? 'text-emerald-500' : 'text-rose-500',
      bg: summary.totalInflow >= summary.totalOutflow ? 'bg-emerald-500/10' : 'bg-rose-500/10'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-emerald-400" />
            Transaction Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Unified view of all financial transactions</p>
        </div>
        <Link 
          to="/transactions/list" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View All Transactions
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon className={`w-8 h-8 ${card.color}`} />
                </div>
                <div>
                  <div className="text-sm text-slate-400">{card.title}</div>
                  <div className={`text-2xl font-bold ${card.color}`}>
                    ₹{card.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-sm border-b border-slate-700">
                  <th className="pb-3 font-medium">Txn ID</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Module</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTransactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 text-emerald-400 font-mono">{txn.transactionId}</td>
                    <td className="py-3 text-slate-300">
                      {new Date(txn.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs">
                        {txn.sourceModule}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        txn.transactionType === 'Inflow' ? 'bg-emerald-500/10 text-emerald-400' :
                        txn.transactionType === 'Outflow' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {txn.transactionType}
                      </span>
                    </td>
                    <td className={`py-3 font-medium ${txn.transactionType === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {txn.transactionType === 'Inflow' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/transactions/${txn._id}`} className="text-emerald-500 hover:text-emerald-400 text-xs font-medium">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-500">No recent transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Module Breakdown</h2>
          <div className="space-y-4">
            
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-slate-200">Savings</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Inflow:</span>
                <span className="text-emerald-400">₹{(summary.SavingsDeposit?.Inflow || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Banknote className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-slate-200">Loans</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Outflow:</span>
                <span className="text-rose-400">₹{(summary.LoanDisbursement?.Outflow || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-slate-200">Repayments</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Inflow:</span>
                <span className="text-emerald-400">₹{(summary.Repayment?.Inflow || 0).toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDashboardPage;
