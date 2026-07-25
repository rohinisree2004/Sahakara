import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Power, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  Phone, 
  Mail, 
  User 
} from 'lucide-react';
import { fetchOrgBranches, createOrgBranch, updateOrgBranch, deleteOrgBranch } from '../../services/api';

const OrgBranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    managerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await fetchOrgBranches();
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
  }, []);

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormData({
      branchName: '',
      branchCode: '',
      managerName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      branchName: branch.branchName || '',
      branchCode: branch.branchCode || '',
      managerName: branch.managerName || '',
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      if (editingBranch) {
        const res = await updateOrgBranch(editingBranch._id, formData);
        if (res.data && res.data.success) {
          setMsg(`Branch '${formData.branchName}' updated successfully.`);
        }
      } else {
        const res = await createOrgBranch(formData);
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
      const res = await updateOrgBranch(branch._id, { status: newStatus });
      if (res.data && res.data.success) {
        setMsg(`Branch '${branch.branchName}' set to ${newStatus}.`);
        loadBranches();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (branch) => {
    if (!window.confirm(`Are you sure you want to remove branch '${branch.branchName}'?`)) return;
    try {
      const res = await deleteOrgBranch(branch._id);
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
            <Globe className="w-6 h-6 text-emerald-400" />
            <span>Branch Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create society operational branches, assign branch managers, manage contact info and operational status
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Branches Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div key={b._id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{b.branchName}</h3>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">Code: {b.branchCode}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    b.status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Manager: <strong>{b.managerName || 'Unassigned'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{b.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{b.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{b.address ? `${b.address}, ${b.city}` : 'Address not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(b)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    b.status === 'Active'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{b.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingBranch ? 'Edit Branch Details' : 'Create New Branch'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    required
                    placeholder="e.g. JP Nagar Branch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Code *</label>
                  <input
                    type="text"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    required
                    placeholder="e.g. JP-01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Manager Name</label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="e.g. Mahesh Rao"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="branch@coop.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Area Address"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs">
                  {saving ? 'Saving...' : editingBranch ? 'Update Branch' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrgBranchesPage;
