import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  Search, 
  User, 
  Loader2,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Building2,
  GitBranch,
  Filter
} from 'lucide-react';
import { fetchGroupLogs } from '../../services/api';

const GroupActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const res = await fetchGroupLogs();
        if (res.data && res.data.success) {
          setLogs(res.data.data || []);
        }
      } catch (err) {
        console.warn('Error loading group logs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.performerName || '').toLowerCase().includes(term) ||
      (log.performerRole || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            to="/groups/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Groups Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <FileCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Group Activity & Audit Logs
              </h1>
              <p className="text-xs text-slate-500">
                Immutable audit trail tracking group creations, executive appointments, and member transfers
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-200">
          {logs.length} Recorded Events
        </span>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action event, user name, role, details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Action Event</th>
                  <th className="py-4 px-6">Performer Name</th>
                  <th className="py-4 px-6">Role Scope</th>
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No group audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold">
                        <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[11px]">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {log.performerName?.charAt(0) || 'U'}
                          </div>
                          <span>{log.performerName}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.performerRole}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-700 max-w-md">
                        {log.details}
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-slate-500">
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

export default GroupActivityLogsPage;
