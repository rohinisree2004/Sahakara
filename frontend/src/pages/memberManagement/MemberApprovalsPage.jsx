import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { fetchMembersList, approveMemberApi, rejectMemberApi } from '../../services/api';

const MemberApprovalsPage = () => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal State
  const [rejectModalMember, setRejectModalMember] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await fetchMembersList({ status: 'Pending' });
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
  }, []);

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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Pending Membership Approvals Queue</span>
          </h1>
          <p className="text-xs text-slate-400">
            Board approval desk for newly enrolled members awaiting official membership sign-off
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Applications Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : pendingMembers.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Queue Empty</h3>
          <p className="text-xs text-slate-400">There are no pending membership applications awaiting approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingMembers.map((m) => (
            <div key={m._id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{m.fullName}</h3>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{m.memberId}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    Pending Sign-off
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div>Category: <strong className="text-white">{m.category}</strong></div>
                  <div>Phone: <strong className="text-white">{m.phone}</strong></div>
                  <div>Branch: <strong className="text-emerald-400">{m.branchId?.branchName || 'JP Nagar'}</strong></div>
                  <div>Nominee: <strong className="text-white">{m.nominee?.name || 'Sunita Bhatt'}</strong></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRejectModalMember(m)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleApprove(m)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Membership</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REJECT WITH REMARKS MODAL */}
      {rejectModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full rounded-3xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Reject Membership Application</h3>
              <button onClick={() => setRejectModalMember(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              State mandatory rejection reason for applicant <strong>{rejectModalMember.fullName}</strong>.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rejection Remarks *</label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  required
                  placeholder="State reason (e.g. Incomplete KYC documentation)"
                  className="w-full h-24 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRejectModalMember(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs">
                  {actionLoading ? 'Rejecting...' : 'Reject Application'}
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
