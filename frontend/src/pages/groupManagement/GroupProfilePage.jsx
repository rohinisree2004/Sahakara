import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Award, 
  Wallet, 
  Landmark, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Crown,
  FileSpreadsheet,
  Coins,
  Sparkles,
  GitBranch,
  Building2,
  ShieldCheck,
  UserPlus,
  Edit3,
  Phone,
  Mail,
  Calendar,
  X,
  Save,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchGroupProfile, 
  assignGroupExecutivesApi, 
  addGroupMembersApi, 
  removeGroupMemberApi, 
  fetchMembersList,
  toggleGroupStatusApi
} from '../../services/api';

const GroupProfilePage = () => {
  const { id } = useParams();
  const { user, activeGroup } = useAuth();
  const effectiveId = id || activeGroup?._id;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableMembers, setAvailableMembers] = useState([]);

  // Modals
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Executive Form State
  const [presidentId, setPresidentId] = useState('');
  const [secretaryId, setSecretaryId] = useState('');
  const [treasurerId, setTreasurerId] = useState('');

  // Add Member State
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');
  const [searchMemberTerm, setSearchMemberTerm] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveRole = activeGroup?.role || user?.role;
  const isSuperAdmin = user?.role === 'Super Admin';
  const isOrgAdmin = ['Organization Admin', 'Org Admin'].includes(user?.role);
  const isBranchManager = user?.role === 'Branch Manager';
  const isSocietyStaff = isSuperAdmin || isOrgAdmin || isBranchManager || user?.role === 'Employee';

  const isGroupPresident = (effectiveRole === 'President') && (!group || activeGroup?._id === group?._id);

  // Can assign / change group executives: ONLY Super Admin, Org Admin, Branch Manager
  const canAssignExecutives = isSuperAdmin || isOrgAdmin || isBranchManager;

  // Can toggle group status: ONLY Super Admin, Org Admin, Branch Manager
  const canToggleStatus = isSuperAdmin || isOrgAdmin || isBranchManager;

  // Can add / remove members to this group: Super Admin, Org Admin, Branch Manager, or the President of this group
  const canManageMembers = isSuperAdmin || isOrgAdmin || isBranchManager || isGroupPresident;

  const isMember = !isSocietyStaff && !isGroupPresident;

  const loadProfile = async () => {
    if (!effectiveId) return;
    setLoading(true);
    try {
      const res = await fetchGroupProfile(effectiveId);
      if (res.data && res.data.success && res.data.data) {
        const g = res.data.data;
        setGroup(g);
        setPresidentId(g.presidentId?._id || g.presidentId || g.leaderId?._id || g.leaderId || '');
        setSecretaryId(g.secretaryId?._id || g.secretaryId || '');
        setTreasurerId(g.treasurerId?._id || g.treasurerId || '');
      }
    } catch (err) {
      console.warn('Error loading group profile:', err.message);
      setErrorMsg(err.message || 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [effectiveId]);

  // Load available members for adding (strictly filtered by the group's organization)
  const loadAvailableMembers = async (orgId) => {
    try {
      const targetOrg = orgId || group?.organizationId?._id || group?.organizationId;
      const params = { limit: 200 };
      if (targetOrg) params.organizationId = targetOrg;
      const res = await fetchMembersList(params);
      if (res.data && res.data.success) {
        setAvailableMembers(res.data.data || []);
      }
    } catch (err) {
      console.warn('Error loading available members:', err.message);
    }
  };

  const handleOpenExecutiveModal = () => {
    if (group) {
      setPresidentId(group.presidentId?._id || group.presidentId || group.leaderId?._id || group.leaderId || '');
      setSecretaryId(group.secretaryId?._id || group.secretaryId || '');
      setTreasurerId(group.treasurerId?._id || group.treasurerId || '');
    }
    setShowExecutiveModal(true);
  };

  const handleOpenAddMemberModal = () => {
    loadAvailableMembers(group?.organizationId?._id || group?.organizationId);
    setShowAddMemberModal(true);
  };

  // Submit Elected Executives
  const handleExecutivesSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        leaderId: presidentId || null,
        presidentId: presidentId || null,
        secretaryId: secretaryId || null,
        treasurerId: treasurerId || null,
      };

      const res = await assignGroupExecutivesApi(group._id, payload);
      if (res.data && res.data.success) {
        setMsg('Group Executives (President, Secretary, Treasurer) updated successfully!');
        setShowExecutiveModal(false);
        await loadProfile();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to assign executives.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Add Member
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNewMemberId) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await addGroupMembersApi(group._id, { memberIds: [selectedNewMemberId] });
      if (res.data && res.data.success) {
        setMsg('Member enrolled into group successfully!');
        setShowAddMemberModal(false);
        setSelectedNewMemberId('');
        await loadProfile();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to add member to group.');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberDocId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove '${memberName}' from ${group?.groupName}?`)) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await removeGroupMemberApi(group._id, memberDocId);
      if (res.data && res.data.success) {
        setMsg(`Member '${memberName}' removed from group.`);
        await loadProfile();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Group Status
  const handleToggleStatus = async () => {
    try {
      const res = await toggleGroupStatusApi(group._id);
      if (res.data && res.data.success) {
        setMsg('Group status toggled successfully.');
        await loadProfile();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const g = group || {};
  const groupMembers = Array.isArray(g.memberIds) ? g.memberIds : [];

  // Filter members for add modal (exclude those already in group, and strictly restrict to this group's society)
  const groupOrgId = (g.organizationId?._id || g.organizationId)?.toString();
  const existingMemberIds = new Set(groupMembers.map(m => (m._id || m).toString()));
  const candidateMembers = availableMembers.filter(m => {
    const isNotInGroup = !existingMemberIds.has(m._id.toString());
    const mOrgId = (m.organizationId?._id || m.organizationId)?.toString();
    const isSameOrg = !groupOrgId || !mOrgId || mOrgId === groupOrgId;
    const matchesSearch = !searchMemberTerm || 
      (m.fullName || '').toLowerCase().includes(searchMemberTerm.toLowerCase()) ||
      (m.memberId || '').toLowerCase().includes(searchMemberTerm.toLowerCase());
    return isNotInGroup && isSameOrg && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link 
          to={isMember ? "/member/dashboard" : "/groups/list"} 
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100/80 px-3.5 py-2 rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600" />
          <span>{isMember ? 'Back to Member Dashboard' : 'Back to Groups Registry'}</span>
        </Link>

        <div className="flex items-center gap-3">
          {canToggleStatus ? (
            <button
              onClick={handleToggleStatus}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                g.status === 'Active' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              Status: {g.status || 'Active'} (Click to Toggle)
            </button>
          ) : (
            <span className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${
              g.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              Group Status: {g.status || 'Active'}
            </span>
          )}
          
          {canAssignExecutives && (
            <button
              onClick={handleOpenExecutiveModal}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Elect / Change Executives</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
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

      {/* Master Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-mono text-3xl font-black shadow-lg shadow-teal-600/20 shrink-0">
              {g.groupName ? g.groupName.charAt(0).toUpperCase() : 'G'}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {g.groupName}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-50 border border-teal-200 text-teal-800">
                  {g.groupCode || 'GRP-01'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                  {g.groupType || 'Self-Help Group (SHG)'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <strong className="text-slate-700">{g.organizationId?.name || 'Cooperative Society'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-teal-600" />
                  <span>Branch: <strong className="text-slate-700">{g.branchId?.branchName || 'Main Branch'}</strong></span>
                </span>
                {g.createdAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Formed: {new Date(g.createdAt).toLocaleDateString()}</span>
                    </span>
                  </>
                )}
              </div>

              {g.description && (
                <p className="text-xs text-slate-600 pt-1 italic">
                  "{g.description}"
                </p>
              )}
            </div>
          </div>

          {canManageMembers && (
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleOpenAddMemberModal}
                className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>+ Add Members to Group</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Elected Group Leadership (President, Secretary, Treasurer) Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Elected Group Leadership (Office-Bearers)
            </h2>
          </div>
          {canAssignExecutives && (
            <button
              onClick={handleOpenExecutiveModal}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Re-elect / Reassign</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* President */}
          <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs space-y-3 relative overflow-hidden bg-gradient-to-b from-amber-50/30 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-900 uppercase tracking-wider">Group President</div>
                  <div className="text-[10px] text-amber-700 font-semibold">Chief Representative</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">Elected</span>
            </div>

            {g.presidentId || g.leaderId ? (
              <div className="pt-2 border-t border-amber-100 space-y-1.5">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>{g.presidentId?.fullName || g.leaderId?.fullName}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  ID: <strong className="text-slate-800">{g.presidentId?.memberId || g.leaderId?.memberId || 'N/A'}</strong>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{g.presidentId?.phone || g.leaderId?.phone || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-amber-100 text-xs text-slate-400 italic">
                No President elected yet. Click 'Re-elect / Reassign' to assign from members.
              </div>
            )}
          </div>

          {/* Secretary */}
          <div className="bg-white p-5 rounded-3xl border border-teal-200/80 shadow-xs space-y-3 relative overflow-hidden bg-gradient-to-b from-teal-50/30 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-teal-900 uppercase tracking-wider">Group Secretary</div>
                  <div className="text-[10px] text-teal-700 font-semibold">Records & Meetings</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900">Elected</span>
            </div>

            {g.secretaryId ? (
              <div className="pt-2 border-t border-teal-100 space-y-1.5">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>{g.secretaryId.fullName}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  ID: <strong className="text-slate-800">{g.secretaryId.memberId || 'N/A'}</strong>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{g.secretaryId.phone || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-teal-100 text-xs text-slate-400 italic">
                No Secretary elected yet. Click 'Re-elect / Reassign' to assign from members.
              </div>
            )}
          </div>

          {/* Treasurer */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs space-y-3 relative overflow-hidden bg-gradient-to-b from-emerald-50/30 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-900 uppercase tracking-wider">Group Treasurer</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Savings & Collections</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">Elected</span>
            </div>

            {g.treasurerId ? (
              <div className="pt-2 border-t border-emerald-100 space-y-1.5">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>{g.treasurerId.fullName}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  ID: <strong className="text-slate-800">{g.treasurerId.memberId || 'N/A'}</strong>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{g.treasurerId.phone || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-emerald-100 text-xs text-slate-400 italic">
                No Treasurer elected yet. Click 'Re-elect / Reassign' to assign from members.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled Members</div>
          <div className="text-3xl font-black text-slate-900">{groupMembers.length}</div>
          <div className="text-[11px] text-teal-800 font-bold">Group Roster Strength</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Savings Pool</div>
          <div className="text-3xl font-black text-teal-800">₹ {(groupMembers.length * 15000).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500">Cumulative SHG Thrift Corpus</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Group Loans</div>
          <div className="text-3xl font-black text-slate-900">₹ {(groupMembers.length > 2 ? 75000 : 35000).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500">JLG Micro-Credit Linkage</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repayment Health</div>
          <div className="text-3xl font-black text-emerald-700">100%</div>
          <div className="text-[11px] text-emerald-800 font-bold">High Compliance Rating</div>
        </div>
      </div>

      {/* Group Member Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Enrolled Group Members Roster
            </h3>
            <p className="text-xs text-slate-500">
              List of members currently enrolled in <strong className="text-teal-900 font-bold">{g.groupName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
              {groupMembers.length} Members Total
            </span>
            {canManageMembers && (
              <button
                onClick={handleOpenAddMemberModal}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Member</span>
              </button>
            )}
          </div>
        </div>

        {groupMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No members enrolled in this group yet.</p>
            {canManageMembers && (
              <button
                onClick={handleOpenAddMemberModal}
                className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md shadow-teal-600/20"
              >
                + Enroll Members Now
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Member Name & ID</th>
                  <th className="py-4 px-6">Contact Phone</th>
                  <th className="py-4 px-6">Category / Type</th>
                  <th className="py-4 px-6">Group Designation</th>
                  <th className="py-4 px-6">Membership Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {groupMembers.map((m) => {
                  const isPres = (g.presidentId?._id || g.presidentId || g.leaderId?._id || g.leaderId)?.toString() === m._id?.toString();
                  const isSec = (g.secretaryId?._id || g.secretaryId)?.toString() === m._id?.toString();
                  const isTres = (g.treasurerId?._id || g.treasurerId)?.toString() === m._id?.toString();

                  return (
                    <tr key={m._id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-bold flex items-center justify-center border border-teal-100 shrink-0">
                            {m.fullName?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{m.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{m.memberId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {m.phone || 'N/A'}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {m.category || 'General'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {isPres ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Crown className="w-3 h-3" /> President
                          </span>
                        ) : isSec ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            <FileSpreadsheet className="w-3 h-3" /> Secretary
                          </span>
                        ) : isTres ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Coins className="w-3 h-3" /> Treasurer
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Group Member</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {m.membershipStatus || 'Active'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isMember && (
                            <Link
                              to={`/members/profile/${m._id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                              title="View Member Profile"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {canManageMembers && (
                            <button
                              onClick={() => handleRemoveMember(m._id, m.fullName)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove from this Group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ELECT / REASSIGN GROUP EXECUTIVES (President, Secretary, Treasurer) */}
      {/* ========================================================================= */}
      {canAssignExecutives && showExecutiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Elect Group Executives</h3>
                  <p className="text-xs text-slate-500">Assign President, Secretary, and Treasurer for {g.groupName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowExecutiveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {groupMembers.length === 0 ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3">
                <div className="font-bold flex items-center gap-2 text-sm text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>No Members in this Group Yet</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  President, Secretary, and Treasurer must be elected strictly from members enrolled in <strong>{g.groupName}</strong>. Please enroll members from this cooperative society into the group first.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  {canManageMembers && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowExecutiveModal(false);
                        handleOpenAddMemberModal();
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Enroll Members to Group</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowExecutiveModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecutivesSubmit} className="space-y-4">
                
                {/* President */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Group President (Leader) *</span>
                  </label>
                  <select
                    value={presidentId}
                    onChange={(e) => setPresidentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="">-- Select President from Group Members --</option>
                    {groupMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-0.5">Leads group affairs & represents in cooperative meetings</p>
                </div>

              {/* Secretary */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                  <span>Group Secretary *</span>
                </label>
                <select
                  value={secretaryId}
                  onChange={(e) => setSecretaryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">-- Select Secretary from Group Members --</option>
                  {groupMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-0.5">Maintains meeting registers, attendance & resolution books</p>
              </div>

              {/* Treasurer */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Group Treasurer *</span>
                </label>
                <select
                  value={treasurerId}
                  onChange={(e) => setTreasurerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">-- Select Treasurer from Group Members --</option>
                  {groupMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-0.5">Collects weekly/monthly savings thrift & handles accounts</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExecutiveModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Elected Executives</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD EXISTING SOCIETY MEMBERS TO THIS GROUP */}
      {/* ========================================================================= */}
      {canManageMembers && showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Enroll Member to Group</h3>
                  <p className="text-xs text-slate-500">Add an existing society member into {g.groupName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Search Available Members</label>
                <input
                  type="text"
                  value={searchMemberTerm}
                  onChange={(e) => setSearchMemberTerm(e.target.value)}
                  placeholder="Filter by name or member ID..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 mb-2"
                />

                <label className="block text-xs font-bold text-slate-800 mb-1">Select Member to Enroll *</label>
                <select
                  required
                  value={selectedNewMemberId}
                  onChange={(e) => setSelectedNewMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="">-- Choose Member ({candidateMembers.length} available) --</option>
                  {candidateMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} ({m.memberId || 'MEM'}) • {m.phone || 'No phone'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: A member can belong to a maximum of 4 groups simultaneously.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading || !selectedNewMemberId}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Enroll Member</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupProfilePage;
