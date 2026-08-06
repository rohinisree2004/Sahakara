import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLoans } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Banknote, AlertCircle, Plus, Calendar, Clock, Activity } from 'lucide-react';

const MyLoansPage = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMyLoans = async () => {
      try {
        const response = await fetchLoans({ memberId: user._id, limit: 100 });
        if (response.data.success) {
          setLoans(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load my loans', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user._id) {
      loadMyLoans();
    }
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    if (status === 'Active' || status === 'Disbursed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Approved' || status === 'Recommended') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (status === 'Rejected') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (status === 'Closed') return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20'; // Pending, Under Review
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Banknote className="w-8 h-8 text-emerald-400" />
            My Loans
          </h1>
          <p className="text-slate-400 mt-1">Track your loan applications and active loans.</p>
        </div>
        <Link 
          to="/loans/apply"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          Apply for Loan
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
          <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Loans Found</h2>
          <p className="text-slate-400 mb-6">You don't have any active loans or past applications.</p>
          <Link to="/loans/apply" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Start a Loan Application
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map(loan => (
            <div key={loan._id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </span>
                <span className="text-xs font-mono text-slate-500">{loan.applicationId}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{loan.loanTypeId?.name}</h3>
              <p className="text-2xl font-bold text-emerald-400 mb-6">{formatCurrency(loan.requestedAmount)}</p>

              <div className="space-y-3 mt-auto">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Tenure: <strong className="text-white">{loan.tenure} Months</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span>Interest: <strong className="text-white">{loan.interestRate}% p.a.</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Applied: <strong className="text-white">{new Date(loan.applicationDate).toLocaleDateString('en-IN')}</strong></span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/50">
                <Link 
                  to={`/loans/details/${loan._id}`}
                  className="block w-full py-2.5 bg-slate-900/50 hover:bg-slate-700 text-emerald-400 text-center rounded-xl font-semibold text-sm transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoansPage;
