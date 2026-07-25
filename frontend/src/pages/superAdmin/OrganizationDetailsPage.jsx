import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  Wallet, 
  Landmark, 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';
import { fetchOrganizationDetails, updateOrgStatus } from '../../services/api';

const OrganizationDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchOrganizationDetails(id);
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleToggleStatus = async (currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await updateOrgStatus(id, { status: nextStatus });
      if (res.data && res.data.success) {
        setMsg(`Society status updated to '${nextStatus}'.`);
        loadDetails();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const profile = data?.profile || {
    name: 'Vijaya Credit Cooperative Society Ltd.',
    code: 'VCS-101',
    registrationNumber: 'REG/CS/2021/889',
    societyType: 'Credit Cooperative',
    email: 'admin@coop.org',
    phone: '+91 99000 00002',
    address: '100 Feet Ring Road, JP Nagar 6th Phase',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560078',
    status: 'Active',
    createdAt: '2024-01-15',
  };

  const metrics = data?.metrics || {
    totalBranches: 4,
    totalMembers: 2450,
    totalEmployees: 18,
    totalSavingsManaged: '₹ 14.5 Cr',
    totalLoansDisbursed: '₹ 9.8 Cr',
    auditComplianceScore: '98%',
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link to="/super-admin/organizations" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Registry</span>
        </Link>

        <button
          onClick={() => handleToggleStatus(profile.status)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            profile.status === 'Active'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {profile.status === 'Active' ? 'Suspend Organization' : 'Reactivate Organization'}
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Profile Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-xl">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                  profile.status === 'Active'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {profile.status}
                </span>
              </div>
              <p className="text-xs font-mono text-emerald-400 mt-1">Code: {profile.code} • {profile.societyType}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{profile.address || 'Address not updated'}, {profile.city}, {profile.state}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{profile.phone}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Operational Branches</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalBranches}</div>
          <div className="text-[11px] text-slate-500">Active branch locations</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Registered Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{metrics.totalMembers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Shareholders & members</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Society Employees</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400">{metrics.totalEmployees}</div>
          <div className="text-[11px] text-slate-500">Staff & tellers</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Audit Score</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{metrics.auditComplianceScore}</div>
          <div className="text-[11px] text-slate-500">Compliance status</div>
        </div>

      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Savings & Deposit Portfolio</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">{metrics.totalSavingsManaged}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Includes member savings accounts, fixed deposits, recurring deposit schemes, and interest accrual ledgers managed within this tenant organization.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-cyan-400" />
              <span>Loan & EMI Portfolio</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-bold">{metrics.totalLoansDisbursed}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Active personal, agricultural, and gold loan disbursals with automated EMI calculation schedules and repayment recovery logs.
          </p>
        </div>
      </div>

    </div>
  );
};

export default OrganizationDetailsPage;
