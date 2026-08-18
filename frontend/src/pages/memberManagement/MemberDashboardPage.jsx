import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  TrendingUp, 
  Loader2, 
  Sparkles,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { fetchMemberDashboard, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberDashboardPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations({ limit: 100 });
          if (res.data && res.data.success) {
            setOrganizations(res.data.data);
          }
        } catch (err) {
          console.warn('Error loading organizations:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const params = {};
        if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
          params.organizationId = selectedOrgId;
        }
        const res = await fetchMemberDashboard(params);
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
  }, [selectedOrgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
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
    totalMembers: 0,
    activeMembers: 0,
    pendingApprovals: 0,
    suspendedMembers: 0,
    newThisMonth: 0,
    membershipGrowthTrend: [],
    categoryDistribution: {
      regularMembers: 0,
      associateMembers: 0,
      nominalMembers: 0,
    },
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cooperative Member Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Member Lifecycle & Enrollment Center
            </h1>
            <p className="text-sm text-slate-400">
              Manage cooperative account holders, verify Aadhaar & PAN KYCs, process board approvals, and track growth
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="bg-transparent text-emerald-300 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Organizations (Global)</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id} className="bg-slate-900 text-white">
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to="/members/register"
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Member Enrollment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Enrolled Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{info.totalMembers.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Across all branches</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Member Accounts</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400">{info.activeMembers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">KYC verified & active</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Pending Board Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{info.pendingApprovals}</div>
          <div className="text-[11px] text-slate-500">Awaiting board sign-off</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>New Enrolled (This Month)</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{info.newThisMonth}</div>
          <div className="text-[11px] text-slate-500">+12% vs last month</div>
        </div>

      </div>

      {/* Growth Visualization & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Membership Growth Trend</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">2024 YTD</span>
          </h3>

          <div className="space-y-3 pt-2">
            {info.membershipGrowthTrend.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>{item.month}</span>
                  <span className="font-mono text-emerald-400">{item.count} Members</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / 2600) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Member Classification Breakdown</span>
            <span className="text-xs font-mono text-teal-400 font-bold">Categories</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Regular Class 'A' Members</div>
                <div className="text-[11px] text-slate-400">Full voting rights & share capital</div>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-sm">{info.categoryDistribution.regularMembers}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Associate Class 'B' Members</div>
                <div className="text-[11px] text-slate-400 font-normal">Secondary holders & borrowers</div>
              </div>
              <span className="font-mono text-teal-400 font-bold text-sm">{info.categoryDistribution.associateMembers}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-white">Nominal Class 'C' Members</div>
                <div className="text-[11px] text-slate-400 font-normal">Temporary transactional accounts</div>
              </div>
              <span className="font-mono text-cyan-400 font-bold text-sm">{info.categoryDistribution.nominalMembers}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MemberDashboardPage;
