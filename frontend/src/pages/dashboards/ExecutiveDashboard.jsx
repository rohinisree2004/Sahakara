import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Scale, 
  Calendar, 
  Banknote, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  PieChart, 
  Loader2, 
  FileCheck,
  Plus,
  Search,
  UserPlus,
  UserCheck,
  UserMinus,
  Eye,
  AlertCircle,
  Info,
  Lock,
  Crown,
  Layers,
  Phone,
  Mail,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';
import { 
  fetchOrgDashboard, 
  getLoans, 
  fetchMembersList, 
  fetchMeetingsList,
  fetchMyGroupsApi,
  fetchGroupsList,
  fetchGroupProfile,
  addGroupMembersApi,
  removeGroupMemberApi,
  fetchSavingsAccounts,
  reviewLoanApi
} from '../../services/api';

const ExecutiveDashboard = () => {
  const { user, activeGroup, switchActiveGroup } = useAuth();
  const navigate = useNavigate();

  // Core State
  const [loading, setLoading] = useState(true);
  const [myMember, setMyMember] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(activeGroup?._id || null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  
  // Stats & Secondary data
  const [meetings, setMeetings] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [mySavings, setMySavings] = useState([]);
  const [myLoans, setMyLoans] = useState([]);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [societyMembers, setSocietyMembers] = useState([]);
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // 1. Initial Load: Find Member Record & All Associated Groups
  useEffect(() => {
    const initializePresidentDesk = async () => {
      try {
        setLoading(true);
        const [memListRes, myGroupsRes, meetingsRes, loansRes] = await Promise.allSettled([
          fetchMembersList({ search: user?.phone || user?.email || user?.name }),
          fetchMyGroupsApi(),
          fetchMeetingsList({ status: 'Scheduled' }),
          getLoans({ status: 'Submitted' })
        ]);

        let resolvedMember = null;
        if (memListRes.status === 'fulfilled' && memListRes.value.data?.data) {
          const list = memListRes.value.data.data;
          resolvedMember = list.find(m => m.userId === user?._id || m.phone === user?.phone || m.email === user?.email) || list[0] || null;
          setMyMember(resolvedMember);
        }

        let userGroupsList = [];
        if (myGroupsRes.status === 'fulfilled' && myGroupsRes.value.data?.data) {
          userGroupsList = myGroupsRes.value.data.data || [];
          setGroups(userGroupsList);
        }

        if (meetingsRes.status === 'fulfilled' && meetingsRes.value.data?.data) {
          setMeetings(meetingsRes.value.data.data || []);
        }

        if (loansRes.status === 'fulfilled' && loansRes.value.data?.data) {
          const lData = loansRes.value.data.data;
          setPendingLoans(Array.isArray(lData) ? lData : []);
        }

        // Set initial selected group: Always prioritize activeGroup chosen during login
        const targetGroupId = activeGroup?._id || (userGroupsList.length > 0 ? userGroupsList[0]._id : null);
        if (targetGroupId) {
          setSelectedGroupId(targetGroupId);
        }
      } catch (err) {
        console.error('Failed to load president desk:', err);
      } finally {
        setLoading(false);
      }
    };

    initializePresidentDesk();
  }, [user]);

  // Sync selected group if activeGroup in AuthContext changes
  useEffect(() => {
    if (activeGroup?._id && activeGroup._id !== selectedGroupId) {
      setSelectedGroupId(activeGroup._id);
    }
  }, [activeGroup]);

  // 2. Fetch Selected Group Detailed Profile
  const loadGroupDetails = useCallback(async (groupId) => {
    if (!groupId) return;
    try {
      setGroupLoading(true);
      const res = await fetchGroupProfile(groupId);
      if (res.data?.success) {
        setSelectedGroup(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching group profile:', err);
    } finally {
      setGroupLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupDetails(selectedGroupId);
    }
  }, [selectedGroupId, loadGroupDetails]);

  // 3. Load Personal Financials if in Member View
  useEffect(() => {
    if (myMember?._id) {
      Promise.allSettled([
        fetchSavingsAccounts({ memberId: myMember._id }),
        getLoans({ memberId: myMember._id, myOnly: 'true' })
      ]).then(([sRes, lRes]) => {
        if (sRes.status === 'fulfilled' && sRes.value.data?.data) {
          setMySavings(sRes.value.data.data || []);
        }
        if (lRes.status === 'fulfilled' && lRes.value.data?.data) {
          setMyLoans(lRes.value.data.data || []);
        }
      }).catch(console.error);
    }
  }, [myMember]);

  // Helper: Check if user is President of the selected group
  const isPresidentOfSelected = () => {
    if (!selectedGroup) return false;
    if (user?.role === 'Super Admin' || user?.role === 'Organization Admin') return true;

    // Check if activeGroup matches selected group and has President role
    if (activeGroup?._id === selectedGroup._id && activeGroup.role === 'President') return true;

    // Check in user groups list
    const groupInList = groups.find(g => (g._id === selectedGroup._id || g._id === selectedGroupId));
    if (groupInList && groupInList.role === 'President') return true;

    const presId = (selectedGroup.presidentId?._id || selectedGroup.presidentId)?.toString();
    const leadId = (selectedGroup.leaderId?._id || selectedGroup.leaderId)?.toString();
    const myId = myMember?._id?.toString();
    if (myId && (presId === myId || leadId === myId)) return true;

    if (user?.role === 'President' && activeGroup?._id === selectedGroup._id) return true;
    return false;
  };

  const isPresidentMode = isPresidentOfSelected();

  const handleSelectPerspective = (grp) => {
    setSelectedGroupId(grp._id);
    const targetRoute = switchActiveGroup(grp, grp.role);
    if (grp.role !== 'President') {
      navigate(targetRoute);
    }
  };

  // 4. Open Add Member Modal
  const handleOpenAddMemberModal = async () => {
    setSelectedCandidateIds([]);
    setCandidateSearchTerm('');
    setActionError('');
    setActionSuccess('');
    setShowAddMemberModal(true);
    try {
      const res = await fetchMembersList({
        organizationId: selectedGroup?.organizationId?._id || selectedGroup?.organizationId,
        limit: 100
      });
      if (res.data?.success) {
        const allMems = res.data.data || [];
        // Filter out members already in this group
        const existingMemberIds = (selectedGroup?.memberIds || []).map(m => m._id || m);
        const candidates = allMems.filter(m => !existingMemberIds.includes(m._id));
        setSocietyMembers(candidates);
      }
    } catch (err) {
      console.error('Failed to load candidate members:', err);
    }
  };

  // 5. Submit Add Members to Group
  const handleAddMembersSubmit = async (e) => {
    e.preventDefault();
    if (selectedCandidateIds.length === 0) {
      setActionError('Please select at least one member to add.');
      return;
    }
    try {
      setAddingMembers(true);
      setActionError('');
      await addGroupMembersApi(selectedGroupId, { memberIds: selectedCandidateIds });
      setActionSuccess(`Successfully added ${selectedCandidateIds.length} member(s) to ${selectedGroup?.groupName}!`);
      setShowAddMemberModal(false);
      loadGroupDetails(selectedGroupId);
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to add members to group.');
    } finally {
      setAddingMembers(false);
    }
  };

  const [forwardingLoanId, setForwardingLoanId] = useState(null);

  // Forward Loan to Branch Manager
  const handleForwardLoan = async (loanId) => {
    try {
      setForwardingLoanId(loanId);
      setActionError('');
      const res = await reviewLoanApi(loanId, {
        action: 'Recommended',
        remarks: 'Recommended by Group President and forwarded to Branch Manager for sanction.'
      });
      if (res.data?.success) {
        setActionSuccess('Loan application recommended and forwarded to Branch Manager successfully!');
        const loansRes = await getLoans({ status: 'Submitted' });
        if (loansRes.data?.data) {
          setPendingLoans(Array.isArray(loansRes.data.data) ? loansRes.data.data : []);
        }
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to forward loan application.');
    } finally {
      setForwardingLoanId(null);
    }
  };

  // 6. Remove Member from Group
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName || 'this member'} from ${selectedGroup?.groupName}?`)) {
      return;
    }
    try {
      await removeGroupMemberApi(selectedGroupId, memberId);
      setActionSuccess(`Removed ${memberName} from group.`);
      loadGroupDetails(selectedGroupId);
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to remove member.');
    }
  };

  // Filter Group Roster
  const filteredGroupMembers = (selectedGroup?.memberIds || []).filter(m => {
    if (!memberSearchTerm.trim()) return true;
    const q = memberSearchTerm.toLowerCase();
    const name = (m.fullName || `${m.firstName || ''} ${m.lastName || ''}`).toLowerCase();
    const code = (m.memberId || '').toLowerCase();
    const phone = (m.phone || '').toLowerCase();
    return name.includes(q) || code.includes(q) || phone.includes(q);
  });

  // Filter Candidate Members in Modal
  const filteredCandidates = societyMembers.filter(m => {
    if (!candidateSearchTerm.trim()) return true;
    const q = candidateSearchTerm.toLowerCase();
    const name = (m.fullName || `${m.firstName || ''} ${m.lastName || ''}`).toLowerCase();
    const code = (m.memberId || '').toLowerCase();
    const phone = (m.phone || '').toLowerCase();
    return name.includes(q) || code.includes(q) || phone.includes(q);
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-3 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-sm font-bold text-slate-600">Loading President Governance Desk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 shrink-0">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Executive Group Governance Desk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                President Desk: {user?.name || 'Executive Officer'}
              </h1>
              <p className="text-xs text-slate-500">
                Designation: <span className="text-teal-700 font-bold font-mono">Group & Society President</span> • Oversee assigned group rosters, manage memberships, and sanction credit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/loans/applications"
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <Banknote className="w-4 h-4" />
              <span>Loan Sanctions ({pendingLoans.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Action Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {actionError}
          </span>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Group Multi-Perspective Switcher Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Assigned Group Perspectives ({groups.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Select a group to toggle between President Management and Member View
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {groups.map((grp) => {
            const isSelected = grp._id === selectedGroupId;
            const presId = grp.presidentId?._id || grp.presidentId;
            const leadId = grp.leaderId?._id || grp.leaderId;
            const myId = myMember?._id;
            const isPres = myId && (presId === myId || leadId === myId);

            return (
              <button
                key={grp._id}
                onClick={() => handleSelectPerspective(grp)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200/80 hover:border-teal-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{grp.groupName}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Code: {grp.groupCode || grp.groupId}</p>
                  </div>
                  {grp.role === 'President' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
                      <Crown className="w-3 h-3 text-amber-600" /> President
                    </span>
                  ) : grp.role === 'Secretary' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1 shrink-0">
                      <FileText className="w-3 h-3 text-blue-600" /> Secretary
                    </span>
                  ) : grp.role === 'Treasurer' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                      <Banknote className="w-3 h-3 text-emerald-600" /> Treasurer
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 shrink-0">
                      <Users className="w-3 h-3 text-teal-600" /> Member
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>{grp.memberCount || grp.memberIds?.length || 0} Members</span>
                  <span className="text-[11px] font-semibold text-teal-700">{grp.groupType || 'SHG'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace Based on Role Perspective */}
      {selectedGroup && (
        <div className="space-y-6">

          {/* Perspective Mode Indicator Callout */}
          {isPresidentMode ? (
            /* ========================================================================= */
            /* CASE A: PRESIDENT MANAGEMENT DESK (Full Management, Add Members, No Schedule Meeting) */
            /* ========================================================================= */
            <div className="space-y-6">
              
              {/* President Management Banner */}
              <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-soft-teal space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Presiding Officer Management Mode</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">{selectedGroup.groupName}</h2>
                    <p className="text-xs text-teal-200">
                      Branch: <span className="text-white font-bold">{selectedGroup.branchId?.branchName || 'Main Branch'}</span> • Group Code: <span className="font-mono text-white font-bold">{selectedGroup.groupCode || selectedGroup.groupId}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenAddMemberModal}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Add New Member to Group</span>
                    </button>
                  </div>
                </div>

                {/* Important Notice regarding Secretary Role */}
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3 text-xs text-teal-100">
                  <Info className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    <strong>Governance Note:</strong> Meeting scheduling, agendas, and secretarial notices are designated exclusively to the <strong>Group Secretary</strong>. As President, you oversee full group member rosters and endorse loan applications.
                  </span>
                </div>
              </div>

              {/* Group Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Enrolled Members</span>
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">{selectedGroup.memberIds?.length || 0}</div>
                  <div className="text-[11px] text-teal-700 font-semibold">Active in Roster</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Group Secretary</span>
                    <FileText className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-base font-bold text-slate-900 truncate">
                    {selectedGroup.secretaryId?.fullName || selectedGroup.secretaryId?.name || 'Not Elected'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedGroup.secretaryId?.phone || 'Secretarial Custodian'}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Group Treasurer</span>
                    <Banknote className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-base font-bold text-slate-900 truncate">
                    {selectedGroup.treasurerId?.fullName || selectedGroup.treasurerId?.name || 'Not Elected'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedGroup.treasurerId?.phone || 'Financial Custodian'}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Scheduled Assemblies</span>
                    <Calendar className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">{meetings.length}</div>
                  <div className="text-[11px] text-slate-400">Scheduled by Secretary</div>
                </div>
              </div>

              {/* Group Members Roster Management */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-600" />
                      <span>Group Member Roster ({selectedGroup.memberIds?.length || 0})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Manage, inspect, and maintain membership records for this group.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search member by Name, ID, Phone..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none w-64"
                      />
                    </div>
                    <button
                      onClick={handleOpenAddMemberModal}
                      className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Member
                    </button>
                  </div>
                </div>

                {/* Member Roster Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Member ID</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Role in Group</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredGroupMembers.length > 0 ? (
                        filteredGroupMembers.map((m) => {
                          const isPres = selectedGroup.presidentId?._id === m._id || selectedGroup.leaderId?._id === m._id;
                          const isSec = selectedGroup.secretaryId?._id === m._id;
                          const isTres = selectedGroup.treasurerId?._id === m._id;

                          return (
                            <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                                    {(m.fullName || m.name || 'M').charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{m.fullName || m.name}</p>
                                    <p className="text-[10px] text-slate-400">{m.gender || 'Member'} • {m.category || 'General'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                                {m.memberId || '-'}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-800">{m.phone || '-'}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{m.email || '-'}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                {isPres && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-600" /> President
                                  </span>
                                )}
                                {isSec && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-blue-600" /> Secretary
                                  </span>
                                )}
                                {isTres && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                    <Banknote className="w-3 h-3 text-emerald-600" /> Treasurer
                                  </span>
                                )}
                                {!isPres && !isSec && !isTres && (
                                  <span className="text-slate-500 font-semibold text-[11px]">Member</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  m.membershipStatus === 'Active' || m.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {m.membershipStatus || m.status || 'Active'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    to={`/members/${m._id}`}
                                    className="p-1.5 hover:bg-teal-50 rounded-lg text-teal-700 transition-colors"
                                    title="View Member Folio"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  {!isPres && (
                                    <button
                                      onClick={() => handleRemoveMember(m._id, m.fullName || m.name)}
                                      className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                                      title="Remove from Group"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                            No group members found matching filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Group Scheduled Assemblies (Read-Only) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-black text-slate-900">Upcoming Group Assemblies</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">
                    Coordinated by Group Secretary
                  </span>
                </div>

                {meetings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meetings.slice(0, 3).map((m) => (
                      <div key={m._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 line-clamp-1">{m.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                            {m.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{m.description || 'General Group Assembly'}</p>
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                          <span>{new Date(m.scheduledDate).toLocaleDateString('en-IN')}</span>
                          <span className="font-semibold text-teal-700">{m.venue || 'Society Hall'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No scheduled assemblies found for this period.</p>
                )}
              </div>

              {/* Real-Time Pending Loan Applications for President Review */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-amber-600" />
                      <span>Pending Group Loan Applications</span>
                    </h2>
                    <p className="text-xs text-slate-500">Applications requiring Group President evaluation & recommendation</p>
                  </div>
                  <Link
                    to="/loans/applications"
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span>View All Applications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {pendingLoans.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-medium">
                    <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    No pending loan applications requiring review at this time.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                        <tr>
                          <th className="px-4 py-3">Application ID</th>
                          <th className="px-4 py-3">Applicant Name</th>
                          <th className="px-4 py-3">Loan Type</th>
                          <th className="px-4 py-3">Requested Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingLoans.map((loan) => (
                          <tr key={loan._id} className="hover:bg-teal-50/30 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{loan.applicationId}</td>
                            <td className="px-4 py-3 text-slate-700">{loan.memberId?.fullName || loan.memberId?.name || 'Group Member'}</td>
                            <td className="px-4 py-3 text-slate-600">{loan.loanTypeId?.name || 'Standard Loan'}</td>
                            <td className="px-4 py-3 font-bold text-teal-800">{formatCurrency(loan.requestedAmount)}</td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800">
                                {loan.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleForwardLoan(loan._id)}
                                  disabled={forwardingLoanId === loan._id}
                                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold inline-flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                                  title="Forward with recommendation to Branch Manager"
                                >
                                  {forwardingLoanId === loan._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <FileCheck className="w-3.5 h-3.5 text-teal-200" />
                                  )}
                                  <span>Forward to BM</span>
                                </button>
                                
                                <Link
                                  to={`/loans/details/${loan._id}`}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="View Loan Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* ========================================================================= */
            /* CASE B: MEMBER VIEW (Read-Only for Groups where user is NOT President) */
            /* ========================================================================= */
            <div className="space-y-6">
              
              {/* Member View Callout Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-soft-teal space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      <span>Member Participation View</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">{selectedGroup.groupName}</h2>
                    <p className="text-xs text-teal-200">
                      You are enrolled in this group as an active regular member.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs border border-white/15">
                      Regular Member Access
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3 text-xs text-teal-100">
                  <Shield className="w-4 h-4 text-teal-300 shrink-0" />
                  <span>
                    Group administrative operations and member additions for this group are governed by the elected Group President (<strong>{selectedGroup.presidentId?.fullName || 'Presiding Officer'}</strong>).
                  </span>
                </div>
              </div>

              {/* Personal Folio in this Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>My Savings Balance</span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-700">
                    {formatCurrency(mySavings.reduce((sum, s) => sum + (s.currentBalance || s.balance || 0), 0))}
                  </div>
                  <div className="text-[11px] text-slate-400">Personal Thrift Savings</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>My Active Loans</span>
                    <Banknote className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">{myLoans.length}</div>
                  <div className="text-[11px] text-slate-400">Total Group Loans Availed</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Presiding President</span>
                    <Crown className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-base font-bold text-slate-900 truncate">
                    {selectedGroup.presidentId?.fullName || selectedGroup.presidentId?.name || 'Assigned Leader'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedGroup.presidentId?.phone || 'Contact Leader'}
                  </div>
                </div>
              </div>

              {/* Fellow Members (Read-Only Directory) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-600" />
                      <span>Fellow Group Members ({selectedGroup.memberIds?.length || 0})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Read-only membership directory for this self-help collective.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(selectedGroup.memberIds || []).map((m) => (
                    <div key={m._id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {(m.fullName || m.name || 'M').charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-xs truncate">{m.fullName || m.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {m.memberId || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 4. Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                  <span>Add Members to {selectedGroup?.groupName}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select registered society members from your cooperative branch to enroll into this group.
                </p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by Name, Member ID, or Phone..."
                value={candidateSearchTerm}
                onChange={(e) => setCandidateSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Candidate List Checkboxes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-72">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((cand) => {
                  const isChecked = selectedCandidateIds.includes(cand._id);
                  return (
                    <label
                      key={cand._id}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-50/80 border-teal-300 shadow-xs'
                          : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCandidateIds(prev => [...prev, cand._id]);
                            } else {
                              setSelectedCandidateIds(prev => prev.filter(id => id !== cand._id));
                            }
                          }}
                          className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {cand.memberId} • Phone: {cand.phone || '-'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        {cand.category || 'Member'}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 font-bold text-xs">
                  No eligible society members found to add.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600">
                {selectedCandidateIds.length} candidate(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMembersSubmit}
                  disabled={addingMembers || selectedCandidateIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
                >
                  {addingMembers ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Enroll Selected</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExecutiveDashboard;
