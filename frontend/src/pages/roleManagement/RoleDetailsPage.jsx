import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { fetchRoleDetails } from '../../services/api';

const RoleDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await fetchRoleDetails(id || 'CUST-1');
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading role details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const role = data?.role || {
    roleName: 'Loan Auditor',
    description: 'Custom role with read, approve, and report export rights for loans',
    isSystemRole: false,
    status: 'Active',
    permissions: [
      { module: 'Loans', actions: ['read', 'approve', 'export'] },
      { module: 'Reports', actions: ['read', 'export'] },
    ],
  };

  const assignedUsers = data?.assignedUsers || [
    { _id: 'U-1', name: 'Mahesh Rao', username: 'employee', email: 'employee@coop.org' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link to="/roles/list" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>Back to Role Registry</span>
        </Link>
      </div>

      {/* Role Profile Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-2xl font-bold shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{role.roleName}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                {role.isSystemRole ? 'System Role' : 'Custom Role'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{role.description}</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Granted Matrix */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Granted Permission Matrix</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{role.permissions?.length || 0} Modules</span>
          </h3>

          <div className="space-y-3">
            {role.permissions?.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-xs">{p.module}</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.actions?.map((act) => (
                    <span key={act} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Users */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Assigned Society Users</span>
            <span className="text-xs font-mono text-indigo-400 font-bold">{assignedUsers.length} Users</span>
          </h3>

          <div className="space-y-3">
            {assignedUsers.map((u) => (
              <div key={u._id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">@{u.username} • {u.email}</div>
                </div>
                <Users className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default RoleDetailsPage;
