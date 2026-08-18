import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Power, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Building2
} from 'lucide-react';
import { fetchBranchesList, createBranchApi, updateBranchApi, deleteBranchApi, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BranchManagementPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    organizationId: '',
    branchName: '',
    branchCode: '',
    district: '',
    state: 'Karnataka',
    phone: '',
    email: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);
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

  const loadBranches = async () => {
    setLoading(true);
    try {
      const params = { search, status: statusFilter };
      if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
        params.organizationId = selectedOrgId;
      }
      const res = await fetchBranchesList(params);
      if (res.data && res.data.success) {
        setBranches(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading branches:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [statusFilter, selectedOrgId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBranches();
  };

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormData({
      organizationId: isSuperAdmin && selectedOrgId !== 'All' ? selectedOrgId : (organizations[0]?._id || ''),
      branchName: '',
      branchCode: '',
      district: '',
      state: 'Karnataka',
      phone: '',
      email: '',
      address: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      organizationId: branch.organizationId?._id || branch.organizationId || '',
      branchName: branch.branchName || '',
      branchCode: branch.branchCode || '',
      district: branch.district || '',
      state: branch.state || 'Karnataka',
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      if (editingBranch) {
        const res = await updateBranchApi(editingBranch._id, formData);
        if (res.data && res.data.success) {
          setMsg(`Branch '${formData.branchName}' updated successfully.`);
        }
      } else {
        const res = await createBranchApi(formData);
        if (res.data && res.data.success) {
          setMsg(`Branch '${formData.branchName}' created successfully.`);
        }
      }
      setShowModal(false);
      loadBranches();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (branch) => {
    const newStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await updateBranchApi(branch._id, { status: newStatus });
      if (res.data && res.data.success) {
        setMsg(`Branch '${branch.branchName}' set to ${newStatus}.`);
        loadBranches();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (branch) => {
    if (!window.confirm(`Are you sure you want to soft delete branch '${branch.branchName}'?`)) return;
    try {
      const res = await deleteBranchApi(branch._id);
      if (res.data && res.data.success) {
        setMsg(`Branch '${branch.branchName}' removed.`);
        loadBranches();
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
            <Globe className="w-6 h-6 text-teal-400" />
            <span>Branch Management & Registry</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isSuperAdmin 
              ? 'Multi-tenant control: Filter and manage branches by cooperative society'
              : 'Maintain unique branch codes per organization, manage branch addresses, districts, and status'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/branches/dashboard"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
          >
            <Globe className="w-4 h-4" />
            <span>Branch Dashboard</span>
          </Link>

          <Link
            to="/branches/manager-assign"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
          >
            <span>Assign Managers</span>
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Branch</span>
          </button>
        </div>
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
            placeholder="Search branch name, code, district..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Super Admin Organization Selector */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 font-semibold hidden sm:inline">Society:</span>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
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

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400 font-semibold">Status:</span>
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
      </div>

      {/* Branch Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Branch Name</th>
                  <th className="px-6 py-4">Branch Code</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">District & State</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {branches.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{b.branchName}</span>
                            {b.organizationId?.code && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px]">
                                {b.organizationId.code}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {b.organizationId?.name ? `${b.organizationId.name} • ` : ''}{b.phone || b.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-400">{b.branchCode}</td>
                    <td className="px-6 py-4 font-medium text-white">{b.managerName || 'Unassigned'}</td>
                    <td className="px-6 py-4">{b.district ? `${b.district}, ${b.state}` : b.state}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'Active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/branches/profile/${b._id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(b)}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-colors ${
                            b.status === 'Active'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{b.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(b)}
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

      {/* CREATE / EDIT MODAL WITH UNIQUE CODE CHECK */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingBranch ? 'Edit Branch Profile' : 'Create New Branch'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Organization Picker in Modal (For Super Admin) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Organization *</label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    required
                    disabled={!!editingBranch}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold focus:outline-none disabled:opacity-50"
                  >
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.name} ({org.code || 'ORG'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    required
                    placeholder="e.g. Koramangala Extension"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Code (Unique) *</label>
                  <input
                    type="text"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    required
                    disabled={!!editingBranch}
                    placeholder="e.g. KM-05"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500 uppercase disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Bengaluru Urban"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="branch@coop.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Area Location"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs">
                  {saving ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BranchManagementPage;
