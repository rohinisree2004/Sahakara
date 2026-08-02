import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSavingsDashboardStats } from '../../services/api';
import { Wallet, Users, ArrowUpCircle, ArrowDownCircle, Banknote, Activity, Settings, Plus, BookOpen, Clock, FileText } from 'lucide-react';

const SavingsDashboardPage = () => {
  const [stats, setStats] = useState({
    totalSavings: 0,
    activeAccounts: 0,
    totalAccounts: 0,
    todaysCollection: 0,
    monthlyCollection: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchSavingsDashboardStats();
        if (response.data.success) {
          setStats(response.data.data);
          setError(null);
        }
      } catch (error) {
        setError(error.message || 'Unable to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const quickActions = [
    { label: 'Record Deposit', path: '/savings/deposit', icon: Plus, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'View Accounts', path: '/savings/accounts', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Transactions', path: '/savings/transactions', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Settings', path: '/savings/settings', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-400">
        <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Savings Management
          </h1>
          <p className="text-slate-400 mt-1">Overview of member savings, deposits, and accounts.</p>
        </div>
        <Link 
          to="/savings/deposit"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          Record Deposit
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Banknote className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">Total</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Total Savings Portfolio</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalSavings)}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <ArrowUpCircle className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">Today</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Today's Collection</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.todaysCollection)}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">This Month</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Monthly Collection</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.monthlyCollection)}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Savings Accounts</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.activeAccounts} <span className="text-sm font-normal text-slate-500">/ {stats.totalAccounts}</span></p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-white mt-8 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const ActionIcon = action.icon;
          return (
            <Link
              key={index}
              to={action.path}
              className="bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl p-5 transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <ActionIcon className={`w-6 h-6 ${action.color}`} />
              </div>
              <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{action.label}</h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsDashboardPage;
