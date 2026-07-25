import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Loader2 
} from 'lucide-react';
import { fetchBranchEmployees } from '../../services/api';

const BranchEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await fetchBranchEmployees('65e222222222222222222221');
        if (res.data && res.data.success) {
          setEmployees(res.data.data);
        }
      } catch (err) {
        console.warn('Using default staff list:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal-400" />
            <span>Branch Employees & Tellers</span>
          </h1>
          <p className="text-xs text-slate-400">
            Counter staff, loan processing officers, and tellers assigned to this operational branch
          </p>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Employee Name</th>
                  <th className="px-6 py-4">Role Title</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 font-mono">
                          {emp.name ? emp.name[0] : 'U'}
                        </div>
                        <div>
                          <div>{emp.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono font-normal">@{emp.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 border border-teal-500/30 text-teal-400">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>{emp.email}</div>
                      <div className="text-slate-500 text-[11px]">{emp.phone || '+91 99000 00006'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        Active Staff
                      </span>
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

export default BranchEmployeesPage;
