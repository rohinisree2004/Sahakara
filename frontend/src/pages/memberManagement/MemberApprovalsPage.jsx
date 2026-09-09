import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Building2,
  Sparkles,
  RefreshCw,
  X,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { fetchMembersList, approveMemberApi, rejectMemberApi, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberApprovalsPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal State
  const [rejectModalMember, setRejectModalMember] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const loadPending = async () => {
    setLoading(true);
    try {
      const params = { status: 'Pending' };
      if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
        params.organizationId = selectedOrgId;
      }
      const res = await fetchMembersList(params);
      if (res.data && res.data.success) {
        setPendingMembers(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading pending approvals:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [selectedOrgId]);

  const handleApprove = async (m) => {
    setActionLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await approveMemberApi(m._id, { remarks: 'Approved by Executive Board' });
      if (res.data && res.data.success) {
        setMsg(`Membership application for '${m.fullName}' approved!`);
        loadPending();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemarks) {
      setErrorMsg('Please enter rejection remarks.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');

    try {
      const res = await rejectMemberApi(rejectModalMember._id, { remarks: rejectRemarks });
      if (res.data && res.data.success) {
        setMsg(`Membership application for '${rejectModalMember.fullName}' rejected.`);
        setRejectModalMember(null);
        setRejectRemarks('');
        loadPending();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Executive Board Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Membership Approvals Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review and sign off on new cooperative membership applications submitted by local branches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 border border-teal-200 rounded-xl px-3.5 py-2 shadow-xs">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">Society:</span>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="bg-transparent text-teal-900 text-xs font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="All">All Societies</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={loadPending}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="font-semibold">{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Applications Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : pendingMembers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
          <h3 className="text-base font-black text-slate-900">Approvals Queue is Clear</h3>
          <p className="text-xs text-slate-500">There are no pending membership applications awaiting review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingMembers.map((m) => (
            <div key={m._id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between hover:border-teal-300 hover:shadow-soft-teal transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black font-mono">
                      {m.fullName ? m.fullName[0] : 'M'}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{m.fullName}</h3>
                      <span className="text-[11px] font-mono text-teal-800 font-bold">{m.memberId}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800">
                    Pending Sign-off
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Category:</span>
                    <strong className="text-slate-900">{m.category || 'Regular Member'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Phone Number:</span>
                    <strong className="text-slate-900">{m.phone || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Branch Location:</span>
                    <strong className="text-teal-900 font-semibold">{m.branchId?.branchName || m.branchName || 'Head Office'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Designated Nominee:</span>
                    <strong className="text-slate-900">{m.nominee?.name || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRejectModalMember(m)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleApprove(m)}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Application</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Reject Application</h3>
              <button onClick={() => setRejectModalMember(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              State mandatory rejection reason for applicant <strong className="text-slate-900">{rejectModalMember.fullName}</strong>.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Remarks *</label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  required
                  placeholder="State reason (e.g. Incomplete KYC documentation)"
                  className="w-full h-24 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 resize-none font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRejectModalMember(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20">
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberApprovalsPage;
