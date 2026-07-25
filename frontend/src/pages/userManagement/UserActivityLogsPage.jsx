import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  User, 
  Loader2 
} from 'lucide-react';
import { fetchUserLogs } from '../../services/api';

const UserActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-cyan-400" />
            <span>User Activity & Account Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400">
            Audit history tracking user creation, role modifications, branch transfers, and password resets
          </p>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
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
                      <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.performerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-cyan-400 font-semibold">{log.performerRole}</td>
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

export default UserActivityLogsPage;
