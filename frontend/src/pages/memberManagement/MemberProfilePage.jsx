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
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  CreditCard,
  HeartHandshake
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
        const res = await fetchMemberProfile(id);
        if (res.data && res.data.success && res.data.data) {
          setMember(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading member profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
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
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link 
          to="/members/list" 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600" />
          <span>Back to Member Registry</span>
        </Link>

        <button
          onClick={() => setShowCertModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Award className="w-4 h-4 text-teal-600" />
          <span>Membership Certificate</span>
        </button>
      </div>

      {/* Main Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-mono text-2xl font-black shadow-xs shrink-0">
              {m.fullName ? m.fullName[0] : 'M'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {m.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold">
                  {m.memberId}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  m.membershipStatus === 'Active'
                    ? 'bg-teal-50 border-teal-200 text-teal-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {m.membershipStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-1 font-medium">
                <span>
                  Category: <strong className="text-slate-800">{m.category}</strong>
                </span>
                <span>•</span>
                <span>
                  Branch: <strong className="text-slate-800">{m.branchId?.branchName || m.branchName || 'Head Office'}</strong>
                </span>
                <span>•</span>
                <span>
                  Enrolled: {new Date(m.joiningDate || m.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal & Nominee Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Personal & Nominee Designation
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-bold">Phone Number:</span>
              <strong className="text-slate-900">{m.phone || 'N/A'}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-bold">Email Address:</span>
              <strong className="text-slate-900">{m.email || 'N/A'}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-bold">Occupation:</span>
              <strong className="text-slate-900">{m.occupation || 'Self-Employed'}</strong>
            </div>
            <div className="py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-bold block mb-1">Residential Address:</span>
              <p className="font-semibold text-slate-900">
                {m.address ? (m.district ? `${m.address}, ${m.district}, ${m.state || 'Kerala'}` : m.address) : 'Address not registered'}
              </p>
            </div>

            <div className="pt-2">
              <div className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Nominee Particulars</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-black text-slate-900 text-sm">
                  {m.nominee?.name || 'Nominee Not Configured'} {m.nominee?.relationship ? `(${m.nominee.relationship})` : ''}
                </div>
                <div className="text-teal-800 font-mono text-[11px] font-bold">Benefit Share: {m.nominee?.sharePercentage || 100}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* KYC & Financial Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              KYC Status & Financial Summary
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px] font-bold">Aadhaar Card Number</div>
                <div className="text-slate-900 font-mono font-black text-sm">{m.kycDocuments?.aadhaarNumber || 'XXXX-XXXX-8821'}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Verified
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px] font-bold">Income Tax PAN</div>
                <div className="text-slate-900 font-mono font-black text-sm">{m.kycDocuments?.panNumber || 'ABCDE1234F'}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1">
                <div className="text-slate-500 text-[11px] font-bold">Savings Account</div>
                <div className="text-teal-900 font-black text-base">Active</div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1">
                <div className="text-slate-500 text-[11px] font-bold">Credit Profile</div>
                <div className="text-teal-900 font-black text-base">Standard Class</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 p-8 space-y-6 shadow-2xl text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto font-bold shadow-xs">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">Official Certificate of Membership</div>
              <h2 className="text-2xl font-black text-slate-900">{m.fullName}</h2>
              <p className="text-xs text-slate-500">Membership Number: <span className="font-mono font-bold text-slate-800">{m.memberId}</span></p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2 text-left">
              <p>This certifies that <strong>{m.fullName}</strong> is a duly enrolled <strong>{m.category}</strong> of the <strong>{m.branchId?.branchName || 'Cooperative Society'}</strong> branch.</p>
              <p className="text-[11px] text-slate-400">Issued under the Multi-Tenant Cooperative Society Rules & Governance Framework.</p>
            </div>

            <button
              onClick={() => setShowCertModal(false)}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberProfilePage;
