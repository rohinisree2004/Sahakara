import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserCheck, 
  Wallet, 
  Banknote, 
  UserPlus, 
  FileCheck, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Sparkles,
  Users,
  Receipt,
  Calendar
} from 'lucide-react';
import { 
  fetchMembersList, 
  getUpcomingEMIs, 
  getOverdueEMIs, 
  fetchRepaymentDashboard 
} from '../../services/api';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [membersCount, setMembersCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [repaymentStats, setRepaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTellerData = async () => {
      try {
        setLoading(true);
        const [mRes, upRes, ovRes, repRes] = await Promise.allSettled([
          fetchMembersList({ limit: 1 }),
          getUpcomingEMIs(),
          getOverdueEMIs(),
          fetchRepaymentDashboard()
        ]);

        if (mRes.status === 'fulfilled' && mRes.value.data) {
          setMembersCount(mRes.value.data.count ?? mRes.value.data.data?.length ?? 0);
        }

        if (upRes.status === 'fulfilled' && upRes.value.data) {
          setUpcomingCount(upRes.value.data.count ?? upRes.value.data.data?.length ?? 0);
        }

        if (ovRes.status === 'fulfilled' && ovRes.value.data) {
          setOverdueCount(ovRes.value.data.count ?? ovRes.value.data.data?.length ?? 0);
        }

        if (repRes.status === 'fulfilled' && repRes.value.data) {
          setRepaymentStats(repRes.value.data.data);
        }
      } catch (err) {
        console.error('Error fetching teller dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTellerData();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const tellerActions = [
    {
      title: 'Fast Savings Deposit Counter',
      desc: 'Accept cash or digital deposit into member savings account',
      path: '/savings/deposit',
      icon: Wallet,
      badge: 'Teller Counter',
      color: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Collect EMI Repayment',
      desc: 'Process counter loan installment collection & generate receipt',
      path: '/repayments/record',
      icon: Banknote,
      badge: 'Cashier Desk',
      color: 'text-teal-400',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
    },
    {
      title: 'New Member Enrollment',
      desc: 'Enroll cooperative member with KYC uploads & nominee info',
      path: '/members/register',
      icon: UserPlus,
      badge: 'Onboarding',
      color: 'text-indigo-400',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'KYC Document Verification',
      desc: 'Verify Aadhaar, PAN, voter cards & physical identity documents',
      path: '/members/kyc',
      icon: FileCheck,
      badge: 'Compliance',
      color: 'text-cyan-400',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      title: 'Submit Loan Application',
      desc: 'Intake member loan applications with guarantor verification',
      path: '/loans/apply',
      icon: CreditCard,
      badge: 'Loan Intake',
      color: 'text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Upcoming Collections Queue',
      desc: 'View & follow up on installments due in the next 30 days',
      path: '/repayments/upcoming',
      icon: Clock,
      badge: `${upcomingCount} Due`,
      color: 'text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Overdue Recovery Queue',
      desc: 'Track and recover delinquent installments with borrower contacts',
      path: '/repayments/overdue',
      icon: AlertCircle,
      badge: `${overdueCount} Overdue`,
      color: 'text-rose-400',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    },
    {
      title: 'SHG & JLG Group Operations',
      desc: 'Manage self-help groups, member allocations & field meetings',
      path: '/groups/list',
      icon: Users,
      badge: 'Field Ops',
      color: 'text-purple-400',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Repayment Receipts Ledger',
      desc: 'Search & print historical customer payment receipts',
      path: '/repayments/transactions',
      icon: Receipt,
      badge: 'Audit Trail',
      color: 'text-slate-400',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Front-Desk Teller Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/20 shrink-0">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Front-Desk & Teller Operations Desk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {user?.name}
              </h1>
              <p className="text-xs text-slate-400">
                Staff Role: <span className="text-teal-400 font-bold font-mono">Teller / Field Officer</span> • Active Counter Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/savings/deposit"
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Wallet className="w-4 h-4" />
              <span>Record Deposit</span>
            </Link>
            <Link
              to="/repayments/record"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Banknote className="w-4 h-4" />
              <span>Collect EMI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Teller Daily Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Today's Counter Collections</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {formatCurrency(repaymentStats?.todaysCollections || 0)}
          </div>
          <div className="text-[11px] text-slate-500">
            {repaymentStats?.todaysCollectionCount || 0} Transactions Completed Today
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Upcoming Due Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{upcomingCount}</div>
          <div className="text-[11px] text-slate-400">EMIs Due in Next 30 Days</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Overdue Recovery Queue</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{overdueCount}</div>
          <div className="text-[11px] text-slate-400">Delinquent Borrowers Requiring Followup</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Branch Member Base</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{membersCount}</div>
          <div className="text-[11px] text-teal-400 font-medium">Registered Society Members</div>
        </div>

      </div>

      {/* Teller Operations Workspaces Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <span>Counter Actions & Customer Desk</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Daily Front-Desk Workflows</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tellerActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${action.badgeColor}`}>
                    {action.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{action.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white transition-colors">
                  <span className="font-semibold">Launch Counter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default EmployeeDashboard;
