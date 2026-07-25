import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Loader2 
} from 'lucide-react';
import { fetchBranchMembers } from '../../services/api';

const BranchMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await fetchBranchMembers('65e222222222222222222221');
        if (res.data && res.data.success) {
          setMembers(res.data.data);
        }
      } catch (err) {
        console.warn('Using default branch members list:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Branch Members Overview</span>
          </h1>
          <p className="text-xs text-slate-400">
            Active cooperative society account holders linked to this specific branch location
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Total Branch Members</div>
          <div className="text-3xl font-extrabold text-white">850</div>
          <div className="text-[11px] text-emerald-400">100% scoped to JP-01</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Regular Account Holders</div>
          <div className="text-3xl font-extrabold text-teal-400">680</div>
          <div className="text-[11px] text-slate-500">With active savings deposit</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Associate Members</div>
          <div className="text-3xl font-extrabold text-cyan-400">170</div>
          <div className="text-[11px] text-slate-500">Nominee & secondary holders</div>
        </div>
      </div>

      {/* Members Table */}
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
                  <th className="px-6 py-4">Account Type</th>
                  <th className="px-6 py-4">Contact Phone</th>
                  <th className="px-6 py-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {members.map((mem) => (
                  <tr key={mem._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-mono">
                          {mem.name ? mem.name[0] : 'M'}
                        </div>
                        <div>
                          <div>{mem.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono font-normal">{mem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        Regular Member
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{mem.phone || '+91 99000 00007'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        Active Account
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default BranchMembersPage;
