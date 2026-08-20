import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GitBranch, 
  Users, 
  User, 
  Filter, 
  RotateCcw, 
  Layers,
  ChevronDown,
  Lock
} from 'lucide-react';
import { 
  fetchOrganizations, 
  fetchBranchesList, 
  fetchGroupsList, 
  fetchMembersList 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Reusable Hierarchical Cascading Filter Bar:
 * Allows filtering records across:
 * 1. Society (Organization) [Super Admin only, locked for Society Admin/Branch Manager]
 * 2. Branch [Super Admin / Org Admin only, strictly locked for Branch Manager]
 * 3. Group (SHG/JLG)
 * 4. Member
 */
const HierarchicalFilterBar = ({ 
  onFilterChange,
  initialValues = {},
  showMemberFilter = true,
  showGroupFilter = true,
  className = ''
}) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isOrgAdmin = user?.role === 'Organization Admin';
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);

  const defaultUserOrg = user?.organizationId?._id || user?.organizationId || '';
  const defaultUserBranch = isBranchScoped ? (user?.branchId?._id || user?.branchId || '') : 'All';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedOrgId, setSelectedOrgId] = useState(
    isSuperAdmin ? (initialValues.organizationId || 'All') : defaultUserOrg
  );
  const [selectedBranchId, setSelectedBranchId] = useState(
    isBranchScoped ? defaultUserBranch : (initialValues.branchId || 'All')
  );
  const [selectedGroupId, setSelectedGroupId] = useState(initialValues.groupId || 'All');
  const [selectedMemberId, setSelectedMemberId] = useState(initialValues.memberId || 'All');

  const [loading, setLoading] = useState(false);

  // Load Initial Organizations (for Super Admin)
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations();
          if (res.data && res.data.success) {
            setOrganizations(res.data.data || []);
          }
        } catch (err) {
          console.warn('Error loading organizations for filter:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  // Load Branches, Groups & Members
  useEffect(() => {
    const loadOrgBranchesAndGroups = async () => {
      setLoading(true);
      try {
        const orgParam = {};
        if (selectedOrgId && selectedOrgId !== 'All') {
          orgParam.organizationId = selectedOrgId;
        }
        if (isBranchScoped && defaultUserBranch) {
          orgParam.branchId = defaultUserBranch;
        }

        const [bRes, gRes, mRes] = await Promise.all([
          fetchBranchesList(orgParam),
          showGroupFilter ? fetchGroupsList(orgParam) : Promise.resolve({ data: { data: [] } }),
          showMemberFilter ? fetchMembersList({ ...orgParam, limit: 150 }) : Promise.resolve({ data: { data: [] } })
        ]);

        if (bRes.data && bRes.data.success) {
          setBranches(bRes.data.data || []);
          if (isBranchScoped && (!selectedBranchId || selectedBranchId === 'All') && bRes.data.data.length > 0) {
            setSelectedBranchId(bRes.data.data[0]._id);
          }
        }
        if (gRes.data && gRes.data.success) {
          setGroups(gRes.data.data || []);
        }
        if (mRes.data && mRes.data.success) {
          setMembers(mRes.data.data || []);
        }
      } catch (err) {
        console.warn('Error loading cascading filter dependencies:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrgBranchesAndGroups();
  }, [selectedOrgId, isBranchScoped, defaultUserBranch, showGroupFilter, showMemberFilter]);

  // When Branch changes, filter Groups & Members
  const filteredGroups = groups.filter(g => {
    const effectiveBranch = isBranchScoped ? defaultUserBranch : selectedBranchId;
    if (!effectiveBranch || effectiveBranch === 'All') return true;
    const bId = (g.branchId?._id || g.branchId)?.toString();
    return bId === effectiveBranch.toString();
  });

  const filteredMembers = members.filter(m => {
    const effectiveBranch = isBranchScoped ? defaultUserBranch : selectedBranchId;
    if (effectiveBranch && effectiveBranch !== 'All') {
      const mBranchId = (m.branchId?._id || m.branchId)?.toString();
      if (mBranchId !== effectiveBranch.toString()) return false;
    }
    if (selectedGroupId !== 'All') {
      const gDoc = groups.find(g => g._id === selectedGroupId);
      if (gDoc) {
        const memIds = (gDoc.memberIds || []).map(id => (id?._id || id)?.toString());
        return memIds.includes(m._id.toString());
      }
    }
    return true;
  });

  // Notify parent on state change
  const handleOrgChange = (e) => {
    const val = e.target.value;
    setSelectedOrgId(val);
    if (!isBranchScoped) setSelectedBranchId('All');
    setSelectedGroupId('All');
    setSelectedMemberId('All');
    if (onFilterChange) {
      onFilterChange({
        organizationId: val,
        branchId: isBranchScoped ? defaultUserBranch : 'All',
        groupId: 'All',
        memberId: 'All'
      });
    }
  };

  const handleBranchChange = (e) => {
    if (isBranchScoped) return; // Prevent Branch Manager from modifying branch
    const val = e.target.value;
    setSelectedBranchId(val);
    setSelectedGroupId('All');
    setSelectedMemberId('All');
    if (onFilterChange) {
      onFilterChange({
        organizationId: selectedOrgId,
        branchId: val,
        groupId: 'All',
        memberId: 'All'
      });
    }
  };

  const handleGroupChange = (e) => {
    const val = e.target.value;
    setSelectedGroupId(val);
    setSelectedMemberId('All');
    if (onFilterChange) {
      onFilterChange({
        organizationId: selectedOrgId,
        branchId: isBranchScoped ? defaultUserBranch : selectedBranchId,
        groupId: val,
        memberId: 'All'
      });
    }
  };

  const handleMemberChange = (e) => {
    const val = e.target.value;
    setSelectedMemberId(val);
    if (onFilterChange) {
      onFilterChange({
        organizationId: selectedOrgId,
        branchId: isBranchScoped ? defaultUserBranch : selectedBranchId,
        groupId: selectedGroupId,
        memberId: val
      });
    }
  };

  const handleReset = () => {
    const defaultOrg = isSuperAdmin ? 'All' : defaultUserOrg;
    const defaultBranch = isBranchScoped ? defaultUserBranch : 'All';
    setSelectedOrgId(defaultOrg);
    setSelectedBranchId(defaultBranch);
    setSelectedGroupId('All');
    setSelectedMemberId('All');
    if (onFilterChange) {
      onFilterChange({
        organizationId: defaultOrg,
        branchId: defaultBranch,
        groupId: 'All',
        memberId: 'All'
      });
    }
  };

  const isFiltered = (isSuperAdmin && selectedOrgId !== 'All') || 
    (!isBranchScoped && selectedBranchId !== 'All') || 
    selectedGroupId !== 'All' || 
    selectedMemberId !== 'All';

  const branchName = branches.find(b => b._id === selectedBranchId)?.branchName || user?.branchName || 'Assigned Branch';

  return (
    <div className={`bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 ${className}`}>
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {isBranchScoped ? 'Branch Governance & Scope Filter' : 'Governance & Scope Filter Desk'}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {isBranchScoped 
                ? `Locked to ${branchName} • Filter SHG Groups & Members` 
                : 'Filter data across Societies, Branches, SHG/JLG Groups & Members'}
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Scope</span>
          </button>
        )}
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* 1. Society (Organization) */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-teal-600" />
            <span>Cooperative Society</span>
          </label>
          <div className="relative">
            <select
              value={selectedOrgId}
              onChange={handleOrgChange}
              disabled={!isSuperAdmin}
              className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 disabled:opacity-75 cursor-pointer"
            >
              {isSuperAdmin && <option value="All">All Societies (Global)</option>}
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 2. Branch */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-teal-600" />
            <span>Branch {isBranchScoped && '(Locked)'}</span>
          </label>
          <div className="relative">
            {isBranchScoped ? (
              <div className="w-full px-3 py-2 rounded-xl bg-teal-50/70 border border-teal-200 text-xs font-bold text-teal-900 flex items-center justify-between">
                <span className="truncate">{branchName}</span>
                <Lock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              </div>
            ) : (
              <>
                <select
                  value={selectedBranchId}
                  onChange={handleBranchChange}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  <option value="All">All Branches ({branches.length})</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        {/* 3. Group (SHG / JLG) */}
        {showGroupFilter && (
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-teal-600" />
              <span>SHG / JLG Group</span>
            </label>
            <div className="relative">
              <select
                value={selectedGroupId}
                onChange={handleGroupChange}
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="All">All Groups ({filteredGroups.length})</option>
                {filteredGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.groupName} ({g.groupCode})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* 4. Member */}
        {showMemberFilter && (
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-teal-600" />
              <span>Individual Member</span>
            </label>
            <div className="relative">
              <select
                value={selectedMemberId}
                onChange={handleMemberChange}
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="All">All Members ({filteredMembers.length})</option>
                {filteredMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName} ({m.memberId || 'MEM'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HierarchicalFilterBar;
