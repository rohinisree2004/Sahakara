import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Power, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { fetchGroupsList, updateGroupStatus, deleteGroupApi, fetchBranchesList } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const GroupListPage = () => {
  const { user } = useAuth();
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const defaultBranch = isBranchScoped ? (user?.branchId?._id || user?.branchId || '') : 'All';

  const [groups, setGroups] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState(defaultBranch);

  const [msg, setMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        groupType: typeFilter,
        status: statusFilter,
        branchId: isBranchScoped ? defaultBranch : branchFilter,
      };

      const [gRes, bRes] = await Promise.all([
        fetchGroupsList(params),
        fetchBranchesList(isBranchScoped && defaultBranch ? { branchId: defaultBranch } : {})
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
    loadData();
  }, [typeFilter, statusFilter, branchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleStatus = async (group) => {
    const nextStatus = group.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await updateGroupStatus(group._id, nextStatus);
      if (res.data && res.data.success) {
        setMsg(`Group status updated to ${nextStatus}.`);
        loadData();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err.message);
    }
  };

  const handleDelete = async (group) => {
    if (!window.confirm(`Are you sure you want to delete group '${group.groupName}'?`)) return;
    try {
      const res = await deleteGroupApi(group._id);
      if (res.data && res.data.success) {
        setMsg(`Group '${group.groupName}' deleted successfully.`);
        loadData();
      }
    } catch (err) {
      console.error('Failed to delete group:', err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>Member Group & SHG Registry</span>
          </h1>
          <p className="text-xs text-slate-500">
            View registered Self-Help Groups (SHG) & Joint Liability Groups (JLG), manage leaders, and track membership counts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/groups/dashboard"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Group Dashboard</span>
          </Link>

          <Link
            to="/groups/create"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Group</span>
          </Link>
        </div>
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
            placeholder="Search Group name, code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="All">All Group Types</option>
            <option value="Self-Help Group (SHG)">Self-Help Group (SHG)</option>
            <option value="Joint Liability Group (JLG)">Joint Liability Group (JLG)</option>
            <option value="Farmers Group">Farmers Group</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
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
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div key={g._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:border-teal-300 hover:shadow-soft-teal transition-all">
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{g.groupName}</h3>
                      {g.organizationId?.code && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[9px] font-bold">
                          {g.organizationId.code}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-teal-800 font-bold">{g.groupCode}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    g.status === 'Active'
                      ? 'bg-teal-50 border-teal-200 text-teal-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {g.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>Type: <strong className="text-slate-900">{g.groupType}</strong></div>
                  <div>Branch: <strong className="text-teal-800">{g.branchId?.branchName || 'Unassigned'}</strong></div>
                  {g.organizationId?.name && (
                    <div className="text-[11px] text-slate-400">Society: <span>{g.organizationId.name}</span></div>
                  )}

                  {/* Executives Mini Trio */}
                  <div className="pt-2 pb-1 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="text-amber-800 font-bold">President</div>
                      <div className="text-slate-900 font-semibold truncate">{g.presidentId?.fullName || g.leaderId?.fullName || 'None'}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200">
                      <div className="text-teal-800 font-bold">Secretary</div>
                      <div className="text-slate-900 font-semibold truncate">{g.secretaryId?.fullName || 'None'}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="text-emerald-800 font-bold">Treasurer</div>
                      <div className="text-slate-900 font-semibold truncate">{g.treasurerId?.fullName || 'None'}</div>
                    </div>
                  </div>

                  <div className="font-mono text-teal-800 pt-1 font-bold">{g.totalMembers || (g.memberIds?.length || 0)} Enrolled Members</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/groups/profile/${g._id}`}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to={`/groups/leader`}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Elect / Change Executives"
                  >
                    <span>Elect</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(g)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      g.status === 'Active'
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                    }`}
                    title={g.status === 'Active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(g)}
                    className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 border border-slate-200 shadow-xs transition-colors"
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
