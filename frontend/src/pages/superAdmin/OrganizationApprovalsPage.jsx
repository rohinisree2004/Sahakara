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
  Sparkles,
  RefreshCw,
  X
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-teal-600" />
            <span>Organization Approval Queue</span>
          </h1>
          <p className="text-xs text-slate-500">
            Review onboarding registration requests from cooperative societies and issue system credentials
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-colors shadow-xs flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Requests Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Pending Approvals</h3>
          <p className="text-xs text-slate-500">
            All registered cooperative society requests have been reviewed.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Society Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Contact Person</th>
                  <th className="px-6 py-3.5">State</th>
                  <th className="px-6 py-3.5">Est. Members</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-slate-900">{req.societyName}</div>
                          <div className="text-[11px] text-slate-400 font-mono font-normal">Reg: {req.registrationNumber || 'Pending'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-teal-800">{req.societyType}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-bold">{req.contactPerson}</div>
                      <div className="text-[11px] text-slate-500">{req.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{req.state}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
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
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleApprove(req)}
                          disabled={processingId === req._id}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-colors"
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
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Society Registration Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div><span className="text-slate-500">Society Name:</span> <div className="text-slate-900 font-black text-sm mt-0.5">{selectedInquiry.societyName}</div></div>
                <div><span className="text-slate-500">Society Type:</span> <div className="text-teal-800 font-bold mt-0.5">{selectedInquiry.societyType}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div><span className="text-slate-500">Contact Person:</span> <div className="text-slate-900 font-bold mt-0.5">{selectedInquiry.contactPerson} ({selectedInquiry.designation})</div></div>
                <div><span className="text-slate-500">State / Region:</span> <div className="text-slate-900 font-bold mt-0.5">{selectedInquiry.state}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div><span className="text-slate-500">Email Address:</span> <div className="text-slate-800 font-medium mt-0.5">{selectedInquiry.email}</div></div>
                <div><span className="text-slate-500">Phone Number:</span> <div className="text-slate-800 font-medium mt-0.5">{selectedInquiry.phone}</div></div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Society Requirements / Notes:</span>
                <p className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 mt-1 leading-relaxed">{selectedInquiry.message || 'No additional notes provided.'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Close</button>
              <button onClick={() => handleApprove(selectedInquiry)} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20">Approve Society</button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REMARKS */}
      {showRejectModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Reject Registration Request</h3>
            <p className="text-xs text-slate-500">
              Rejecting request for <strong className="text-slate-900">{selectedInquiry.societyName}</strong>. Please provide remarks.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                rows="3"
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                required
                placeholder="Reason for rejection (e.g. Invalid registration documents)..."
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 resize-none"
              />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20">Submit Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizationApprovalsPage;
