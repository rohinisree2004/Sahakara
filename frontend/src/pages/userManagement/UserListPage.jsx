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
  Building2,
  X
} from 'lucide-react';
import { fetchUsersList, resetUserPasswordApi, toggleUserStatusApi, deleteUserApi, fetchBranchesList, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserListPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState(isBranchScoped ? userBranchId : 'All');
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
      const effectiveBranch = isBranchScoped ? userBranchId : branchFilter;
      const userParams = { search, role: roleFilter, branchId: effectiveBranch, status: statusFilter };
      const branchParams = {};

      if (isBranchScoped && userBranchId) {
        branchParams.branchId = userBranchId;
      }

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
        setMsg(`Status updated for ${u.name}.`);
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
    if (!resetModalUser || !newPassword) return;

    setResetting(true);
    setErrorMsg('');
    try {
      const res = await resetUserPasswordApi(resetModalUser._id, { newPassword });
      if (res.data && res.data.success) {
        setMsg(`Password reset successfully for ${resetModalUser.username}.`);
        setResetModalUser(null);
        setNewPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to delete user account '${u.name}' (@${u.username})?`)) return;
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>User Directory & Accounts</span>
          </h1>
          <p className="text-xs text-slate-500">
            Search society members, staff officers, and admins, perform bcrypt password resets, and toggle account statuses
          </p>
        </div>

        <Link
          to="/users/create"
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </Link>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Super Admin Organization Filter */}
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              <select
                value={selectedOrgId}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  setBranchFilter('All');
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-teal-900 font-bold focus:bg-white focus:outline-none focus:border-teal-600"
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

          <Filter className="w-4 h-4 text-slate-400" />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="All">All Roles</option>
            <option value="Organization Admin">Org Admin</option>
            <option value="Branch Manager">Branch Manager</option>
            <option value="Employee">Employee</option>
            <option value="Member">Member</option>
          </select>

          {!isBranchScoped && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:outline-none focus:border-teal-600"
            >
              <option value="All">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.branchName}</option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:outline-none focus:border-teal-600"
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
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <Users className="w-12 h-12 text-teal-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Users Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active user accounts matched the selected organization or filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">User Name</th>
                  <th className="px-6 py-3.5">Role Title</th>
                  <th className="px-6 py-3.5">Branch Location</th>
                  <th className="px-6 py-3.5">Contact Info</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-mono font-bold">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {u.organizationId?.code && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[9px] font-bold">
                                {u.organizationId.code}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono font-normal">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 border border-teal-200 text-teal-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div>{u.branchId ? u.branchId.branchName || 'Assigned Branch' : 'Head Office'}</div>
                      {u.organizationId?.name && (
                        <div className="text-[10px] text-slate-400">{u.organizationId.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{u.email}</div>
                      <div className="text-slate-400 text-[11px]">{u.phone || '+91 99000 00000'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.isActive !== false
                          ? 'bg-teal-50 border-teal-200 text-teal-800'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-amber-700 border border-slate-200 font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-xl font-bold flex items-center gap-1 border transition-colors ${
                            u.isActive !== false
                              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                              : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 border border-slate-200 shadow-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Admin Password Reset</span>
              </h3>
              <button onClick={() => setResetModalUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set a new secure password for <strong className="text-slate-900">{resetModalUser.name}</strong> (@{resetModalUser.username}). The password will be hashed using bcrypt.
            </p>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setResetModalUser(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" disabled={resetting} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20">
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
