import React, { useState, useEffect } from 'react';
import { 
  Award, 
  UserCheck, 
  CheckCircle2, 
  Loader2, 
  User, 
  ShieldCheck, 
  ArrowRight,
  Building2 
} from 'lucide-react';
import { fetchBranchesList, assignBranchManagerApi, fetchOrgEmployees, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BranchManagerAssignPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('All');

  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedManagerName, setSelectedManagerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

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

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const queryParams = {};
        if (isSuperAdmin && selectedOrgId && selectedOrgId !== 'All') {
          queryParams.organizationId = selectedOrgId;
        }

        const [bRes, eRes] = await Promise.all([
          fetchBranchesList(queryParams),
          fetchOrgEmployees(queryParams)
        ]);
        if (bRes.data && bRes.data.success) {
          const list = bRes.data.data;
          setBranches(list);
          if (list.length > 0) {
            setSelectedBranchId(list[0]._id);
            setSelectedManagerName(list[0].managerName || '');
          } else {
            setSelectedBranchId('');
            setSelectedManagerName('');
          }
        }
        if (eRes.data && eRes.data.success) {
          setEmployees(eRes.data.data);
        }
      } catch (err) {
        console.warn('Error loading assignment data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [selectedOrgId]);

  const handleBranchChange = (e) => {
    const bId = e.target.value;
    setSelectedBranchId(bId);
    const found = branches.find((b) => b._id === bId);
    if (found) {
      setSelectedManagerName(found.managerName || '');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedManagerName) return;

    setSaving(true);
    setMsg('');

    try {
      const res = await assignBranchManagerApi(selectedBranchId, { managerName: selectedManagerName });
      if (res.data && res.data.success) {
        setMsg(`Branch Manager '${selectedManagerName}' assigned successfully!`);
        const updated = branches.map((b) => (b._id === selectedBranchId ? { ...b, managerName: selectedManagerName } : b));
        setBranches(updated);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const currentBranch = branches.find((b) => b._id === selectedBranchId) || branches[0];

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-teal-400" />
            <span>Branch Manager Assignment Desk</span>
          </h1>
          <p className="text-xs text-slate-400">
            Designate or re-assign branch managers to lead operational branches and oversee local tellers
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Assignment Card */}
      <form onSubmit={handleAssignSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Super Admin Organization Picker */}
        {isSuperAdmin && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Organization Scope</label>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold focus:outline-none"
              >
                <option value="All">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.code || 'ORG'})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Filtering branches and staff for the selected cooperative society.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Operational Branch *</label>
            <select
              value={selectedBranchId}
              onChange={handleBranchChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.branchName} ({b.branchCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Manager Name *</label>
            <select
              value={selectedManagerName}
              onChange={(e) => setSelectedManagerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.name}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Manager Badge */}
        {currentBranch && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Current Assigned Manager</div>
                <div className="text-sm font-bold text-white">{currentBranch.managerName || 'Unassigned'}</div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Active Status
            </span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            <span>Confirm Manager Assignment</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default BranchManagerAssignPage;
