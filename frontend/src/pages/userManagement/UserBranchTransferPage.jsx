import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  Loader2, 
  Globe, 
  User,
  Building2
} from 'lucide-react';
import { fetchUsersList, fetchBranchesList, transferUserBranchApi, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserBranchTransferPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const queryParams = {};
        if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
          queryParams.organizationId = selectedOrgId;
        }

        const [uRes, bRes] = await Promise.all([
          fetchUsersList(queryParams),
          fetchBranchesList(queryParams)
        ]);
        if (uRes.data && uRes.data.success) {
          const list = uRes.data.data;
          setUsers(list);
          setSelectedUserId(list.length > 0 ? list[0]._id : '');
        }
        if (bRes.data && bRes.data.success) {
          const bList = bRes.data.data;
          setBranches(bList);
          setSelectedBranchId(bList.length > 0 ? bList[0]._id : '');
        }
      } catch (err) {
        console.warn('Error loading transfer desk data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [selectedOrgId]);

  const selectedUser = users.find((u) => u._id === selectedUserId) || users[0];
  const targetBranch = branches.find((b) => b._id === selectedBranchId) || branches[0];

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedBranchId) return;

    setSaving(true);
    setMsg('');

    try {
      const res = await transferUserBranchApi(selectedUserId, {
        branchId: selectedBranchId,
        branchName: targetBranch ? targetBranch.branchName : '',
      });
      if (res.data && res.data.success) {
        setMsg(`Staff member '${selectedUser?.name}' transferred to '${targetBranch?.branchName}' successfully!`);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
            <span>Inter-Branch Staff Transfer Desk</span>
          </h1>
          <p className="text-xs text-slate-400">
            Reassign employees, officers, and tellers to different society branch locations while preserving historical records
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Transfer Form */}
      <form onSubmit={handleTransferSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Super Admin Organization Picker */}
        {isSuperAdmin && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Organization Scope</label>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold focus:outline-none"
              >
                <option value="All">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.code || 'ORG'})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Filtering staff and target branches for the selected cooperative society.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Employee / Staff *</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Destination Branch *</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.branchName} ({b.branchCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current vs Target Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="text-slate-400 font-medium">Selected Staff Member</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{selectedUser?.name || 'Staff Member'}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">{selectedUser?.email}</div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-medium">Target Destination Branch</div>
            <div className="text-sm font-bold text-teal-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>{targetBranch?.branchName || 'Target Branch'}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Code: {targetBranch?.branchCode}</div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
            <span>Execute Inter-Branch Transfer</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default UserBranchTransferPage;
