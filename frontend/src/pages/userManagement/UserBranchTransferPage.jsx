import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle,
  Loader2, 
  Globe, 
  User,
  Building2,
  GitBranch,
  ShieldCheck
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
          if (list.length > 0) setSelectedUserId(list[0]._id);
        }
        if (bRes.data && bRes.data.success) {
          const bList = bRes.data.data;
          setBranches(bList);
          if (bList.length > 0) setSelectedBranchId(bList[0]._id);
        }
      } catch (err) {
        console.warn('Error loading transfer records:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [selectedOrgId, isSuperAdmin]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedBranchId) return;

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await transferUserBranchApi(selectedUserId, { branchId: selectedBranchId });
      if (res.data && res.data.success) {
        setMsg('User branch reallocated successfully with audit trail updated.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Branch transfer failed.');
    } finally {
      setSaving(false);
    }
  };

  const selectedUserObj = users.find(u => u._id === selectedUserId);
  const selectedBranchObj = branches.find(b => b._id === selectedBranchId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Branch Reallocation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span>User Branch Transfer Desk</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Reassign employee and teller personnel between society branches while maintaining complete transaction audit integrity.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-bold flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center gap-3 shadow-xs animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuperAdmin && organizations.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Select Cooperative Society</span>
          </label>
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500"
          >
            <option value="All">-- All Organizations --</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>{org.name}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Loading user and branch records...</p>
        </div>
      ) : (
        <form onSubmit={handleTransfer} className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                <span>Select User Account</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role}) - Current: {u.branchId?.branchName || 'Unassigned'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-teal-600" />
                <span>Target Branch Destination</span>
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.branchName} ({b.branchCode || 'BR'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Summary Preview */}
          {selectedUserObj && selectedBranchObj && (
            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/60 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] font-medium block">Current Branch:</span>
                <p className="font-bold text-slate-900">{selectedUserObj.branchId?.branchName || 'Head Office / Unassigned'}</p>
              </div>

              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <ArrowRightLeft className="w-4 h-4" />
              </div>

              <div className="text-right">
                <span className="text-slate-500 text-[11px] font-medium block">New Destination:</span>
                <p className="font-bold text-teal-800">{selectedBranchObj.branchName}</p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Execute Branch Transfer</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default UserBranchTransferPage;
