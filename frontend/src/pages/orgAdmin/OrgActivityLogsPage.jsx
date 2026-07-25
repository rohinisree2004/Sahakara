import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Clock, 
  User, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { fetchOrgLogs } from '../../services/api';

const OrgActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchOrgLogs({ search });
      if (res.data && res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading org logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            <span>Society Activity Trail Logs</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable audit record of administrative actions, profile updates, and branch management events for this society
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, performer, details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </form>
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

export default OrgActivityLogsPage;
