import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  FileText, 
  Loader2,
  Building2,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { fetchMembersList, verifyMemberKYCApi, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberKYCPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const loadMembers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
        params.organizationId = selectedOrgId;
      }
      const res = await fetchMembersList(params);
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
  }, [selectedOrgId]);

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

  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      (m.fullName || '').toLowerCase().includes(term) ||
      (m.memberId || '').toLowerCase().includes(term) ||
      (m.kycDocuments?.aadhaarNumber || '').includes(term) ||
      (m.kycDocuments?.panNumber || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Statutory Compliance & Identity Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              KYC Document Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify Aadhaar cards, PAN numbers, and address documentation submitted during member onboarding.
            </p>
          </div>

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
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="font-semibold">{msg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member, Aadhaar, PAN..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
          />
        </div>

        <button
          onClick={loadMembers}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs"
          title="Refresh List"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
        </button>
      </div>

      {/* KYC Table */}
      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <ShieldCheck className="w-12 h-12 text-teal-600 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No KYC Records Found</h3>
          <p className="text-xs text-slate-500">No member accounts matched the search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Member Name & ID</th>
                  <th className="px-6 py-3.5">Aadhaar Card No.</th>
                  <th className="px-6 py-3.5">PAN Card No.</th>
                  <th className="px-6 py-3.5">KYC Verification</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const isVerified = m.kycDocuments?.kycVerified === true;
                  return (
                    <tr key={m._id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="text-slate-900 font-black">{m.fullName}</div>
                        <div className="text-[11px] font-mono text-teal-800 font-bold">{m.memberId}</div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {m.kycDocuments?.aadhaarNumber || 'XXXX-XXXX-8821'}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold uppercase text-slate-800">
                        {m.kycDocuments?.panNumber || 'ABCDE1234F'}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isVerified
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          {isVerified ? 'KYC Verified' : 'Pending Verification'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {!isVerified ? (
                          <button
                            onClick={() => handleVerifyKYC(m)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
                          >
                            Verify KYC
                          </button>
                        ) : (
                          <span className="text-[11px] text-teal-800 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Compliant</span>
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
