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
  Building2,
  ShieldCheck,
  ChevronRight,
  ArrowRight
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
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 bg-white p-8 rounded-3xl border border-rose-100 max-w-lg mx-auto shadow-xs">
        <ShieldAlert className="w-12 h-12 mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-1">Dashboard Error</h2>
        <p className="text-xs text-slate-500">{error}</p>
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
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Cooperative Member Lifecycle Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Member Lifecycle & Enrollment Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage cooperative account holders, verify Aadhaar & PAN KYC, process board approvals, and monitor growth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 border border-teal-200 rounded-xl px-3.5 py-2 shadow-xs">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">Society:</span>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="bg-transparent text-teal-900 text-xs font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="All">All Societies (Global)</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to="/members/register"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ New Member Enrollment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <Link
          to="/members/list"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-teal-300 hover:shadow-soft-teal transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.totalMembers.toLocaleString()}</div>
          <div className="text-[11px] text-teal-800 font-bold flex items-center justify-between">
            <span>Enrolled in branches</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link
          to="/members/list?status=Active"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-teal-300 hover:shadow-soft-teal transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Active Accounts</span>
            <UserCheck className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.activeMembers.toLocaleString()}</div>
          <div className="text-[11px] text-teal-800 font-bold flex items-center justify-between">
            <span>Active & compliant</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link
          to="/members/approvals"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-amber-300 hover:shadow-soft-teal transition-all group block"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-amber-600">{info.pendingApprovals}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Awaiting Board sign-off</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
          </div>
        </Link>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>New (This Month)</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.newThisMonth}</div>
          <div className="text-[11px] text-teal-800 font-bold">New enrollments</div>
        </div>

      </div>

      {/* Growth Visualization & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Membership Growth Trend</span>
            <span className="text-xs font-mono text-teal-800 font-bold">2026 YTD</span>
          </h3>

          <div className="space-y-4 pt-1">
            {info.membershipGrowthTrend.map((item) => (
              <div key={item.month} className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 font-bold">
                  <span>{item.month}</span>
                  <span className="font-mono text-teal-800">{item.count} Members</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (item.count / 30) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Member Classification Breakdown</span>
            <span className="text-xs font-mono text-teal-800 font-bold">Categories</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Regular Class 'A' Members</div>
                <div className="text-[11px] text-slate-400">Full voting rights & share capital</div>
              </div>
              <span className="font-mono text-teal-800 font-black text-base">{info.categoryDistribution.regularMembers}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Associate Class 'B' Members</div>
                <div className="text-[11px] text-slate-400">Secondary holders & borrowers</div>
              </div>
              <span className="font-mono text-slate-800 font-black text-base">{info.categoryDistribution.associateMembers}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Nominal Class 'C' Members</div>
                <div className="text-[11px] text-slate-400">Temporary transactional accounts</div>
              </div>
              <span className="font-mono text-slate-800 font-black text-base">{info.categoryDistribution.nominalMembers}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MemberDashboardPage;
