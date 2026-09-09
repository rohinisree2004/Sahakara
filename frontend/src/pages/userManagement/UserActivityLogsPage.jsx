import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  User, 
  Loader2,
  ShieldCheck,
  Activity,
  Users
} from 'lucide-react';
import { fetchUserLogs } from '../../services/api';

const UserActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchUserLogs();
      if (res.data && res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading user logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = !search || 
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.performerName?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = actionFilter === 'All' || 
      log.action?.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
          <Users className="w-3.5 h-3.5" />
          User Management Audit
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span>User Activity & Account Audit Logs</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Audit history tracking user enrollments, role modifications, branch transfers, status toggles, and password resets.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action event, user, or details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">Action Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
          >
            <option value="All">All User Events</option>
            <option value="GROUP">Group & Leader Actions</option>
            <option value="MANAGER">Manager Assignments</option>
            <option value="STATUS">Account Status Changes</option>
            <option value="PASSWORD">Password Resets</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading user activity log records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Performer</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action Details</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No matching user activity audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold">
                        <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] uppercase font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                            {log.performerName?.charAt(0) || 'U'}
                          </div>
                          <span>{log.performerName || 'System User'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-teal-700">
                        {log.performerRole || 'Staff'}
                      </td>
                      <td className="px-6 py-4 max-w-md text-slate-600 leading-relaxed">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
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

export default UserActivityLogsPage;
