import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare, 
  Loader2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { fetchPendingApprovals, approveSocietyRequest, rejectSocietyRequest } from '../../services/api';

const OrganizationApprovalsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingApprovals();
      if (res.data && res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading pending approvals:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (inquiry) => {
    setProcessingId(inquiry._id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await approveSocietyRequest(inquiry._id, {
        societyName: inquiry.societyName,
        email: inquiry.email,
        contactPerson: inquiry.contactPerson,
        state: inquiry.state,
        phone: inquiry.phone,
        societyType: inquiry.societyType,
      });

      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || `Organization '${inquiry.societyName}' approved!`);
        setShowDetailModal(false);
        loadRequests();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Approval failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedInquiry || !rejectionRemarks.trim()) {
      setErrorMsg('Please enter rejection remarks.');
      return;
    }

    setProcessingId(selectedInquiry._id);
    setErrorMsg('');

    try {
      const res = await rejectSocietyRequest(selectedInquiry._id, {
        remarks: rejectionRemarks.trim(),
      });

      if (res.data && res.data.success) {
        setSuccessMsg(`Registration for '${selectedInquiry.societyName}' rejected.`);
        setShowRejectModal(false);
        setRejectionRemarks('');
        loadRequests();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <span>Organization Approval Queue</span>
          </h1>
          <p className="text-xs text-slate-400">
            Review onboarding registration requests from cooperative societies and issue system credentials
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
        >
          Refresh Queue
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Requests Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Pending Approvals</h3>
          <p className="text-xs text-slate-400">
            All registered cooperative society requests have been reviewed.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Society Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">Est. Members</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{req.societyName}</div>
                          <div className="text-[11px] text-slate-500 font-mono font-normal">Reg: {req.registrationNumber || 'Pending'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">{req.societyType}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{req.contactPerson}</div>
                      <div className="text-[11px] text-slate-500">{req.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{req.state}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {req.estimatedMembers}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedInquiry(req);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleApprove(req)}
                          disabled={processingId === req._id}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {processingId === req._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedInquiry(req);
                            setShowRejectModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Society Registration Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Society Name:</span> <div className="text-white font-bold text-sm">{selectedInquiry.societyName}</div></div>
                <div><span className="text-slate-500">Society Type:</span> <div className="text-emerald-400 font-semibold">{selectedInquiry.societyType}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Contact Person:</span> <div className="text-white font-semibold">{selectedInquiry.contactPerson} ({selectedInquiry.designation})</div></div>
                <div><span className="text-slate-500">State / Region:</span> <div className="text-white font-semibold">{selectedInquiry.state}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Email Address:</span> <div className="text-slate-300">{selectedInquiry.email}</div></div>
                <div><span className="text-slate-500">Phone Number:</span> <div className="text-slate-300">{selectedInquiry.phone}</div></div>
              </div>
              <div>
                <span className="text-slate-500">Society Message:</span>
                <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 mt-1">{selectedInquiry.message || 'No additional notes provided.'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">Close</button>
              <button onClick={() => handleApprove(selectedInquiry)} className="px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs">Approve Society</button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REMARKS */}
      {showRejectModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full rounded-3xl border border-slate-700 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Reject Registration Request</h3>
            <p className="text-xs text-slate-400">
              Rejecting request for <strong>{selectedInquiry.societyName}</strong>. Please provide remarks.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                rows="3"
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                required
                placeholder="Reason for rejection (e.g. Invalid registration documents)..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs">Submit Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizationApprovalsPage;
