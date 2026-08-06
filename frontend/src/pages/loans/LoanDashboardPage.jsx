import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLoanDashboardStats, fetchLoans } from '../../services/api';
import { Banknote, Users, Activity, FileText, CheckCircle, Clock, Plus, Layers, Search, Filter } from 'lucide-react';

const LoanDashboardPage = () => {
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingApps: 0,
    activeLoans: 0,
    financialStats: {
      totalApprovedAmount: 0,
      totalDisbursedAmount: 0,
      totalOutstandingAmount: 0
    }
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, loansRes] = await Promise.all([
          fetchLoanDashboardStats(),
          fetchLoans({ limit: 5 })
        ]);
        
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (loansRes.data.success) {
          setRecentLoans(loansRes.data.data);
        }
        setError(null);
      } catch (error) {
        setError(error.message || 'Unable to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const quickActions = [
    { label: 'Apply for Loan', path: '/loans/apply', icon: Plus, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending Applications', path: '/loans/applications?status=Pending', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Active Loans', path: '/loans/active', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Loan Types', path: '/loans/types', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' }
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
            <Banknote className="w-8 h-8 text-emerald-400" />
            Loan Management
          </h1>
          <p className="text-slate-400 mt-1">Overview of loan portfolio, applications, and disbursements.</p>
        </div>
        <Link 
          to="/loans/apply"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          New Loan Application
        </Link>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-emerald-400/80 text-sm font-semibold relative z-10">Total Approved</h3>
          <p className="text-3xl font-bold text-white mt-1 relative z-10">{formatCurrency(stats.financialStats.totalApprovedAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Banknote className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-blue-400/80 text-sm font-semibold relative z-10">Total Disbursed</h3>
          <p className="text-3xl font-bold text-white mt-1 relative z-10">{formatCurrency(stats.financialStats.totalDisbursedAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-purple-400/80 text-sm font-semibold relative z-10">Outstanding Balance</h3>
          <p className="text-3xl font-bold text-white mt-1 relative z-10">{formatCurrency(stats.financialStats.totalOutstandingAmount)}</p>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-slate-700/50 rounded-xl"><FileText className="w-6 h-6 text-slate-300"/></div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Loans</p>
            <p className="text-2xl font-bold text-white">{stats.totalLoans}</p>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl"><Clock className="w-6 h-6 text-amber-400"/></div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Apps</p>
            <p className="text-2xl font-bold text-white">{stats.pendingApps}</p>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl"><Activity className="w-6 h-6 text-emerald-400"/></div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Loans</p>
            <p className="text-2xl font-bold text-white">{stats.activeLoans}</p>
          </div>
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

      {/* Recent Applications */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden mt-8 backdrop-blur-sm">
        <div className="p-5 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Recent Loan Applications</h2>
          <Link to="/loans/applications" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">App ID</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Loan Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentLoans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No recent applications found.</td>
                </tr>
              ) : (
                recentLoans.map(loan => (
                  <tr key={loan._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/loans/details/${loan._id}`} className="font-mono text-emerald-400 hover:underline">
                        {loan.applicationId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{loan.memberId?.fullName}</td>
                    <td className="px-6 py-4 text-slate-300">{loan.loanTypeId?.name}</td>
                    <td className="px-6 py-4 font-bold text-white">{formatCurrency(loan.requestedAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        loan.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        loan.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        loan.status === 'Pending' || loan.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanDashboardPage;
