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
  Building2 
} from 'lucide-react';
import { fetchMembersList, toggleMemberStatusApi, deleteMemberApi, fetchBranchesList, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberListPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
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
      const memberParams = { search, status: statusFilter, branchId: branchFilter, category: categoryFilter };
      const branchParams = {};

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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Member Registry & Directory</span>
          </h1>
          <p className="text-xs text-slate-400">
            Search enrolled cooperative members, view savings/loan summaries, and manage account statuses
          </p>
        </div>

        <Link
          to="/members/register"
          className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Member Enrollment</span>
        </Link>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Member ID, name, phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Super Admin Organization Filter */}
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedOrgId}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  setBranchFilter('All');
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-bold focus:outline-none"
              >
                <option value="All">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.code || 'ORG'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Filter className="w-4 h-4 text-slate-500" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.branchName}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Regular Member">Regular Class A</option>
            <option value="Associate Member">Associate Class B</option>
            <option value="Nominal Member">Nominal Class C</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Member Name</th>
                  <th className="px-6 py-4">Membership ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-mono">
                          {m.fullName ? m.fullName[0] : 'M'}
                        </div>
                        <div>
                          <div>{m.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{m.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{m.memberId}</td>
                    <td className="px-6 py-4 text-slate-300">{m.category}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {m.branchId ? m.branchId.branchName || 'Assigned Branch' : 'Head Office'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.membershipStatus === 'Active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : m.membershipStatus === 'Pending'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {m.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/members/profile/${m._id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Profile</span>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 border border-slate-700 ${
                            m.membershipStatus === 'Active'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{m.membershipStatus === 'Active' ? 'Suspend' : 'Reactivate'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(m)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
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
