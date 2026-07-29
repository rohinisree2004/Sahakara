import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Award, 
  Wallet, 
  Landmark, 
  User, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { fetchGroupProfile } from '../../services/api';

const GroupProfilePage = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchGroupProfile(id || 'GRP-65e10001');
        if (res.data && res.data.success && res.data.data) {
          setGroup(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading group profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const g = group || {
    groupId: 'GRP-2026-001',
    groupCode: 'SHG-JP-101',
    groupName: 'Mahila Pragati SHG',
    groupType: 'Self-Help Group (SHG)',
    description: 'Women empowerment micro-savings and credit group',
    status: 'Active',
    totalMembers: 15,
    branchId: { branchName: 'JP Nagar Main Branch', branchCode: 'JP-01' },
    leaderId: { fullName: 'Sunita Bhatt', phone: '+91 99000 99887', memberId: 'MEM-2026-101' },
    memberIds: [
      { _id: 'M-1', fullName: 'Ganesh Bhatt', memberId: 'MEM-2026-101', phone: '+91 99000 00007', category: 'Regular Member', membershipStatus: 'Active' },
      { _id: 'M-2', fullName: 'Rajesh Sharma', memberId: 'MEM-2026-102', phone: '+91 97410 88221', category: 'Regular Member', membershipStatus: 'Active' },
    ],
    savingsSummary: '₹ 1.85 Lakhs',
    loanSummary: '₹ 3.5 Lakhs',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link to="/groups/list" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Back to Group Registry</span>
        </Link>
      </div>

      {/* Main Profile Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white font-mono text-2xl font-bold shadow-xl">
            {g.groupName ? g.groupName[0] : 'G'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{g.groupName}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/10 border border-teal-500/30 text-teal-400">
                {g.groupCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Type: <strong className="text-white">{g.groupType}</strong> • Branch: <strong className="text-teal-400">{g.branchId?.branchName || 'JP Nagar'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Leader & Financial Position */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Group Leader & Financial Summary</span>
          </h3>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Designated Group Leader</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" />
              <span>{g.leaderId?.fullName || 'Sunita Bhatt'}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              ID: {g.leaderId?.memberId || 'MEM-2026-101'} • Phone: {g.leaderId?.phone || '+91 99000 99887'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] font-medium">Group Savings Pool</div>
              <div className="text-teal-400 font-extrabold font-mono text-base">{g.savingsSummary || '₹ 1.85 Lakhs'}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] font-medium">Active JLG Loan</div>
              <div className="text-cyan-400 font-extrabold font-mono text-base">{g.loanSummary || '₹ 3.5 Lakhs'}</div>
            </div>
          </div>
        </div>

        {/* Member Roster */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Group Member Roster</span>
            <span className="text-xs font-mono text-teal-400 font-bold">{g.memberIds?.length || 2} Members</span>
          </h3>

          <div className="space-y-3">
            {g.memberIds?.map((m) => (
              <div key={m._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{m.fullName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{m.memberId} • {m.phone}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {m.membershipStatus || 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default GroupProfilePage;
