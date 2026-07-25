import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  User 
} from 'lucide-react';
import { fetchUsersList, fetchRolesList, assignRoleToUserApi } from '../../services/api';

const RoleAssignPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [uRes, rRes] = await Promise.all([fetchUsersList(), fetchRolesList()]);
        if (uRes.data && uRes.data.success) {
          const list = uRes.data.data;
          setUsers(list);
          if (list.length > 0) setSelectedUserId(list[0]._id);
        }
        if (rRes.data && rRes.data.success) {
          const rList = rRes.data.data;
          setRoles(rList);
          if (rList.length > 0) setSelectedRoleName(rList[0].roleName);
        }
      } catch (err) {
        console.warn('Error loading assignment data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const selectedUser = users.find((u) => u._id === selectedUserId) || users[0];

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRoleName) return;

    setSaving(true);
    setMsg('');

    try {
      const res = await assignRoleToUserApi({
        userId: selectedUserId,
        roleName: selectedRoleName,
      });
      if (res.data && res.data.success) {
        setMsg(`Role '${selectedRoleName}' assigned to '${selectedUser?.name}' successfully!`);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            <span>User-to-Role Assignment Desk</span>
          </h1>
          <p className="text-xs text-slate-400">
            Assign custom society roles or standard system roles to authenticated staff members
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Assignment Form */}
      <form onSubmit={handleAssignSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select User Account *</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Title *</label>
            <select
              value={selectedRoleName}
              onChange={(e) => setSelectedRoleName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {roles.map((r) => (
                <option key={r._id} value={r.roleName}>
                  {r.roleName} ({r.isSystemRole ? 'System' : 'Custom'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected User & Target Role Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="text-slate-400 font-medium">Target User</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>{selectedUser?.name || 'User Account'}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Current Role: {selectedUser?.role}</div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-medium">Assigned New Role</div>
            <div className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{selectedRoleName || 'Target Role'}</span>
            </div>
            <div className="text-[11px] text-slate-500">Grants permissions defined in matrix</div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            <span>Assign Role to User</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default RoleAssignPage;
