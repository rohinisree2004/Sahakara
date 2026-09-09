import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Loader2, 
  ShieldCheck,
  Calendar,
  Globe
} from 'lucide-react';
import { fetchAuditLogs } from '../../services/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs({
        search,
        action: actionFilter,
      });
      if (res.data && res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-teal-600" />
            <span>Master Audit Trail Logs</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable audit record of all Super Admin administrative actions, approvals, suspensions, and configuration changes
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, details, user..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-semibold">Action Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-teal-600"
          >
            <option value="All">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="UPDATE_STATUS">Status Updates</option>
            <option value="CREATE_ORGANIZATION">New Societies</option>
            <option value="SYSTEM_SETTINGS">Settings Changes</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-teal-50/70 text-teal-900 uppercase tracking-wider font-bold border-b border-teal-100 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No audit events matching current criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{log.details}</td>
                      <td className="px-6 py-4 text-slate-700">{log.performerName || log.userId?.name || 'System Root'}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuditLogsPage;
