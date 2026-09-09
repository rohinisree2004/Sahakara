import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Loader2,
  Users,
  Building2,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>Society Employee Directory</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              View society executives, board directors, branch managers, office clerks, and counter tellers assigned to this cooperative organization.
            </p>
          </div>

          <Link
            to="/users/create"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name, email, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 transition-all placeholder:text-slate-400"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Organization Admin">Organization Admin</option>
            <option value="Branch Manager">Branch Manager</option>
            <option value="Employee">Teller / Staff</option>
            <option value="President">Group President</option>
            <option value="Secretary">Group Secretary</option>
            <option value="Treasurer">Group Treasurer</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading society employee directory...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Designation / Role</th>
                  <th className="px-6 py-4">Branch Office</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No employees registered matching criteria.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-black text-xs">
                            {emp.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">@{emp.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-teal-700">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-bold">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {emp.branchId?.branchName || 'Head Office / Main'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {emp.email}</p>
                        {emp.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {emp.phone}</p>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono">
                          Active
                        </span>
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

export default OrgEmployeesPage;
