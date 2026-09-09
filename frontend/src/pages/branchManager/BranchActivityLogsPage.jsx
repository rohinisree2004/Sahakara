import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  User, 
  Loader2 
} from 'lucide-react';
import { fetchBranchLogs } from '../../services/api';

const BranchActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const res = await fetchBranchLogs('65e222222222222222222221');
        if (res.data && res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.warn('Using default logs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-teal-600" />
            <span>Branch Audit Trail History</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log history of branch creation, manager assignments, and operational updates
          </p>
        </div>
      </div>

      {/* Logs Table */}
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
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.performerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-teal-700 font-bold">{log.performerRole}</td>
                    <td className="px-6 py-4 max-w-md text-slate-700">{log.details}</td>
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

export default BranchActivityLogsPage;
