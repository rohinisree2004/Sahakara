import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  Copy, 
  Eye, 
  Power, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { fetchRolesList, cloneRoleApi, toggleRoleStatusApi, deleteRoleApi } from '../../services/api';

const RoleListPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Clone Modal State
  const [cloneModalRole, setCloneModalRole] = useState(null);
  const [cloneName, setCloneName] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchRolesList({ search, status: statusFilter });
      if (res.data && res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading roles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRoles();
  };

  const handleCloneSubmit = async (e) => {
    e.preventDefault();
    if (!cloneName) return;

    setCloneLoading(true);
    setErrorMsg('');

    try {
      const res = await cloneRoleApi(cloneModalRole._id, { newRoleName: cloneName });
      if (res.data && res.data.success) {
        setMsg(`Role cloned into '${cloneName}' successfully!`);
        setCloneModalRole(null);
        setCloneName('');
        loadRoles();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Cloning failed.');
    } finally {
      setCloneLoading(false);
    }
  };

  const handleToggleStatus = async (r) => {
    try {
      const res = await toggleRoleStatusApi(r._id);
      if (res.data && res.data.success) {
        setMsg(`Status for role '${r.roleName}' updated.`);
        loadRoles();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (r) => {
    if (r.isSystemRole) {
      alert('System roles cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete custom role '${r.roleName}'?`)) return;

    try {
      const res = await deleteRoleApi(r._id);
      if (res.data && res.data.success) {
        setMsg(`Custom role '${r.roleName}' deleted.`);
        loadRoles();
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
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>Role & Permission Matrix Registry</span>
          </h1>
          <p className="text-xs text-slate-400">
            View system roles, configure custom organization roles, clone permissions, and set active statuses
          </p>
        </div>

        <Link
          to="/roles/create"
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Custom Role</span>
        </Link>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 text-xs">
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

      {/* Roles Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r._id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{r.roleName}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      r.isSystemRole
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {r.isSystemRole ? 'System Role' : 'Custom Role'}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    r.status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{r.description}</p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/roles/details/${r._id}`}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400"
                    title="View Matrix & Users"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => { setCloneModalRole(r); setCloneName(`${r.roleName} Copy`); }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                    title="Clone Role"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!r.isSystemRole && (
                    <>
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`p-1.5 rounded-lg border ${
                          r.status === 'Active'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}
                        title={r.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(r)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CLONE ROLE MODAL */}
      {cloneModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full rounded-3xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Clone Role Permissions</h3>
              <button onClick={() => setCloneModalRole(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Duplicate permission matrix from <strong>{cloneModalRole.roleName}</strong> into a new custom role.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCloneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Cloned Role Name *</label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  required
                  placeholder="e.g. Senior Loan Officer"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCloneModalRole(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">Cancel</button>
                <button type="submit" disabled={cloneLoading} className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs">
                  {cloneLoading ? 'Cloning...' : 'Execute Clone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoleListPage;
