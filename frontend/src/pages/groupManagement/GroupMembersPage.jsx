import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  ArrowRightLeft, 
  Trash2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { fetchGroupsList, fetchMembersList, addGroupMembersApi, transferGroupMemberApi } from '../../services/api';

const GroupMembersPage = () => {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Add Member State
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Transfer Member State
  const [transferMemberId, setTransferMemberId] = useState('');
  const [sourceGroupId, setSourceGroupId] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [gRes, mRes] = await Promise.all([fetchGroupsList(), fetchMembersList()]);
        if (gRes.data && gRes.data.success) {
          const gList = gRes.data.data;
          setGroups(gList);
          if (gList.length > 0) {
            setSelectedGroupId(gList[0]._id);
            setSourceGroupId(gList[0]._id);
            if (gList.length > 1) setTargetGroupId(gList[1]._id);
          }
        }
        if (mRes.data && mRes.data.success) {
          const mList = mRes.data.data;
          setMembers(mList);
          if (mList.length > 0) {
            setSelectedMemberId(mList[0]._id);
            setTransferMemberId(mList[0]._id);
          }
        }
      } catch (err) {
        console.warn('Error loading member allocation data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !selectedMemberId) return;

    setSaving(true);
    setMsg('');

    try {
      const res = await addGroupMembersApi(selectedGroupId, { memberIds: [selectedMemberId] });
      if (res.data && res.data.success) {
        setMsg('Member added to group successfully!');
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferMemberId || !targetGroupId) return;

    setSaving(true);
    setMsg('');

    try {
      const res = await transferGroupMemberApi({
        memberId: transferMemberId,
        sourceGroupId,
        targetGroupId,
      });
      if (res.data && res.data.success) {
        setMsg('Member transferred between groups successfully!');
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
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-teal-400" />
            <span>Member Allocation & Transfer Desk</span>
          </h1>
          <p className="text-xs text-slate-400">
            Allocate society members to SHG/JLG groups or transfer members between existing groups
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Add Member Form */}
      <form onSubmit={handleAddSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">1. Allocate Member to Group</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Group *</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.groupName} ({g.groupCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member *</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.fullName} ({m.memberId})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Add Member to Group</span>
          </button>
        </div>
      </form>

      {/* Inter-Group Transfer Form */}
      <form onSubmit={handleTransferSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">2. Inter-Group Member Transfer</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member *</label>
            <select
              value={transferMemberId}
              onChange={(e) => setTransferMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.fullName} ({m.memberId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Source Group</label>
            <select
              value={sourceGroupId}
              onChange={(e) => setSourceGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.groupName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Destination Group *</label>
            <select
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.groupName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
            <span>Execute Member Transfer</span>
          </button>
        </div>
      </form>

    </div>
  );
};

export default GroupMembersPage;
