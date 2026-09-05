import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchComplaints, 
  fetchComplaintStats,
  createComplaintApi, 
  fetchComplaintById,
  transferComplaintApi,
  escalateComplaintApi,
  addComplaintNoteApi,
  resolveComplaintApi,
  fetchOrganizations,
  fetchBranches
} from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';
import { 
  HelpCircle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  ArrowUpRight,
  ArrowRight,
  Building2,
  GitBranch,
  UserCheck,
  FileText,
  MessageSquare,
  Sparkles,
  Printer,
  ChevronRight,
  Eye,
  AlertTriangle,
  X,
  CheckCircle,
  Send,
  Lock,
  Crown,
  Users,
  Share2,
  RefreshCw
} from 'lucide-react';

const ComplaintsPage = () => {
  const { user, activeGroup } = useAuth();
  
  const effectiveRole = activeGroup?.role || user?.role || 'Member';
  const isSuperAdmin = user?.role === 'Super Admin' || user?.role?.name === 'Super Admin';
  const isOrgAdmin = ['Organization Admin', 'Org Admin'].includes(user?.role);
  const isBranchManager = user?.role === 'Branch Manager';
  const isGroupPresident = effectiveRole === 'President';
  const isStaff = isSuperAdmin || isOrgAdmin || isBranchManager || user?.role === 'Employee';
  const isRegularMember = !isStaff && !isGroupPresident;

  // Data & KPI States
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    escalatedTickets: 0,
    resolvedTickets: 0,
    criticalTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Hierarchical Filter Scope
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Raise Complaint Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createOrgs, setCreateOrgs] = useState([]);
  const [createBranches, setCreateBranches] = useState([]);
  const [createForm, setCreateForm] = useState({
    organizationId: user?.organizationId?._id || user?.organizationId || '',
    branchId: user?.branchId?._id || user?.branchId || '',
    groupId: activeGroup?._id || '',
    targetAuthority: isGroupPresident ? 'Branch Manager' : 'Group President',
    subject: '',
    category: 'Savings & Passbook',
    priority: 'Medium',
    description: ''
  });

  // Ticket Detail & Action Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Transfer / Escalation State
  const [showTransferBox, setShowTransferBox] = useState(false);
  const [transferTarget, setTransferTarget] = useState('Branch Manager');
  const [transferRemarks, setTransferRemarks] = useState('');
  const [transferring, setTransferring] = useState(false);

  const [escalationReason, setEscalationReason] = useState('');
  const [showEscalateBox, setShowEscalateBox] = useState(false);
  const [escalating, setEscalating] = useState(false);

  // Resolution Inputs
  const [resolveStatus, setResolveStatus] = useState('Resolved');
  const [resolveRemarks, setResolveRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Load Complaints and KPIs
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
        search: searchTerm.trim() || undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        priority: selectedPriority !== 'All' ? selectedPriority : undefined
      };

      if (activeGroup?._id) params.groupId = activeGroup._id;
      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;

      const [complaintsRes, statsRes] = await Promise.all([
        fetchComplaints(params),
        fetchComplaintStats({
          groupId: activeGroup?._id || undefined,
          organizationId: selectedOrgId !== 'All' ? selectedOrgId : undefined,
          branchId: selectedBranchId !== 'All' ? selectedBranchId : undefined
        })
      ]);

      if (complaintsRes.data && complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data || []);
        setTotalPages(complaintsRes.data.totalPages || 1);
        setTotalCount(complaintsRes.data.total || 0);
      }

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaints registry.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedStatus, selectedCategory, selectedPriority, selectedOrgId, selectedBranchId, activeGroup]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Organizations for Create Modal if Super Admin
  useEffect(() => {
    if (isSuperAdmin && showCreateModal) {
      fetchOrganizations().then(res => {
        if (res.data?.success) {
          const list = res.data.data || [];
          setCreateOrgs(list);
          if (list.length > 0 && !createForm.organizationId) {
            setCreateForm(prev => ({ ...prev, organizationId: list[0]._id }));
          }
        }
      }).catch(console.error);
    }
  }, [isSuperAdmin, showCreateModal]);

  // Load Branches when createForm organizationId changes
  useEffect(() => {
    if (createForm.organizationId && showCreateModal) {
      fetchBranches({ organizationId: createForm.organizationId }).then(res => {
        if (res.data?.success) {
          setCreateBranches(res.data.data || []);
        }
      }).catch(console.error);
    }
  }, [createForm.organizationId, showCreateModal]);

  // Open Ticket Detail Modal
  const handleOpenTicket = async (ticketId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    setShowTransferBox(false);
    setShowEscalateBox(false);
    setTransferRemarks('');
    setResolveRemarks('');
    setEscalationReason('');
    try {
      const res = await fetchComplaintById(ticketId);
      if (res.data && res.data.success) {
        const t = res.data.data;
        setSelectedTicket(t);
        setResolveStatus(t.status === 'Submitted' ? 'In Progress' : 'Resolved');
        // Preset default transfer target
        if (isGroupPresident) {
          setTransferTarget('Branch Manager');
        } else if (isBranchManager) {
          setTransferTarget('Organization Admin');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit New Complaint
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.subject.trim() || !createForm.description.trim()) {
      setError('Please provide subject and description.');
      return;
    }

    setCreateSubmitting(true);
    setError('');
    try {
      const payload = {
        ...createForm,
        groupId: activeGroup?._id || createForm.groupId || undefined,
      };

      const res = await createComplaintApi(payload);
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || 'Complaint filed successfully!');
        setShowCreateModal(false);
        setCreateForm({
          organizationId: user?.organizationId?._id || user?.organizationId || '',
          branchId: user?.branchId?._id || user?.branchId || '',
          groupId: activeGroup?._id || '',
          targetAuthority: isGroupPresident ? 'Branch Manager' : 'Group President',
          subject: '',
          category: 'Savings & Passbook',
          priority: 'Medium',
          description: ''
        });
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit complaint');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Transfer Complaint to Higher Authority (e.g. President -> Branch Manager / Org Admin)
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setTransferring(true);
    setError('');
    try {
      const res = await transferComplaintApi(selectedTicket._id, {
        transferredTo: transferTarget,
        transferRemarks: transferRemarks.trim()
      });
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || `Grievance ticket transferred to ${transferTarget} successfully!`);
        setShowTransferBox(false);
        handleOpenTicket(selectedTicket._id);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to transfer complaint');
    } finally {
      setTransferring(false);
    }
  };

  // Escalate Complaint to Super Admin
  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setEscalating(true);
    setError('');
    try {
      const res = await escalateComplaintApi(selectedTicket._id, {
        escalationReason: escalationReason.trim()
      });
      if (res.data && res.data.success) {
        setSuccessMsg(`Ticket ${selectedTicket.ticketId} escalated to Super Administrator!`);
        setShowEscalateBox(false);
        handleOpenTicket(selectedTicket._id);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to escalate ticket');
    } finally {
      setEscalating(false);
    }
  };

  // Resolve Ticket
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setResolving(true);
    setError('');
    try {
      const res = await resolveComplaintApi(selectedTicket._id, {
        status: resolveStatus,
        resolutionRemarks: resolveRemarks.trim()
      });
      if (res.data && res.data.success) {
        setSuccessMsg(`Ticket ${selectedTicket.ticketId} updated to ${resolveStatus}!`);
        handleOpenTicket(selectedTicket._id);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to resolve ticket');
    } finally {
      setResolving(false);
    }
  };

  // Add Internal Note
  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await addComplaintNoteApi(selectedTicket._id, { note: newNote.trim() });
      if (res.data && res.data.success) {
        setNewNote('');
        handleOpenTicket(selectedTicket._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusBadge = (st) => {
    if (st?.startsWith('Transferred to')) {
      return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    }
    switch (st) {
      case 'Escalated to Super Admin':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold animate-pulse';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'In Progress':
      case 'Under Review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-black animate-pulse';
      case 'High':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getAuthorityBadge = (auth) => {
    switch (auth) {
      case 'Group President':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-600" /> Group President
          </span>
        );
      case 'Branch Manager':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-blue-600" /> Branch Manager
          </span>
        );
      case 'Organization Admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 inline-flex items-center gap-1">
            <Building2 className="w-3 h-3 text-teal-600" /> Org Admin
          </span>
        );
      case 'Super Admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" /> Super Admin
          </span>
        );
      default:
        return <span className="text-[10px] text-slate-500 font-semibold">{auth || 'Assigned Officer'}</span>;
    }
  };

  const canResolve = isStaff || isGroupPresident;
  const canTransfer = isGroupPresident || isBranchManager || isOrgAdmin;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/50 border border-teal-500/30 text-teal-200 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cooperative Grievance Redressal & Help Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isRegularMember 
              ? 'My Grievance & Support Desk' 
              : isGroupPresident 
              ? 'Group President Ombudsman Desk' 
              : 'Society Grievance Redressal & Support Desk'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 font-medium">
            {isRegularMember 
              ? `Lodge, track, and monitor complaints addressed to your group president or society management.`
              : isGroupPresident
              ? `Review group member grievances, resolve local disputes, or transfer to branch management.`
              : `Review, investigate, escalate, and resolve member & staff grievance tickets.`}
          </p>

          {activeGroup && (
            <div className="pt-1 flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-teal-900/80 border border-teal-600/40 text-[11px] font-bold text-teal-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-300" />
                Active Group: {activeGroup.groupName}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 text-[11px] font-bold text-amber-200">
                Role: {effectiveRole}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => {
              setCreateForm(prev => ({
                ...prev,
                targetAuthority: isGroupPresident ? 'Branch Manager' : 'Group President',
                groupId: activeGroup?._id || ''
              }));
              setShowCreateModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-teal-950 text-xs font-black transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-700 stroke-[3]" />
            <span>Raise Complaint Ticket</span>
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</span>
          <div className="text-2xl font-black text-slate-900">{stats.totalTickets}</div>
          <div className="text-[10px] text-slate-500 font-medium">Logged in Registry</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Submitted / Open</span>
          <div className="text-2xl font-black text-teal-800">{stats.openTickets}</div>
          <div className="text-[10px] text-teal-600 font-medium">Awaiting Action</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Under Review</span>
          <div className="text-2xl font-black text-blue-800">{stats.inProgressTickets}</div>
          <div className="text-[10px] text-blue-600 font-medium">Transferred & Active</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Escalated</span>
          <div className="text-2xl font-black text-purple-800">{stats.escalatedTickets}</div>
          <div className="text-[10px] text-purple-600 font-medium">Super Admin Docket</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Resolved</span>
          <div className="text-2xl font-black text-emerald-700">{stats.resolvedTickets}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Resolution Decreed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Critical Priority</span>
          <div className="text-2xl font-black text-rose-800">{stats.criticalTickets}</div>
          <div className="text-[10px] text-rose-600 font-medium">Urgent Action</div>
        </div>
      </div>

      {/* Hierarchical Filter Bar for Super Admin */}
      {isSuperAdmin && (
        <HierarchicalFilterBar
          onFilterChange={({ organizationId, branchId }) => {
            setSelectedOrgId(organizationId || 'All');
            setSelectedBranchId(branchId || 'All');
            setPage(1);
          }}
        />
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-teal-100/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Ticket ID, Subject, Name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted (New)</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Transferred to Branch Manager">Transferred to Branch Manager</option>
              <option value="Transferred to Org Admin">Transferred to Org Admin</option>
              <option value="Escalated to Super Admin">Escalated to Super Admin</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Savings & Passbook">Savings & Passbook</option>
              <option value="Loan & EMI Discrepancy">Loan & EMI Discrepancy</option>
              <option value="KYC & Member Profile">KYC & Member Profile</option>
              <option value="Group & Thrift Assembly">Group & Thrift Assembly</option>
              <option value="Staff Misconduct / Branch Service">Staff Misconduct / Branch Service</option>
              <option value="Technical & Portal Issue">Technical & Portal Issue</option>
              <option value="Account Service">Account Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Data Table */}
      <div className="bg-white rounded-3xl border border-teal-100/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span>
              {isRegularMember 
                ? `My Filed Grievances (${totalCount})` 
                : isGroupPresident 
                ? `Group Grievances & Personal Docket (${totalCount})` 
                : `Grievance Dossier & Resolution Desk (${totalCount})`}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              title="Refresh Complaints"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {isSuperAdmin && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900">
                Super Admin Ombudsman Active
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading complaints registry...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Grievance Tickets Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isRegularMember 
                ? 'You have not submitted any complaints for this group yet.'
                : 'No complaint tickets match your query or filters in this group.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Complainant / Submitter</th>
                  <th className="py-3.5 px-4">Addressed Authority</th>
                  <th className="py-3.5 px-4">Category & Subject</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {c.ticketId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.raisedByName || c.userId?.name || 'Member'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.raisedByType || c.userId?.role || 'Member'} • {c.groupId?.groupName || 'SHG Group'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getAuthorityBadge(c.targetAuthority)}
                      {c.transferredTo && (
                        <div className="text-[9px] text-amber-700 font-bold font-mono mt-0.5 flex items-center gap-0.5">
                          <Share2 className="w-2.5 h-2.5" /> Transferred by {c.transferredBy?.name || 'Executive'}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 mb-1 inline-block">
                        {c.category}
                      </span>
                      <div className="font-bold text-slate-900 truncate">{c.subject}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{c.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                      {c.escalationLevel === 'Super Admin' && (
                        <div className="text-[9px] text-purple-800 font-extrabold font-mono mt-0.5 flex items-center gap-0.5">
                          <ArrowUpRight className="w-2.5 h-2.5" /> Super Admin Docket
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenTicket(c._id)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold transition-all border border-teal-200/80 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Desk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs font-bold text-slate-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RAISE COMPLAINT TICKET WITH RECIPIENT AUTHORITY SELECTION */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-teal-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-teal-600" />
                  Raise Support / Grievance Ticket
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Submit a formal grievance ticket to your chosen authority.
                </p>
                {activeGroup && (
                  <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                    <Users className="w-3 h-3 text-teal-600" />
                    <span>Affiliated Group: {activeGroup.groupName}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              
              {/* TARGET AUTHORITY SELECTOR CARDS */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Authority to Address <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Group President */}
                  {!isGroupPresident && (
                    <div
                      onClick={() => setCreateForm(prev => ({ ...prev, targetAuthority: 'Group President' }))}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        createForm.targetAuthority === 'Group President'
                          ? 'bg-amber-50/70 border-amber-500 text-amber-950 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className={`w-4 h-4 ${createForm.targetAuthority === 'Group President' ? 'text-amber-600' : 'text-slate-400'}`} />
                        <span className="font-bold text-xs">Group President</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Elected leader of your SHG group
                      </p>
                    </div>
                  )}

                  {/* Branch Manager */}
                  <div
                    onClick={() => setCreateForm(prev => ({ ...prev, targetAuthority: 'Branch Manager' }))}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      createForm.targetAuthority === 'Branch Manager'
                        ? 'bg-blue-50/70 border-blue-500 text-blue-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GitBranch className={`w-4 h-4 ${createForm.targetAuthority === 'Branch Manager' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs">Branch Manager</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Society local branch management
                    </p>
                  </div>

                  {/* Organization Admin */}
                  <div
                    onClick={() => setCreateForm(prev => ({ ...prev, targetAuthority: 'Organization Admin' }))}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      createForm.targetAuthority === 'Organization Admin'
                        ? 'bg-teal-50/70 border-teal-500 text-teal-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className={`w-4 h-4 ${createForm.targetAuthority === 'Organization Admin' ? 'text-teal-600' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs">Org Admin</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Central cooperative society desk
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization & Branch selection for Super Admin */}
              {isSuperAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Society / Organization <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={createForm.organizationId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, organizationId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                    >
                      <option value="">-- Select Society --</option>
                      {createOrgs.map(org => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Branch
                    </label>
                    <select
                      value={createForm.branchId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, branchId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                    >
                      <option value="">Head Office / All</option>
                      {createBranches.map(b => (
                        <option key={b._id} value={b._id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Grievance Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Savings & Passbook">Savings & Passbook Discrepancy</option>
                    <option value="Loan & EMI Discrepancy">Loan & EMI Calculation Issue</option>
                    <option value="KYC & Member Profile">KYC & Member Verification</option>
                    <option value="Group & Thrift Assembly">SHG Group & Thrift Assembly Conflict</option>
                    <option value="Staff Misconduct / Branch Service">Staff Misconduct / Branch Service</option>
                    <option value="Technical & Portal Issue">Technical & System Glitch</option>
                    <option value="Account Service">Account Service & Closure</option>
                    <option value="Other">Other Grievance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Priority Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical / Urgent Escalation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subject / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discrepancy in passbook savings balance after last meeting"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Grievance Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide transaction dates, amounts, meeting details, or circumstances of your dispute..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {createSubmitting ? 'Submitting...' : `Submit to ${createForm.targetAuthority}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TICKET DETAILS, TRANSFER DESK, AND RESOLUTION DECREE */}
      {/* ========================================================================= */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-teal-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedTicket.ticketId}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getPriorityBadge(selectedTicket.priority)}`}>
                    {selectedTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 pt-1">
                  {selectedTicket.subject}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedTicket.organizationId?.name} • {selectedTicket.branchId?.branchName || 'Head Office'} • Group: {selectedTicket.groupId?.groupName || 'SHG Group'} • Filed on {new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complainant and Assigned Authority Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Complainant / Submitter</span>
                <p className="font-bold text-slate-900">{selectedTicket.raisedByName || selectedTicket.userId?.name || 'Member'}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {selectedTicket.raisedByType} • {selectedTicket.userId?.email || selectedTicket.userId?.phone || 'No contact'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Currently Addressed To</span>
                <div className="mt-1">{getAuthorityBadge(selectedTicket.targetAuthority)}</div>
                {selectedTicket.transferredAt && (
                  <p className="text-[10px] text-amber-700 font-mono mt-0.5">
                    Transferred on: {new Date(selectedTicket.transferredAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statement of Grievance</span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Transfer & Escalation History Timeline */}
            {selectedTicket.transferHistory && selectedTicket.transferHistory.length > 0 && (
              <div className="space-y-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-amber-700" /> Transfer & Escalation Audit Trail
                </span>
                <div className="space-y-2 pt-1">
                  {selectedTicket.transferHistory.map((th, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <span>{th.fromAuthority}</span>
                          <ArrowRight className="w-3 h-3 text-amber-600" />
                          <span className="text-amber-800">{th.toAuthority}</span>
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(th.transferDate).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium text-xs">
                        "{th.remarks}"
                      </p>
                      {th.transferredBy && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          Transferred by: {th.transferredBy.name || 'Executive'} ({th.transferredBy.role || 'Officer'})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Details if resolved */}
            {selectedTicket.resolutionRemarks && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
                <span className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Official Resolution Decree
                </span>
                <p className="font-bold">{selectedTicket.resolutionRemarks}</p>
                {selectedTicket.resolvedBy && (
                  <p className="text-[10px] text-emerald-700 font-mono">
                    Resolved by: {selectedTicket.resolvedBy.name} ({selectedTicket.resolvedBy.role}) on {new Date(selectedTicket.resolvedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            )}

            {/* Internal Investigation Notes Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-teal-600" /> Case Communication & Investigation Notes ({selectedTicket.internalNotes?.length || 0})
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(!selectedTicket.internalNotes || selectedTicket.internalNotes.length === 0) ? (
                  <p className="text-xs text-slate-400 py-2">No investigation notes added yet.</p>
                ) : (
                  selectedTicket.internalNotes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-bold">
                        <span>{note.authorName || 'Officer'} ({note.authorRole || 'Staff'})</span>
                        <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{note.note}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              {(isStaff || isGroupPresident) && (
                <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Append case memo / inquiry notes..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {addingNote ? 'Posting...' : 'Add Memo'}
                  </button>
                </form>
              )}
            </div>

            {/* ACTION DESK: TRANSFER, RESOLVE, OR ESCALATE */}
            {canResolve && selectedTicket.status !== 'Closed' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" /> Authority Resolution & Transfer Desk
                  </h4>

                  <div className="flex items-center gap-2">
                    {/* Transfer Button for President or Branch Manager */}
                    {canTransfer && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowTransferBox(!showTransferBox);
                          setShowEscalateBox(false);
                        }}
                        className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-700" />
                        {showTransferBox ? 'Cancel Transfer' : 'Transfer to Higher Authority'}
                      </button>
                    )}

                    {/* Escalate button for Org Admin / Branch Manager */}
                    {(isOrgAdmin || isBranchManager || isSuperAdmin) && selectedTicket.status !== 'Escalated to Super Admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowEscalateBox(!showEscalateBox);
                          setShowTransferBox(false);
                        }}
                        className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {showEscalateBox ? 'Cancel' : 'Escalate to Super Admin'}
                      </button>
                    )}
                  </div>
                </div>

                {/* TRANSFER BOX FOR PRESIDENT & BRANCH MANAGER */}
                {showTransferBox && (
                  <form onSubmit={handleTransferSubmit} className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
                    <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-amber-700" />
                      Transfer Grievance to Higher Executive Level
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 uppercase">Transfer To Authority</label>
                        <select
                          value={transferTarget}
                          onChange={(e) => setTransferTarget(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold mt-1"
                        >
                          {isGroupPresident && <option value="Branch Manager">Branch Manager (Local Branch)</option>}
                          <option value="Organization Admin">Organization Admin (Society Head)</option>
                          {isSuperAdmin && <option value="Super Admin">Super Admin</option>}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 uppercase">Transfer Reason / Remarks</label>
                        <input
                          type="text"
                          placeholder="e.g. Requires passbook software reconciliation by branch officer"
                          value={transferRemarks}
                          onChange={(e) => setTransferRemarks(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-medium mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={transferring}
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        {transferring ? 'Transferring...' : `Confirm Transfer to ${transferTarget}`}
                      </button>
                    </div>
                  </form>
                )}

                {/* ESCALATION REASON BOX */}
                {showEscalateBox && (
                  <form onSubmit={handleEscalateSubmit} className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                    <h5 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-purple-700" />
                      Escalate Grievance to Super Administrator Docket
                    </h5>
                    <textarea
                      rows={2}
                      placeholder="Explain why this ticket cannot be resolved at the branch/society level..."
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl bg-white border border-purple-200 text-xs font-medium focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={escalating}
                        className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                      >
                        {escalating ? 'Escalating...' : 'Confirm Escalation to Super Admin'}
                      </button>
                    </div>
                  </form>
                )}

                {/* RESOLVE FORM */}
                <form onSubmit={handleResolveSubmit} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-900 uppercase">Update Ticket Status</label>
                      <select
                        value={resolveStatus}
                        onChange={(e) => setResolveStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      >
                        <option value="In Progress">Under Review / In Progress</option>
                        <option value="Resolved">Resolved (Resolution Decree Provided)</option>
                        <option value="Closed">Closed Officially</option>
                        <option value="Rejected">Rejected / Invalid Claim</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-900 uppercase">Resolution Decree & Action Taken</label>
                      <input
                        type="text"
                        placeholder="e.g. Account passbook reconciled; discrepancy settled with borrower."
                        value={resolveRemarks}
                        onChange={(e) => setResolveRemarks(e.target.value)}
                        required={resolveStatus === 'Resolved'}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={resolving}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {resolving ? 'Executing Resolution...' : 'Update & Resolve Grievance'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintsPage;
