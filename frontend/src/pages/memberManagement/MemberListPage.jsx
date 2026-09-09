import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Power, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  Building2,
  GitBranch,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { fetchMembersList, toggleMemberStatusApi, deleteMemberApi, fetchBranchesList, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberListPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState(isBranchScoped ? userBranchId : 'All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [msg, setMsg] = useState('');

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

  const loadMembers = async () => {
    setLoading(true);
    try {
      const effectiveBranch = isBranchScoped ? userBranchId : branchFilter;
      const memberParams = { search, status: statusFilter, branchId: effectiveBranch, category: categoryFilter };
      const branchParams = {};

      if (isBranchScoped && userBranchId) {
        branchParams.branchId = userBranchId;
      }

      if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
        memberParams.organizationId = selectedOrgId;
        branchParams.organizationId = selectedOrgId;
      }

      const [mRes, bRes] = await Promise.all([
        fetchMembersList(memberParams),
        fetchBranchesList(branchParams),
      ]);
      if (mRes.data && mRes.data.success) {
        setMembers(mRes.data.data);
      }
      if (bRes.data && bRes.data.success) {
        setBranches(bRes.data.data);
      }
    } catch (err) {
      console.warn('Error loading members:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [statusFilter, branchFilter, categoryFilter, selectedOrgId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMembers();
  };

  const handleToggleStatus = async (m) => {
    try {
      const res = await toggleMemberStatusApi(m._id);
      if (res.data && res.data.success) {
        setMsg(`Status for '${m.fullName}' updated.`);
        loadMembers();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Are you sure you want to remove member record '${m.fullName}'?`)) return;
    try {
      const res = await deleteMemberApi(m._id);
      if (res.data && res.data.success) {
        setMsg(`Member record '${m.fullName}' removed.`);
        loadMembers();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Cooperative Member Accounts & Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Member Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search enrolled cooperative members, inspect KYC statuses, and manage accounts across branches.
            </p>
          </div>

          <Link
            to="/members/register"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Member Enrollment</span>
          </Link>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="font-semibold">{msg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Member ID, name, phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Super Admin Organization Filter */}
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-teal-200 rounded-xl px-3 py-1.5 shadow-xs">
              <Building2 className="w-4 h-4 text-teal-600" />
              <select
                value={selectedOrgId}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  setBranchFilter('All');
                }}
                className="bg-transparent text-teal-900 font-bold focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="All">All Societies</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.code || 'ORG'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {!isBranchScoped && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="All">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.branchName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Regular Member">Regular Class A</option>
              <option value="Associate Member">Associate Class B</option>
              <option value="Nominal Member">Nominal Class C</option>
            </select>
          </div>

          <button
            onClick={loadMembers}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
          </button>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mx-auto font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No Members Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No cooperative members matched the selected society, branch, or filter criteria.
            </p>
          </div>
          <Link
            to="/members/register"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Member</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Member Name</th>
                  <th className="px-6 py-3.5">Membership ID</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Branch Location</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-mono font-bold">
                          {m.fullName ? m.fullName[0] : 'M'}
                        </div>
                        <div>
                          <div className="text-slate-900 font-black">{m.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{m.phone || 'Phone N/A'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-teal-800">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                        {m.memberId}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.category === 'Regular Member'
                          ? 'bg-teal-50 border-teal-200 text-teal-800'
                          : m.category === 'Associate Member'
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        {m.category || 'Regular Member'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {m.branchId ? m.branchId.branchName || 'Assigned Branch' : 'Head Office'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.membershipStatus === 'Active'
                          ? 'bg-teal-50 border-teal-200 text-teal-800'
                          : m.membershipStatus === 'Pending'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {m.membershipStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/members/profile/${m._id}`}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>Profile</span>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 border shadow-xs transition-colors ${
                            m.membershipStatus === 'Active'
                              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                              : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{m.membershipStatus === 'Active' ? 'Suspend' : 'Reactivate'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(m)}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberListPage;
