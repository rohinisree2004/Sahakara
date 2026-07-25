import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  User, 
  Loader2 
} from 'lucide-react';
import { fetchUsersList, fetchUserAccessReview } from '../../services/api';

const UserAccessReviewPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsersList();
        if (res.data && res.data.success) {
          const list = res.data.data;
          setUsers(list);
          if (list.length > 0) setSelectedUserId(list[0]._id);
        }
      } catch (err) {
        console.warn('Error loading users:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    const loadReview = async () => {
      setReviewLoading(true);
      try {
        const res = await fetchUserAccessReview(selectedUserId);
        if (res.data && res.data.success) {
          setReview(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading review:', err.message);
      } finally {
        setReviewLoading(false);
      }
    };
    loadReview();
  }, [selectedUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const effectivePerms = review?.effectivePermissions || [
    { module: 'Members', actions: ['create', 'read', 'update'] },
    { module: 'Savings', actions: ['create', 'read', 'update'] },
    { module: 'Loans', actions: ['read'] },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-400" />
            <span>User Effective Access & Permission Review</span>
          </h1>
          <p className="text-xs text-slate-400">
            Inspect individual user permission matrices and effective access granted across all 13 ERP modules
          </p>
        </div>
      </div>

      {/* User Selector */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select User to Inspect Permissions</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role}) — {u.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Effective Matrix Result */}
      {reviewLoading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Effective Access Matrix</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{effectivePerms.length} Modules Granted</span>
          </h3>

          <div className="space-y-3">
            {effectivePerms.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white mb-1">{p.module}</div>
                  <div className="flex flex-wrap gap-1">
                    {p.actions.map((act) => (
                      <span key={act} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default UserAccessReviewPage;
