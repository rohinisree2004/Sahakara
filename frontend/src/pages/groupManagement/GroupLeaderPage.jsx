import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Loader2, 
  Users, 
  User 
} from 'lucide-react';
import { fetchGroupsList, fetchMembersList, assignGroupLeaderApi } from '../../services/api';

const GroupLeaderPage = () => {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  
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
          if (gList.length > 0) setSelectedGroupId(gList[0]._id);
        }
        if (mRes.data && mRes.data.success) {
          const mList = mRes.data.data;
          setMembers(mList);
          if (mList.length > 0) setSelectedLeaderId(mList[0]._id);
        }
      } catch (err) {
        console.warn('Error loading leader desk data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const selectedGroup = groups.find((g) => g._id === selectedGroupId) || groups[0];
  const selectedLeader = members.find((m) => m._id === selectedLeaderId) || members[0];

  const handleLeaderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !selectedLeaderId) return;

    setSaving(true);
    setMsg('');

    try {
      const res = await assignGroupLeaderApi(selectedGroupId, { leaderId: selectedLeaderId });
      if (res.data && res.data.success) {
        setMsg(`Group Leader for '${selectedGroup?.groupName}' updated to '${selectedLeader?.fullName}' successfully!`);
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
            <Award className="w-6 h-6 text-amber-400" />
            <span>Group Leader Assignment Desk</span>
          </h1>
          <p className="text-xs text-slate-400">
            Assign or transfer designated Group Leaders for Self-Help Groups (SHG) and Joint Liability Groups (JLG)
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Leader Assignment Form */}
      <form onSubmit={handleLeaderSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Group *</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.groupName} ({g.groupCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select New Group Leader *</label>
            <select
              value={selectedLeaderId}
              onChange={(e) => setSelectedLeaderId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.memberId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Group vs Leader Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="text-slate-400 font-medium">Selected Group</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              <span>{selectedGroup?.groupName || 'Target Group'}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Code: {selectedGroup?.groupCode}</div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-medium">Designated Leader</div>
            <div className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>{selectedLeader?.fullName || 'Selected Leader'}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">ID: {selectedLeader?.memberId} • {selectedLeader?.phone}</div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            <span>Assign Group Leader</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default GroupLeaderPage;
