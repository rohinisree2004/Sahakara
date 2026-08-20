import React, { useState } from 'react';
import { Building2, GitBranch, Users, ChevronDown, Check, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveContext } from '../../contexts/ActiveContextContext';

const ContextSwitcher = () => {
  const { user } = useAuth();
  const { activeOrganization, activeBranch, activeGroup, switchContext } = useActiveContext();
  const [isOpen, setIsOpen] = useState(false);

  const isSuperAdmin = user?.role === 'Super Admin';
  const myAssignments = user?.roleAssignments || [];

  // Extract unique organizations, branches, and groups
  const orgMap = new Map();
  const branchMap = new Map();
  const groupMap = new Map();

  myAssignments.forEach(r => {
    if (r.organizationId) {
      const id = r.organizationId._id || r.organizationId;
      const name = r.organizationId.name || `Organization ${orgMap.size + 1}`;
      orgMap.set(id.toString(), { id, name });
    }
    if (r.branchId) {
      const id = r.branchId._id || r.branchId;
      const name = r.branchId.branchName || `Branch ${branchMap.size + 1}`;
      branchMap.set(id.toString(), { id, name });
    }
    if (r.groupId) {
      const id = r.groupId._id || r.groupId;
      const name = r.groupId.groupName || `Group ${groupMap.size + 1}`;
      groupMap.set(id.toString(), { id, name });
    }
  });

  const availableOrgs = Array.from(orgMap.values());
  const availableBranches = Array.from(branchMap.values());
  const availableGroups = Array.from(groupMap.values());

  const currentLabel = () => {
    if (activeGroup && groupMap.has(activeGroup.toString())) {
      return groupMap.get(activeGroup.toString()).name;
    }
    if (activeBranch && branchMap.has(activeBranch.toString())) {
      return branchMap.get(activeBranch.toString()).name;
    }
    if (activeOrganization && orgMap.has(activeOrganization.toString())) {
      return orgMap.get(activeOrganization.toString()).name;
    }
    return isSuperAdmin ? 'Global Platform' : user?.organizationName || 'Current Organization';
  };

  const handleSelect = (type, entityId) => {
    switchContext(type, entityId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 hover:border-teal-400 hover:bg-teal-50/50 transition-all shadow-sm"
      >
        <Building2 className="w-4 h-4 text-teal-600" />
        <span className="font-bold max-w-[150px] truncate text-slate-900">
          {currentLabel()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <h4 className="text-[10px] font-bold text-teal-900 uppercase tracking-widest">Active Scope & Context</h4>
          </div>

          <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-3">
            {/* Super Admin Global Context */}
            {isSuperAdmin && (
              <div>
                <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Master Platform</div>
                <button
                  onClick={() => handleSelect('organization', null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${!activeOrganization ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-teal-600" />
                    <span>Global Super Admin</span>
                  </div>
                  {!activeOrganization && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              </div>
            )}

            {/* Organizations */}
            {availableOrgs.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Organizations</div>
                {availableOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelect('organization', org.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${activeOrganization === org.id ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">{org.name}</span>
                    </div>
                    {activeOrganization === org.id && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {/* Branches */}
            {availableBranches.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Branches</div>
                {availableBranches.map((br) => (
                  <button
                    key={br.id}
                    onClick={() => handleSelect('branch', br.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${activeBranch === br.id ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <GitBranch className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">{br.name}</span>
                    </div>
                    {activeBranch === br.id && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {/* Groups */}
            {availableGroups.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">SHG Groups</div>
                {availableGroups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => handleSelect('group', grp.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${activeGroup === grp.id ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Users className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">{grp.name}</span>
                    </div>
                    {activeGroup === grp.id && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextSwitcher;
