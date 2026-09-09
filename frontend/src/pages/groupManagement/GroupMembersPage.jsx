import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  ArrowRightLeft, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Users,
  ArrowLeft,
  Building2,
  GitBranch,
  Search,
  ExternalLink
} from 'lucide-react';
import { 
  fetchGroupsList, 
  fetchMembersList, 
  addGroupMembersApi, 
  transferGroupMemberApi,
  removeGroupMemberApi,
  fetchBranchesList
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const GroupMembersPage = () => {
  const { user } = useAuth();
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const [groups, setGroups] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [branches, setBranches] = useState([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState('allocate'); // 'allocate' | 'transfer'

  // Allocation State
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');

  // Transfer State
  const [transferMemberId, setTransferMemberId] = useState('');
  const [sourceGroupId, setSourceGroupId] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const branchParams = isBranchScoped && userBranchId ? { branchId: userBranchId } : {};
      const [gRes, mRes, bRes] = await Promise.all([
        fetchGroupsList(branchParams),
        fetchMembersList({ ...branchParams, limit: 150 }),
        fetchBranchesList(branchParams)
      ]);

      if (gRes.data && gRes.data.success) {
        const gList = gRes.data.data || [];
        setGroups(gList);
        if (gList.length > 0) {
          if (!selectedGroupId) setSelectedGroupId(gList[0]._id);
          if (!sourceGroupId) setSourceGroupId(gList[0]._id);
          if (!targetGroupId && gList.length > 1) setTargetGroupId(gList[1]._id);
        }
      }

      if (mRes.data && mRes.data.success) {
        setAllMembers(mRes.data.data || []);
      }

      if (bRes.data && bRes.data.success) {
        setBranches(bRes.data.data || []);
      }
    } catch (err) {
      console.warn('Error loading member allocation data:', err.message);
      setErrorMsg('Unable to load group roster dependencies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isBranchScoped, userBranchId]);

  const selectedGroup = groups.find(g => g._id === selectedGroupId) || groups[0];
  const sourceGroup = groups.find(g => g._id === sourceGroupId) || groups[0];
  const groupRoster = Array.isArray(selectedGroup?.memberIds) ? selectedGroup.memberIds : [];
  const sourceRoster = Array.isArray(sourceGroup?.memberIds) ? sourceGroup.memberIds : [];

  // Exclude members already in selected group and strictly restrict to same society as selected group
  const targetOrgId = (selectedGroup?.organizationId?._id || selectedGroup?.organizationId)?.toString();
  const enrolledIdSet = new Set(groupRoster.map(m => (m._id || m).toString()));
  const candidateMembers = allMembers.filter(m => {
    const notEnrolled = !enrolledIdSet.has(m._id.toString());
    const mOrgId = (m.organizationId?._id || m.organizationId)?.toString();
    const sameOrg = !targetOrgId || !mOrgId || mOrgId === targetOrgId;
    const term = memberSearch.toLowerCase();
    const matches = !term || 
      (m.fullName || '').toLowerCase().includes(term) ||
      (m.memberId || '').toLowerCase().includes(term) ||
      (m.phone || '').includes(term);
    return notEnrolled && sameOrg && matches;
  });

  const handleMemberToggle = (mId) => {
    setSelectedMemberIds(prev =>
      prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
    );
  };

  // Submit Allocation
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || selectedMemberIds.length === 0) return;

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await addGroupMembersApi(selectedGroupId, { memberIds: selectedMemberIds });
      if (res.data && res.data.success) {
        setMsg(`${selectedMemberIds.length} member(s) enrolled into '${selectedGroup?.groupName}' successfully!`);
        setSelectedMemberIds([]);
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to allocate members.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Transfer
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferMemberId || !sourceGroupId || !targetGroupId) return;
    if (sourceGroupId === targetGroupId) {
      setErrorMsg('Source and target groups must be different.');
      return;
    }

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await transferGroupMemberApi({
        memberId: transferMemberId,
        sourceGroupId,
        targetGroupId,
      });
      if (res.data && res.data.success) {
        setMsg('Member transferred between groups successfully!');
        setTransferMemberId('');
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to transfer member.');
    } finally {
      setSaving(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberDocId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove '${memberName}' from ${selectedGroup?.groupName}?`)) return;
    setSaving(true);
    try {
      const res = await removeGroupMemberApi(selectedGroupId, memberDocId);
      if (res.data && res.data.success) {
        setMsg(`Member '${memberName}' removed from group.`);
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove member.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            to="/groups/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Groups Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Member Roster Allocation & Transfer Desk
              </h1>
              <p className="text-xs text-slate-500">
                Enroll society members into SHG/JLG groups or transfer members seamlessly between groups
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('allocate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'allocate' 
                ? 'bg-white text-teal-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>Allocate Members</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'transfer' 
                ? 'bg-white text-teal-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-teal-600" />
            <span>Transfer Members</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg('')} className="text-teal-600 hover:text-teal-900 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* TAB 1: ALLOCATE MEMBERS TO GROUP */}
      {activeTab === 'allocate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Allocation Form & Member Selection */}
          <form onSubmit={handleAllocateSubmit} className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                Target Group for Member Enrollment *
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              >
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.groupName} ({g.groupCode}) — {g.branchId?.branchName || 'Main'} [{g.totalMembers || 0} Members]
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Member Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Members to Add ({selectedMemberIds.length} Chosen)
                </label>
                <div className="text-xs text-slate-400 font-medium">
                  {candidateMembers.length} available to enroll
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Filter available members by name or ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Grid of Candidate Members */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                {candidateMembers.length === 0 ? (
                  <div className="col-span-2 text-center p-8 text-slate-400 text-xs font-semibold">
                    No additional candidate members found matching your search.
                  </div>
                ) : (
                  candidateMembers.map((m) => {
                    const checked = selectedMemberIds.includes(m._id);
                    return (
                      <label 
                        key={m._id} 
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all ${
                          checked 
                            ? 'bg-teal-50/80 border-teal-400 shadow-xs' 
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleMemberToggle(m._id)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 shrink-0"
                        />
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {m.fullName?.charAt(0) || 'M'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-xs truncate">{m.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{m.memberId || 'MEM'} • {m.phone || 'N/A'}</div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                A member can participate in up to 4 cooperative groups.
              </span>

              <button
                type="submit"
                disabled={saving || selectedMemberIds.length === 0}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Enroll Selected Members ({selectedMemberIds.length})</span>
              </button>
            </div>

          </form>

          {/* Right: Current Group Roster Preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Group Roster</h3>
                <div className="text-xs text-teal-800 font-bold">{selectedGroup?.groupName}</div>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                {groupRoster.length} Members
              </span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {groupRoster.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-xs font-semibold">
                  No members in this group yet.
                </div>
              ) : (
                groupRoster.map((m) => (
                  <div key={m._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">{m.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{m.memberId || 'MEM'} • {m.phone || 'N/A'}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m._id, m.fullName)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove from group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TRANSFER MEMBERS BETWEEN GROUPS */}
      {activeTab === 'transfer' && (
        <form onSubmit={handleTransferSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-6 max-w-3xl">
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Transfer Member from One Group to Another
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Move an active member from source SHG/JLG collective to target group
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Source Group (Current Group) *
              </label>
              <select
                value={sourceGroupId}
                onChange={(e) => setSourceGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
              >
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>{g.groupName} ({g.groupCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Group (Destination) *
              </label>
              <select
                value={targetGroupId}
                onChange={(e) => setTargetGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
              >
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>{g.groupName} ({g.groupCode})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Member to Transfer *
            </label>
            <select
              required
              value={transferMemberId}
              onChange={(e) => setTransferMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
            >
              <option value="">-- Choose Member from Source Group ({sourceRoster.length} members) --</option>
              {sourceRoster.map((m) => (
                <option key={m._id} value={m._id}>{m.fullName} ({m.memberId || 'MEM'}) • {m.phone || 'N/A'}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving || !transferMemberId}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
              <span>Execute Member Transfer</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default GroupMembersPage;
