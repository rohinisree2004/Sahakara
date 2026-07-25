import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Power, 
  Trash2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { fetchOrganizations, updateOrgStatus } from '../../services/api';

const OrganizationListPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [actionMsg, setActionMsg] = useState('');

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetchOrganizations({
        search,
        status: statusFilter,
        type: typeFilter,
      });
      if (res.data && res.data.success) {
        setOrganizations(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading organizations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrgs();
  };

  const handleToggleStatus = async (org) => {
    const newStatus = org.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await updateOrgStatus(org._id, { status: newStatus });
      if (res.data && res.data.success) {
        setActionMsg(`Organization '${org.name}' status changed to '${newStatus}'.`);
        loadOrgs();
      }
    } catch (err) {
      console.error('Failed to update status:', err.message);
    }
  };

  const handleSoftDelete = async (org) => {
    if (!window.confirm(`Are you sure you want to soft delete '${org.name}'?`)) return;
    try {
      const res = await updateOrgStatus(org._id, { isDeleted: true });
      if (res.data && res.data.success) {
        setActionMsg(`Organization '${org.name}' removed.`);
        loadOrgs();
      }
    } catch (err) {
      console.error('Soft delete error:', err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>Cooperative Organizations Registry</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage all registered tenant societies, search records, suspend or reactivate platform access
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search society name, code, state..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
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
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Credit Cooperative">Credit Co-op</option>
              <option value="Agricultural Cooperative">Agricultural Co-op</option>
              <option value="Housing Cooperative">Housing Co-op</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
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
                  <th className="px-6 py-4">Organization Name</th>
                  <th className="px-6 py-4">Org Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {organizations.map((org) => (
                  <tr key={org._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{org.name}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{org.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{org.code}</td>
                    <td className="px-6 py-4">{org.societyType}</td>
                    <td className="px-6 py-4">{org.city ? `${org.city}, ${org.state}` : org.state}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        org.status === 'Active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/super-admin/organizations/${org._id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(org)}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-colors ${
                            org.status === 'Active'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{org.status === 'Active' ? 'Suspend' : 'Reactivate'}</span>
                        </button>

                        <button
                          onClick={() => handleSoftDelete(org)}
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

export default OrganizationListPage;
