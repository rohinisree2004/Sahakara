import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { fetchOrgEmployees } from '../../services/api';

const OrgEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetchOrgEmployees({ search, role: roleFilter });
      if (res.data && res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading employees:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEmployees();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal-400" />
            <span>Society Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-400">
            View society executives, board directors, office staff, and counter tellers assigned to this organization
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name, username, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400 font-semibold">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Organization Admin">Org Admin</option>
            <option value="President">President</option>
            <option value="Secretary">Secretary</option>
            <option value="Treasurer">Treasurer</option>
            <option value="Employee">Employee / Teller</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
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
                  <th className="px-6 py-4">Employee Name</th>
                  <th className="px-6 py-4">Role Title</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 font-mono">
                          {emp.name ? emp.name[0] : 'U'}
                        </div>
                        <div>
                          <div>{emp.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono font-normal">@{emp.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{emp.email}</div>
                      <div className="text-slate-500 text-[11px]">{emp.phone || '+91 99000 00000'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        emp.isActive !== false
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {emp.isActive !== false ? 'Active' : 'Inactive'}
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

export default OrgEmployeesPage;
