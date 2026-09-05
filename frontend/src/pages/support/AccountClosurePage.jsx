import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchAccountClosures, 
  fetchAccountClosureStats,
  fetchAccountClosureById,
  fetchMemberClosureFinancials,
  submitAccountClosureApi, 
  processAccountClosureApi,
  fetchOrganizations,
  fetchBranches,
  fetchMembers
} from '../../services/api';
import HierarchicalFilterBar from '../../components/common/HierarchicalFilterBar';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  ShieldCheck, 
  X, 
  Landmark, 
  Wallet, 
  CreditCard,
  User,
  Building2,
  Printer,
  ChevronRight,
  Eye,
  Send,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';

const AccountClosurePage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.role?.name === 'Super Admin';
  const isOrgAdmin = ['Organization Admin', 'President', 'Secretary', 'Treasurer'].includes(user?.role);
  const isBranchManager = user?.role === 'Branch Manager';
  const isStaff = isSuperAdmin || isOrgAdmin || isBranchManager || user?.role === 'Employee';

  // State Management
  const [closures, setClosures] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    underReviewRequests: 0,
    settledRequests: 0,
    rejectedRequests: 0,
    totalDisbursedSettlement: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Hierarchical Filter Scope
  const [selectedOrgId, setSelectedOrgId] = useState('All');
  const [selectedBranchId, setSelectedBranchId] = useState('All');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Submit Closure Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitOrgs, setSubmitOrgs] = useState([]);
  const [submitBranches, setSubmitBranches] = useState([]);
  const [submitMembers, setSubmitMembers] = useState([]);
  const [memberSearchText, setMemberSearchText] = useState('');
  const [selectedMemberInfo, setSelectedMemberInfo] = useState(null);
  const [fetchingFinancials, setFetchingFinancials] = useState(false);

  const [newForm, setNewForm] = useState({
    organizationId: user?.organizationId?._id || user?.organizationId || '',
    branchId: user?.branchId?._id || user?.branchId || '',
    memberId: '',
    closureType: 'Full Membership Closure',
    reason: '',
    paymentMode: 'Bank Transfer',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  // Process / Details Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [processStatus, setProcessStatus] = useState('Approved & Settled');
  const [processRemarks, setProcessRemarks] = useState('');
  const [processPaymentMode, setProcessPaymentMode] = useState('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [processSubmitting, setProcessSubmitting] = useState(false);

  // Load Closures and Stats
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
        search: searchTerm.trim() || undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        closureType: selectedType !== 'All' ? selectedType : undefined
      };

      if (selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (selectedBranchId !== 'All') params.branchId = selectedBranchId;

      const [closuresRes, statsRes] = await Promise.all([
        fetchAccountClosures(params),
        fetchAccountClosureStats({
          organizationId: selectedOrgId !== 'All' ? selectedOrgId : undefined,
          branchId: selectedBranchId !== 'All' ? selectedBranchId : undefined
        })
      ]);

      if (closuresRes.data && closuresRes.data.success) {
        setClosures(closuresRes.data.data || []);
        setTotalPages(closuresRes.data.totalPages || 1);
        setTotalCount(closuresRes.data.total || 0);
      }

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load account closures registry.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedStatus, selectedType, selectedOrgId, selectedBranchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Orgs for Super Admin on modal open
  useEffect(() => {
    if (isSuperAdmin && showSubmitModal) {
      fetchOrganizations().then(res => {
        if (res.data?.success) {
          const list = res.data.data || [];
          setSubmitOrgs(list);
          if (list.length > 0 && !newForm.organizationId) {
            setNewForm(prev => ({ ...prev, organizationId: list[0]._id }));
          }
        }
      }).catch(console.error);
    }
  }, [isSuperAdmin, showSubmitModal]);

  // Load Branches when Org changes in modal
  useEffect(() => {
    if (newForm.organizationId && showSubmitModal) {
      fetchBranches({ organizationId: newForm.organizationId }).then(res => {
        if (res.data?.success) {
          setSubmitBranches(res.data.data || []);
        }
      }).catch(console.error);
    }
  }, [newForm.organizationId, showSubmitModal]);

  // Automatically load own financials if logged-in user is a Member
  useEffect(() => {
    if (!isStaff && showSubmitModal && user) {
      setFetchingFinancials(true);
      fetchMemberClosureFinancials(user._id)
        .then(res => {
          if (res.data?.success) {
            setSelectedMemberInfo(res.data.data);
            if (res.data.data?.member?._id) {
              setNewForm(prev => ({ ...prev, memberId: res.data.data.member._id }));
            }
          }
        })
        .catch(console.error)
        .finally(() => setFetchingFinancials(false));
    }
  }, [isStaff, showSubmitModal, user]);

  // Debounced Member Search for Staff filing on behalf of Member
  useEffect(() => {
    if (!isStaff || !showSubmitModal || !memberSearchText.trim()) {
      setSubmitMembers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const params = {
          search: memberSearchText.trim(),
          limit: 8
        };
        if (newForm.organizationId) params.organizationId = newForm.organizationId;
        if (newForm.branchId) params.branchId = newForm.branchId;

        const res = await fetchMembers(params);
        if (res.data?.success) {
          setSubmitMembers(res.data.data || []);
        }
      } catch (err) {
        console.error('Member search error', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [memberSearchText, newForm.organizationId, newForm.branchId, isStaff, showSubmitModal]);

  // Fetch Member Live Financials when member selected
  const handleSelectMember = async (mem) => {
    setNewForm(prev => ({ ...prev, memberId: mem._id }));
    setMemberSearchText(`${mem.fullName || mem.name} (${mem.memberId})`);
    setSubmitMembers([]);
    setFetchingFinancials(true);
    try {
      const res = await fetchMemberClosureFinancials(mem._id);
      if (res.data?.success) {
        setSelectedMemberInfo(res.data.data);
      }
    } catch (err) {
      console.error('Financials fetch error', err);
    } finally {
      setFetchingFinancials(false);
    }
  };

  // Open Request Detail & Settlement Modal
  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    setProcessRemarks('');
    setReferenceNumber('');
    try {
      const res = await fetchAccountClosureById(id);
      if (res.data && res.data.success) {
        setSelectedRequest(res.data.data);
        setProcessStatus(res.data.data.status === 'Pending' ? 'Approved & Settled' : res.data.data.status);
        setProcessPaymentMode(res.data.data.settlementDetails?.paymentMode || 'Bank Transfer');
      }
    } catch (err) {
      setError(err.message || 'Failed to load closure dossier');
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit Closure Request
  const handleSubmitClosure = async (e) => {
    e.preventDefault();
    if (!newForm.reason.trim()) {
      setError('Please provide a reason for closure.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        organizationId: newForm.organizationId,
        branchId: newForm.branchId || undefined,
        memberId: newForm.memberId || undefined,
        closureType: newForm.closureType,
        reason: newForm.reason,
        settlementDetails: {
          paymentMode: newForm.paymentMode,
          bankName: newForm.bankName,
          accountNumber: newForm.accountNumber,
          ifscCode: newForm.ifscCode,
          upiId: newForm.upiId,
        }
      };

      const res = await submitAccountClosureApi(payload);
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || 'Account closure request submitted!');
        setShowSubmitModal(false);
        setNewForm({
          organizationId: user?.organizationId?._id || user?.organizationId || '',
          branchId: user?.branchId?._id || user?.branchId || '',
          memberId: '',
          closureType: 'Full Membership Closure',
          reason: '',
          paymentMode: 'Bank Transfer',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          upiId: ''
        });
        setSelectedMemberInfo(null);
        setMemberSearchText('');
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit closure request');
    } finally {
      setSubmitting(false);
    }
  };

  // Process / Settle Closure Request
  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setProcessSubmitting(true);
    setError('');
    try {
      const res = await processAccountClosureApi(selectedRequest._id, {
        status: processStatus,
        remarks: processRemarks.trim(),
        paymentMode: processPaymentMode,
        referenceNumber: referenceNumber.trim()
      });

      if (res.data && res.data.success) {
        setSuccessMsg(`Closure request ${selectedRequest.requestId} updated to ${processStatus}!`);
        handleOpenDetail(selectedRequest._id);
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to process closure settlement');
    } finally {
      setProcessSubmitting(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Approved & Settled':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Landmark className="w-3.5 h-3.5" />
              Settlement & Resignation Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Account Closure & Settlement Operations
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Process member resignations, savings refunds, share capital returns, and compute net dues against outstanding loans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              File Closure Request
            </button>
          </div>
        </div>

        {/* Hierarchical Filter Bar */}
        {isStaff && (
          <HierarchicalFilterBar
            onFilterChange={({ organizationId, branchId }) => {
              setSelectedOrgId(organizationId);
              setSelectedBranchId(branchId);
              setPage(1);
            }}
            showGroupFilter={false}
            showMemberFilter={false}
          />
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-teal-600" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-3xl border border-teal-100/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</span>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalRequests}</p>
        </div>

        {/* Pending Audit */}
        <div className="bg-white p-5 rounded-3xl border border-teal-100/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Pending Audit</span>
          <p className="text-2xl font-extrabold text-teal-900">{stats.pendingRequests}</p>
        </div>

        {/* Under Review */}
        <div className="bg-white p-5 rounded-3xl border border-teal-100/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">In Review</span>
          <p className="text-2xl font-extrabold text-amber-900">{stats.underReviewRequests}</p>
        </div>

        {/* Approved & Settled */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/40">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Settled & Closed</span>
          <p className="text-2xl font-extrabold text-emerald-950">{stats.settledRequests}</p>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-5 rounded-3xl border border-teal-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Disbursed</span>
          <p className="text-xl font-extrabold text-teal-900">{formatCurrency(stats.totalDisbursedSettlement)}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by Request ID, Member Name, or Reason..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Settlement Statuses</option>
              <option value="Pending">Pending Audit</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved & Settled">Approved & Settled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Closure Types</option>
              <option value="Full Membership Closure">Full Membership Resignation</option>
              <option value="Savings Account Closure">Savings Account Closure Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Closure Requests Ledger Table */}
      <div className="bg-white rounded-3xl border border-teal-100/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Account Closure & Settlement Ledger ({totalCount})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading closure records...</p>
          </div>
        ) : closures.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Account Closures Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No account closure or settlement records match your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Member Details</th>
                  <th className="py-3.5 px-4">Closure Type & Reason</th>
                  <th className="py-3.5 px-4">Savings Refund</th>
                  <th className="py-3.5 px-4">Outstanding Loans</th>
                  <th className="py-3.5 px-4">Net Settlement</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {closures.map((c) => {
                  const memName = c.memberId?.fullName || c.userId?.name || 'Member';
                  const memId = c.memberId?.memberId || 'N/A';
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                        {c.requestId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{memName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {memId} • {c.branchId?.branchName || 'Head Office'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 mb-1 inline-block">
                          {c.closureType}
                        </span>
                        <div className="text-[10px] text-slate-600 line-clamp-1 font-medium">{c.reason}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-800 font-mono">
                        {formatCurrency(c.refundableSavingsBalance)}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono">
                        {c.outstandingLoanBalance > 0 ? (
                          <span className="text-rose-700">-{formatCurrency(c.outstandingLoanBalance)}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-teal-900 font-mono text-sm">
                        {formatCurrency(c.netSettlementAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(c._id)}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold transition-all border border-teal-200/80 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
      {/* MODAL 1: SUBMIT ACCOUNT CLOSURE REQUEST */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-teal-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-teal-600" />
                  Initiate Account Closure & Settlement
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Calculate real-time dues, savings refund, share capital, and submit settlement docket.
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClosure} className="space-y-4">
              
              {/* Organization & Branch selection for Super Admin */}
              {isSuperAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Society / Organization <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newForm.organizationId}
                      onChange={(e) => setNewForm(prev => ({ ...prev, organizationId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                    >
                      <option value="">-- Select Society --</option>
                      {submitOrgs.map(org => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Branch
                    </label>
                    <select
                      value={newForm.branchId}
                      onChange={(e) => setNewForm(prev => ({ ...prev, branchId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                    >
                      <option value="">Head Office / All</option>
                      {submitBranches.map(b => (
                        <option key={b._id} value={b._id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Staff Member Search Box */}
              {isStaff && (
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Member to Close Account <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search member by Name or Member ID..."
                    value={memberSearchText}
                    onChange={(e) => setMemberSearchText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
                  />

                  {submitMembers.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2 space-y-1">
                      {submitMembers.map(m => (
                        <div
                          key={m._id}
                          onClick={() => handleSelectMember(m)}
                          className="p-2.5 hover:bg-teal-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{m.fullName || `${m.firstName || ''} ${m.lastName || ''}`}</p>
                            <p className="text-[10px] text-slate-500 font-mono">ID: {m.memberId} • Phone: {m.phone || '-'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md font-bold uppercase bg-teal-50 text-teal-800 text-[10px]">
                            Select
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Live Member Financial Breakdown Preview */}
              {selectedMemberInfo && (
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
                  <h4 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Real-time Settlement Computation
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Savings Balances</span>
                      <p className="font-bold text-emerald-800 font-mono">{formatCurrency(selectedMemberInfo.totalSavings)}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Share Capital</span>
                      <p className="font-bold text-teal-800 font-mono">{formatCurrency(selectedMemberInfo.shareCapital)}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Outstanding Loans</span>
                      <p className="font-bold text-rose-700 font-mono">{formatCurrency(selectedMemberInfo.totalLoans)}</p>
                    </div>
                    <div className="bg-teal-900 text-white p-2.5 rounded-xl">
                      <span className="text-[10px] text-teal-200 uppercase font-bold">Net Payout</span>
                      <p className="font-extrabold font-mono">{formatCurrency(selectedMemberInfo.netSettlement)}</p>
                    </div>
                  </div>
                  {selectedMemberInfo.hasOutstandingDebt && (
                    <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Notice: Outstanding loans of {formatCurrency(selectedMemberInfo.totalLoans)} will be deducted from refundable balances.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Closure Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newForm.closureType}
                    onChange={(e) => setNewForm(prev => ({ ...prev, closureType: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Full Membership Closure">Full Membership Resignation (Share + Savings)</option>
                    <option value="Savings Account Closure">Savings Account Closure Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Settlement Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newForm.paymentMode}
                    onChange={(e) => setNewForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="Bank Transfer">NEFT / RTGS Bank Transfer</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Cheque">Account Payee Cheque</option>
                    <option value="Cash">Cash at Counter</option>
                  </select>
                </div>
              </div>

              {/* Bank Transfer Details */}
              {newForm.paymentMode === 'Bank Transfer' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <input
                    type="text"
                    placeholder="Bank Name (e.g. SBI)"
                    value={newForm.bankName}
                    onChange={(e) => setNewForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={newForm.accountNumber}
                    onChange={(e) => setNewForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={newForm.ifscCode}
                    onChange={(e) => setNewForm(prev => ({ ...prev, ifscCode: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                  />
                </div>
              )}

              {newForm.paymentMode === 'UPI' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <input
                    type="text"
                    placeholder="Beneficiary UPI ID (e.g. member@okaxis)"
                    value={newForm.upiId}
                    onChange={(e) => setNewForm(prev => ({ ...prev, upiId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reason for Closure / Resignation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="State the justification (e.g. Relocating to new district, financial consolidation, retirement)..."
                  value={newForm.reason}
                  onChange={(e) => setNewForm(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Submit Settlement Docket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CLOSURE DOSSIER, SETTLEMENT DECREE & AUDIT VOUCHER */}
      {/* ========================================================================= */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-teal-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedRequest.requestId}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-900 text-white">
                    {selectedRequest.closureType}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 pt-1">
                  Settlement Docket: {selectedRequest.memberId?.fullName || selectedRequest.userId?.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedRequest.organizationId?.name} • {selectedRequest.branchId?.branchName || 'Head Office'} • Initiated on {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1 text-xs font-bold"
                >
                  <Printer className="w-4 h-4" /> Print Voucher
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Financial Settlement Breakdown Card */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Statutory Financial Settlement Statement
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Refundable Savings</span>
                  <p className="text-base font-bold text-emerald-800 font-mono mt-1">
                    {formatCurrency(selectedRequest.refundableSavingsBalance)}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Share Capital Refund</span>
                  <p className="text-base font-bold text-teal-800 font-mono mt-1">
                    {formatCurrency(selectedRequest.shareCapitalRefund)}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Outstanding Loans</span>
                  <p className="text-base font-bold text-rose-700 font-mono mt-1">
                    -{formatCurrency(selectedRequest.outstandingLoanBalance)}
                  </p>
                </div>

                <div className="bg-teal-900 text-white p-3.5 rounded-2xl">
                  <span className="text-[10px] text-teal-200 font-bold uppercase">Net Payout Due</span>
                  <p className="text-lg font-extrabold font-mono mt-1">
                    {formatCurrency(selectedRequest.netSettlementAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason & Beneficiary Transfer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Reason for Resignation</span>
                <p className="text-slate-800 font-medium leading-relaxed">{selectedRequest.reason}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Beneficiary Transfer Details</span>
                <p className="font-bold text-slate-900">Mode: {selectedRequest.settlementDetails?.paymentMode || 'Bank Transfer'}</p>
                {selectedRequest.settlementDetails?.bankName && (
                  <p className="text-slate-600 font-mono">Bank: {selectedRequest.settlementDetails.bankName}</p>
                )}
                {selectedRequest.settlementDetails?.accountNumber && (
                  <p className="text-slate-600 font-mono">A/C: {selectedRequest.settlementDetails.accountNumber} ({selectedRequest.settlementDetails.ifscCode})</p>
                )}
                {selectedRequest.settlementDetails?.upiId && (
                  <p className="text-slate-600 font-mono">UPI: {selectedRequest.settlementDetails.upiId}</p>
                )}
                {selectedRequest.settlementDetails?.referenceNumber && (
                  <p className="text-teal-800 font-bold font-mono">UTR/Ref: {selectedRequest.settlementDetails.referenceNumber}</p>
                )}
              </div>
            </div>

            {/* Process / Settlement Action Box for Staff/Admins */}
            {isStaff && selectedRequest.status !== 'Approved & Settled' && (
              <form onSubmit={handleProcessSubmit} className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-4">
                <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  Auditor & Manager Settlement Action Desk
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-teal-900 uppercase">Update Status</label>
                    <select
                      value={processStatus}
                      onChange={(e) => setProcessStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    >
                      <option value="Approved & Settled">Approved & Disburse Settlement</option>
                      <option value="Under Review">Mark Under Audit Review</option>
                      <option value="Rejected">Reject Request</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-teal-900 uppercase">Disbursement Mode</label>
                    <select
                      value={processPaymentMode}
                      onChange={(e) => setProcessPaymentMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    >
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                      <option value="UPI">UPI Instant</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash at Counter</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-teal-900 uppercase">Bank UTR / Ref No.</label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-982341762"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-teal-900 uppercase">Settlement Decree & Audit Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Verified zero loan liability. Share capital refunded and savings balance credited."
                    value={processRemarks}
                    onChange={(e) => setProcessRemarks(e.target.value)}
                    required={processStatus === 'Approved & Settled'}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={processSubmitting}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processSubmitting ? 'Executing Settlement...' : 'Execute & Settle Account'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AccountClosurePage;
