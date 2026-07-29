import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  FileText, 
  Loader2 
} from 'lucide-react';
import { fetchMembersList, verifyMemberKYCApi } from '../../services/api';

const MemberKYCPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetchMembersList();
      if (res.data && res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading KYC members:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleVerifyKYC = async (m) => {
    try {
      const res = await verifyMemberKYCApi(m._id);
      if (res.data && res.data.success) {
        setMsg(`KYC documents verified for '${m.fullName}'!`);
        loadMembers();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <span>KYC Document Verification Desk</span>
          </h1>
          <p className="text-xs text-slate-400">
            Verify Aadhaar cards, PAN cards, and address proofs submitted during member enrollment
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* KYC Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Member Name</th>
                  <th className="px-6 py-4">Aadhaar No.</th>
                  <th className="px-6 py-4">PAN No.</th>
                  <th className="px-6 py-4">KYC Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {members.map((m) => {
                  const isVerified = m.kycDocuments?.kycVerified !== false;
                  return (
                    <tr key={m._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        <div>{m.fullName}</div>
                        <div className="text-[11px] font-mono text-emerald-400 font-normal">{m.memberId}</div>
                      </td>
                      <td className="px-6 py-4 font-mono">{m.kycDocuments?.aadhaarNumber || 'XXXX-XXXX-8821'}</td>
                      <td className="px-6 py-4 font-mono uppercase">{m.kycDocuments?.panNumber || 'ABCDE1234F'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isVerified
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                          {isVerified ? 'KYC Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isVerified ? (
                          <button
                            onClick={() => handleVerifyKYC(m)}
                            className="px-3 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md"
                          >
                            Verify KYC
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberKYCPage;
