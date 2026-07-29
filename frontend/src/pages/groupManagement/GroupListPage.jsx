import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  Power, 
  Trash2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { fetchGroupsList, toggleGroupStatusApi, deleteGroupApi, fetchBranchesList } from '../../services/api';

const GroupListPage = () => {
  const [groups, setGroups] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');

  const [msg, setMsg] = useState('');

  const loadGroups = async () => {
    setLoading(true);
    try {
      const [gRes, bRes] = await Promise.all([
        fetchGroupsList({ search, status: statusFilter, groupType: typeFilter, branchId: branchFilter }),
        fetchBranchesList(),
      ]);
      if (gRes.data && gRes.data.success) {
        setGroups(gRes.data.data);
      }
      if (bRes.data && bRes.data.success) {
        setBranches(bRes.data.data);
      }
    } catch (err) {
      console.warn('Error loading groups:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [statusFilter, typeFilter, branchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadGroups();
  };

  const handleToggleStatus = async (g) => {
    try {
      const res = await toggleGroupStatusApi(g._id);
      if (res.data && res.data.success) {
        setMsg(`Status for group '${g.groupName}' updated.`);
        loadGroups();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (g) => {
    if (!window.confirm(`Are you sure you want to delete group '${g.groupName}'?`)) return;

    try {
      const res = await deleteGroupApi(g._id);
      if (res.data && res.data.success) {
        setMsg(`Group '${g.groupName}' removed.`);
        loadGroups();
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
            <Users className="w-6 h-6 text-teal-400" />
            <span>Member Group & SHG Registry</span>
          </h1>
          <p className="text-xs text-slate-400">
            View registered Self-Help Groups (SHG) & Joint Liability Groups (JLG), manage leaders, and track membership counts
          </p>
        </div>

        <Link
          to="/groups/create"
          className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Group</span>
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
            placeholder="Search Group name, code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Group Types</option>
            <option value="Self-Help Group (SHG)">Self-Help Group (SHG)</option>
            <option value="Joint Liability Group (JLG)">Joint Liability Group (JLG)</option>
            <option value="Farmers Group">Farmers Group</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
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
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div key={g._id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{g.groupName}</h3>
                    <span className="text-[11px] font-mono text-teal-400 font-bold">{g.groupCode}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    g.status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {g.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div>Type: <strong className="text-white">{g.groupType}</strong></div>
                  <div>Branch: <strong className="text-teal-400">{g.branchId?.branchName || 'JP Nagar'}</strong></div>
                  <div>Group Leader: <strong className="text-white">{g.leaderId?.fullName || 'Sunita Bhatt'}</strong></div>
                  <div className="font-mono text-emerald-400 pt-1 font-bold">{g.totalMembers || 12} Enrolled Members</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/groups/profile/${g._id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>Group Profile</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(g)}
                    className={`p-1.5 rounded-lg border ${
                      g.status === 'Active'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                    title={g.status === 'Active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(g)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                    title="Delete Group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default GroupListPage;
