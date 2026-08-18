import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  User, 
  Loader2,
  Building2 
} from 'lucide-react';
import { fetchMemberLogs, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberActivityLogsPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
          params.organizationId = selectedOrgId;
        }
        const res = await fetchMemberLogs(params);
        if (res.data && res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading member logs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [selectedOrgId]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            <span>Member Audit Trail History</span>
          </h1>
          <p className="text-xs text-slate-400">
            Audit history tracking member enrollments, board approvals, rejection remarks, and KYC verifications
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-semibold">Society:</span>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Organizations</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id} className="bg-slate-900 text-white">
                  {org.name} ({org.code || 'ORG'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Performer Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action Details</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.performerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">{log.performerRole}</td>
                    <td className="px-6 py-4 max-w-md">{log.details}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
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

export default MemberActivityLogsPage;
