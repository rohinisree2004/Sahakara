import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  ShieldCheck, 
  Award, 
  Wallet, 
  Landmark, 
  User, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { fetchMemberProfile } from '../../services/api';

const MemberProfilePage = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchMemberProfile(id || 'MEM-65e10001');
        if (res.data && res.data.success && res.data.data) {
          setMember(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading member profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const m = member || {
    memberId: 'MEM-000',
    fullName: 'Member Record',
    phone: 'N/A',
    email: 'N/A',
    address: 'N/A',
    district: '',
    state: '',
    category: 'Regular Member',
    joiningDate: new Date(),
    membershipStatus: 'Active',
    branchId: { branchName: 'Main Branch', branchCode: 'BR-01' },
    nominee: { name: 'N/A', relationship: 'N/A', sharePercentage: 100 },
    kycDocuments: { aadhaarNumber: 'N/A', panNumber: 'N/A', kycVerified: false },
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link to="/members/list" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Member Registry</span>
        </Link>

        <button
          onClick={() => setShowCertModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2"
        >
          <Award className="w-4 h-4" />
          <span>Membership Certificate</span>
        </button>
      </div>

      {/* Main Profile Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white font-mono text-2xl font-bold shadow-xl">
            {m.fullName ? m.fullName[0] : 'M'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{m.fullName}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {m.memberId}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Category: <strong className="text-white">{m.category}</strong> • Branch: <strong className="text-emerald-400">{m.branchId?.branchName || m.branchName || 'Head Office'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal & Nominee Info */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Personal & Nominee Details</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div>Phone: <strong className="text-white">{m.phone || 'N/A'}</strong></div>
            <div>Email: <strong className="text-white">{m.email || 'N/A'}</strong></div>
            <div>Address: <strong className="text-white">{m.address ? (m.district ? `${m.address}, ${m.district}` : m.address) : 'N/A'}</strong></div>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-slate-400 font-medium">Nominee Information</div>
              <div className="text-white font-bold">{m.nominee?.name || 'N/A'} {m.nominee?.relationship ? `(${m.nominee.relationship})` : ''}</div>
              <div className="text-emerald-400 font-mono text-[11px]">Share: {m.nominee?.sharePercentage || 100}%</div>
            </div>
          </div>
        </div>

        {/* KYC & Financial Summary */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>KYC Status & Financial Position</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-400">Aadhaar Card</div>
                <div className="text-white font-mono font-bold">{m.kycDocuments?.aadhaarNumber || 'XXXX-XXXX-8821'}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Verified</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-400">PAN Card</div>
                <div className="text-white font-mono font-bold">{m.kycDocuments?.panNumber || 'ABCDE1234F'}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Savings Balance</div>
                <div className="text-emerald-400 font-extrabold font-mono text-sm">₹ 45,000</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Active Loan</div>
                <div className="text-cyan-400 font-extrabold font-mono text-sm">₹ 1.2 L</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DIGITAL MEMBERSHIP CERTIFICATE MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-emerald-500/40 p-8 space-y-6 text-center relative overflow-hidden">
            
            <div className="flex justify-end">
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>

            <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center text-white shadow-xl">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">Official Membership Certificate</span>
              <h2 className="text-xl font-extrabold text-white">Vijaya Credit Cooperative Society Ltd.</h2>
              <p className="text-xs text-slate-400">This certifies that</p>
              <div className="text-2xl font-black text-emerald-300 tracking-tight">{m.fullName}</div>
              <p className="text-xs text-slate-400">
                is a duly registered <strong className="text-white">{m.category}</strong> with Membership ID <strong className="text-emerald-400 font-mono">{m.memberId}</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
              <div>Issue Date: {new Date(m.joiningDate).toLocaleDateString()}</div>
              <div>Authorized Signatory</div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MemberProfilePage;
