import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  User, 
  Loader2, 
  Building2,
  Sparkles,
  RefreshCw,
  Clock
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

  useEffect(() => {
    loadLogs();
  }, [selectedOrgId]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Immutable Member Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Member Activity & Audit Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit log records of member enrollments, board approvals, rejections, and KYC verification events.
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <button
              onClick={loadLogs}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs"
              title="Refresh Logs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <Clock className="w-12 h-12 text-teal-600 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No Member Audit Logs</h3>
          <p className="text-xs text-slate-500">No member activity events recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Action Event</th>
                  <th className="px-6 py-3.5">Performer Name</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Action Details</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.performerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-teal-800 font-bold">{log.performerRole}</td>
                    <td className="px-6 py-4 max-w-md text-slate-700 font-semibold">{log.details}</td>
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
