import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  KeyRound, 
  Power, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Building2
} from 'lucide-react';
import { fetchUsersList, resetUserPasswordApi, toggleUserStatusApi, deleteUserApi, fetchBranchesList, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserListPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Password reset modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userParams = { search, role: roleFilter, branchId: branchFilter, status: statusFilter };
      const branchParams = {};

      if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
        userParams.organizationId = selectedOrgId;
        branchParams.organizationId = selectedOrgId;
      }

      const [uRes, bRes] = await Promise.all([
        fetchUsersList(userParams),
        fetchBranchesList(branchParams),
      ]);
      if (uRes.data && uRes.data.success) {
        setUsers(uRes.data.data);
      }
      if (bRes.data && bRes.data.success) {
        setBranches(bRes.data.data);
      }
    } catch (err) {
      console.warn('Error loading users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, branchFilter, statusFilter, selectedOrgId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (u) => {
    try {
      const res = await toggleUserStatusApi(u._id);
      if (res.data && res.data.success) {
        setMsg(`Account status for '${u.name}' updated.`);
        loadUsers();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleOpenResetModal = (u) => {
    setResetModalUser(u);
    setNewPassword('');
    setErrorMsg('');
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setResetting(true);
    setErrorMsg('');

    try {
      const res = await resetUserPasswordApi(resetModalUser._id, { newPassword });
      if (res.data && res.data.success) {
        setMsg(`Password reset successfully for '${resetModalUser.name}'.`);
        setResetModalUser(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to remove user account '${u.name}'?`)) return;
    try {
      const res = await deleteUserApi(u._id);
      if (res.data && res.data.success) {
        setMsg(`User account '${u.name}' removed.`);
        loadUsers();
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
            <Users className="w-6 h-6 text-cyan-400" />
            <span>User Directory & Accounts</span>
          </h1>
          <p className="text-xs text-slate-400">
            Search society members, staff officers, and admins, perform bcrypt password resets, and toggle account statuses
          </p>
        </div>

        <Link
          to="/users/create"
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
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
            placeholder="Search name, username, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Organization Admin">Org Admin</option>
            <option value="President">President</option>
            <option value="Secretary">Secretary</option>
            <option value="Treasurer">Treasurer</option>
            <option value="Employee">Employee</option>
            <option value="Member">Member</option>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Role Title</th>
                  <th className="px-6 py-4">Branch Location</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-mono">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {u.organizationId?.code && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px]">
                                {u.organizationId.code}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono font-normal">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>{u.branchId ? u.branchId.branchName || 'Assigned Branch' : 'Head Office'}</div>
                      {u.organizationId?.name && (
                        <div className="text-[10px] text-slate-500">{u.organizationId.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>{u.email}</div>
                      <div className="text-slate-500 text-[11px]">{u.phone || '+91 99000 00000'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.isActive !== false
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg font-semibold flex items-center gap-1 border ${
                            u.isActive !== false
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(u)}
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

      {/* ADMIN PASSWORD RESET MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full rounded-3xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Admin Password Reset</span>
              </h3>
              <button onClick={() => setResetModalUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Set a new secure password for <strong>{resetModalUser.name}</strong> (@{resetModalUser.username}). The password will be hashed using bcrypt.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setResetModalUser(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">Cancel</button>
                <button type="submit" disabled={resetting} className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">
                  {resetting ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserListPage;
