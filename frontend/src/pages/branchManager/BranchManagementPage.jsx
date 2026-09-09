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
  Building2,
  X,
  UserCheck
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
          setShowModal(false);
          loadBranches();
        }
      } else {
        const res = await createBranchApi(formData);
        if (res.data && res.data.success) {
          setMsg(`Branch '${formData.branchName}' created successfully.`);
          setShowModal(false);
          loadBranches();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save branch.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (branch) => {
    const nextStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await updateBranchApi(branch._id, { status: nextStatus });
      if (res.data && res.data.success) {
        setMsg(`Branch status updated to ${nextStatus}.`);
        loadBranches();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (branch) => {
    if (!window.confirm(`Are you sure you want to delete branch '${branch.branchName}' (${branch.branchCode})?`)) return;
    try {
      const res = await deleteBranchApi(branch._id);
      if (res.data && res.data.success) {
        setMsg(`Branch '${branch.branchName}' removed.`);
        loadBranches();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete branch.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-teal-600" />
            <span>Branch Management & Registry</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isSuperAdmin 
              ? 'Multi-tenant control: Filter and manage branches by cooperative society'
              : 'Maintain unique branch codes per organization, manage branch addresses, districts, and status'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/branches/dashboard"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span>Branch Dashboard</span>
          </Link>

          <Link
            to="/branches/manager-assign"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Assign Managers</span>
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Branch</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
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
            placeholder="Search branch name, code, district..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Super Admin Organization Selector */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span className="text-slate-500 font-bold hidden sm:inline">Society:</span>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
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

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 font-bold">Status:</span>
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
      </div>

      {/* Branch Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Branch Name</th>
                  <th className="px-6 py-3.5">Branch Code</th>
                  <th className="px-6 py-3.5">Manager</th>
                  <th className="px-6 py-3.5">District & State</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((b) => (
                  <tr key={b._id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-bold">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900">{b.branchName}</span>
                            {b.organizationId?.code && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[9px] font-bold">
                                {b.organizationId.code}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {b.organizationId?.name ? `${b.organizationId.name} • ` : ''}{b.phone || b.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-800">{b.branchCode}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{b.managerName || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-slate-700">{b.district ? `${b.district}, ${b.state}` : b.state}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'Active'
                          ? 'bg-teal-50 border-teal-200 text-teal-800'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/branches/profile/${b._id}`}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>View</span>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(b)}
                          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-colors ${
                            b.status === 'Active'
                              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                              : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{b.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors"
                          title="Edit Branch"
                        >
                          <Edit3 className="w-4 h-4 text-teal-600" />
                        </button>

                        <button
                          onClick={() => handleDelete(b)}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 border border-slate-200 shadow-xs transition-colors"
                          title="Delete Branch"
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingBranch ? 'Edit Branch Profile' : 'Create New Branch'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Organization Picker in Modal (For Super Admin) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Organization *</label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    required
                    disabled={!!editingBranch}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600 disabled:opacity-50"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    required
                    placeholder="e.g. Koramangala Extension"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Code (Unique) *</label>
                  <input
                    type="text"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    required
                    disabled={!!editingBranch}
                    placeholder="e.g. KM-05"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono uppercase font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Bengaluru Urban"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="branch@coop.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Area Location"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20">
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
