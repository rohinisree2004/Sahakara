import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  Loader2, 
  Sparkles,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { fetchUserDashboard, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboardPage = () => {
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
        const res = await fetchUserDashboard(params);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-600 bg-white p-8 rounded-3xl border border-rose-100 shadow-xs max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 mb-3 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Dashboard Error</h2>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  const info = data || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    recentlyAdded: [],
    roleDistribution: {
      adminCount: 0,
      executiveCount: 0,
      employeeCount: 0,
      memberCount: 0,
    },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>RBAC User Management Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              User Accounts & Role Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Governance portal for user onboarding, bcrypt password resets, role assignments, and inter-branch staff transfers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 border border-teal-200 rounded-xl px-3 py-1.5 shadow-xs">
                <Building2 className="w-4 h-4 text-teal-600" />
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="bg-transparent text-teal-900 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="All">All Organizations (Global)</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to="/users/create"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total ERP Accounts</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.totalUsers.toLocaleString()}</div>
          <div className="text-[11px] text-teal-700 font-semibold">All 7 Platform Roles</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Active Login Users</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-800">{info.activeUsers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Authenticated & verified</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider">
            <span>Inactive / Suspended</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-800">{info.inactiveUsers}</div>
          <div className="text-[11px] text-rose-600">Disabled accounts</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Employees & Officers</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{info.roleDistribution.employeeCount}</div>
          <div className="text-[11px] text-slate-500">Counter tellers & staff</div>
        </div>

      </div>

      {/* Role Breakdown & Recently Onboarded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Role Distribution Summary</span>
            <span className="text-xs font-mono text-teal-800 font-bold">7-Level RBAC</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900">Organization Admins</span>
              <span className="font-mono text-teal-700 font-bold">{info.roleDistribution.adminCount} Account</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900">Board Executives (President, Sec, Treas)</span>
              <span className="font-mono text-teal-700 font-bold">{info.roleDistribution.executiveCount} Accounts</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900">Branch Employees & Tellers</span>
              <span className="font-mono text-teal-700 font-bold">{info.roleDistribution.employeeCount} Staff</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900">Society Member Accounts</span>
              <span className="font-mono text-teal-700 font-bold">{info.roleDistribution.memberCount} Members</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Recently Onboarded Users</span>
            </span>
            <Link to="/users/list" className="text-xs text-teal-700 font-bold hover:underline">View All</Link>
          </h3>

          <div className="space-y-3">
            {info.recentlyAdded.map((u) => (
              <div key={u._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-900 font-bold">{u.name}</div>
                  <div className="text-slate-500 text-[11px]">{u.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800 font-mono">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboardPage;
