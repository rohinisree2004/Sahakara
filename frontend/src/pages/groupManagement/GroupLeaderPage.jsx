import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Loader2, 
  Users, 
  UserCheck, 
  ShieldAlert,
  Sparkles,
  Save,
  Crown,
  FileSpreadsheet,
  Coins,
  ArrowLeft,
  Building2,
  GitBranch,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { 
  fetchGroupsList, 
  fetchMembersList, 
  assignGroupExecutivesApi,
  fetchBranchesList,
  fetchOrganizations
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const GroupLeaderPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isOrgAdmin = user?.role === 'Organization Admin';
  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(
    isBranchScoped ? userBranchId : 'All'
  );
  const [selectedGroupId, setSelectedGroupId] = useState('');
  
  const [presidentId, setPresidentId] = useState('');
  const [secretaryId, setSecretaryId] = useState('');
  const [treasurerId, setTreasurerId] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load Initial Dependencies
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedOrgId && selectedOrgId !== 'All') params.organizationId = selectedOrgId;
      if (isBranchScoped && userBranchId) {
        params.branchId = userBranchId;
      } else if (selectedBranchId && selectedBranchId !== 'All') {
        params.branchId = selectedBranchId;
      }

      const branchParams = isBranchScoped && userBranchId 
        ? { branchId: userBranchId } 
        : (selectedOrgId && selectedOrgId !== 'All' ? { organizationId: selectedOrgId } : {});

      const promises = [
        fetchGroupsList(params),
        fetchMembersList(isBranchScoped && userBranchId ? { branchId: userBranchId, limit: 150 } : { limit: 150 }),
        fetchBranchesList(branchParams)
      ];
      if (isSuperAdmin) promises.push(fetchOrganizations());

      const results = await Promise.all(promises);
      const gRes = results[0];
      const mRes = results[1];
      const bRes = results[2];
      const oRes = isSuperAdmin ? results[3] : null;

      if (oRes && oRes.data && oRes.data.success) {
        setOrganizations(oRes.data.data || []);
      }
      if (bRes.data && bRes.data.success) {
        setBranches(bRes.data.data || []);
      }
      if (mRes.data && mRes.data.success) {
        setMembers(mRes.data.data || []);
      }

      if (gRes.data && gRes.data.success) {
        const gList = gRes.data.data || [];
        setGroups(gList);
        if (gList.length > 0) {
          const first = gList[0];
          setSelectedGroupId(first._id);
          setPresidentId(first.presidentId?._id || first.presidentId || first.leaderId?._id || first.leaderId || '');
          setSecretaryId(first.secretaryId?._id || first.secretaryId || '');
          setTreasurerId(first.treasurerId?._id || first.treasurerId || '');
        }
      }
    } catch (err) {
      console.warn('Error loading executive desk data:', err.message);
      setErrorMsg('Unable to load group executive data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedOrgId, selectedBranchId]);

  const handleGroupSelect = (gId) => {
    setSelectedGroupId(gId);
    const grp = groups.find((g) => g._id === gId);
    if (grp) {
      setPresidentId(grp.presidentId?._id || grp.presidentId || grp.leaderId?._id || grp.leaderId || '');
      setSecretaryId(grp.secretaryId?._id || grp.secretaryId || '');
      setTreasurerId(grp.treasurerId?._id || grp.treasurerId || '');
    }
  };

  const selectedGroup = groups.find((g) => g._id === selectedGroupId) || groups[0];
  const groupRoster = Array.isArray(selectedGroup?.memberIds) ? selectedGroup.memberIds : [];
  
  // Available members for executive election in this group (MUST strictly be members enrolled in this specific group)
  const candidateExecutives = Array.isArray(selectedGroup?.memberIds) ? selectedGroup.memberIds : [];

  const handleExecutivesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const payload = {
        leaderId: presidentId || null,
        presidentId: presidentId || null,
        secretaryId: secretaryId || null,
        treasurerId: treasurerId || null,
      };

      const res = await assignGroupExecutivesApi(selectedGroupId, payload);
      if (res.data && res.data.success) {
        setMsg(`Group Executives for '${selectedGroup?.groupName}' assigned & synchronized successfully!`);
        await loadData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to update executives.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

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
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Elected Group Leadership & Executive Appointments
              </h1>
              <p className="text-xs text-slate-500">
                Appoint and synchronize Group Presidents, Secretaries, and Treasurers elected from members for each SHG / JLG group
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/groups/create"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
          >
            <span>+ Create New Group</span>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg('')} className="text-teal-600 hover:text-teal-900 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* Main Executive Assignment Form Card */}
      <form onSubmit={handleExecutivesSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-6">
        
        {/* Top Selection Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Societies</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>{org.name}</option>
                  ))}
                </select>
              </div>
            )}

            {!isBranchScoped && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <GitBranch className="w-4 h-4 text-teal-600 shrink-0" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Branches</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedGroup && (
            <div className="text-xs text-slate-500 font-medium">
              Group Type: <strong className="text-slate-900 font-bold">{selectedGroup.groupType}</strong> • Enrolled: <strong className="text-teal-800 font-bold">{selectedGroup.totalMembers || groupRoster.length} Members</strong>
            </div>
          )}
        </div>

        {/* Step 1: Select Target Group */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
            Target SHG / JLG Group *
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => handleGroupSelect(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
          >
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.groupName} ({g.groupCode}) — {g.groupType} [{g.totalMembers || 0} Members]
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Assign Three Executives Trio */}
        {candidateExecutives.length === 0 ? (
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3">
            <div className="font-bold flex items-center gap-2 text-sm text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>No Members Enrolled in '{selectedGroup?.groupName}'</span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-2xl">
              President, Secretary, and Treasurer must be elected strictly from members who belong to this group. Currently, this group has 0 enrolled members. Please allocate members from this society into <strong>{selectedGroup?.groupName}</strong> before appointing leadership.
            </p>
            <div className="pt-2">
              <Link
                to="/groups/members"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ Allocate Members to this Group</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Executive 1: President */}
          <div className="p-5 rounded-3xl bg-amber-50/40 border border-amber-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-900 uppercase tracking-wider">1. Group President</div>
                  <div className="text-[10px] text-amber-700 font-semibold">Chief Leader / Chair</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">Required</span>
            </div>

            <p className="text-[11px] text-slate-600">
              Presides over group meetings, chairs weekly collections, and signs initial group loan requests.
            </p>

            <select
              value={presidentId}
              onChange={(e) => setPresidentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="">-- Elect Group President --</option>
              {candidateExecutives.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Executive 2: Secretary */}
          <div className="p-5 rounded-3xl bg-teal-50/40 border border-teal-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-teal-900 uppercase tracking-wider">2. Group Secretary</div>
                  <div className="text-[10px] text-teal-700 font-semibold">Minutes & Resolutions</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900">Required</span>
            </div>

            <p className="text-[11px] text-slate-600">
              Records attendance, writes meeting resolutions, and maintains membership and loan registers.
            </p>

            <select
              value={secretaryId}
              onChange={(e) => setSecretaryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-teal-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500 shadow-2xs"
            >
              <option value="">-- Elect Group Secretary --</option>
              {candidateExecutives.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Executive 3: Treasurer */}
          <div className="p-5 rounded-3xl bg-emerald-50/40 border border-emerald-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-900 uppercase tracking-wider">3. Group Treasurer</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Thrift & Savings Accounts</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">Required</span>
            </div>

            <p className="text-[11px] text-slate-600">
              Collects monthly thrift savings, handles bank deposits with branch, and reconciles passbooks.
            </p>

            <select
              value={treasurerId}
              onChange={(e) => setTreasurerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
            >
              <option value="">-- Elect Group Treasurer --</option>
              {candidateExecutives.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.memberId || 'MEM'}) {m.phone ? `• ${m.phone}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

        {/* Form Submission */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Selected executives will be granted group-level portal access & executive authorizations.
          </span>

          <button
            type="submit"
            disabled={saving || candidateExecutives.length === 0}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Synchronize & Save Executives</span>
          </button>
        </div>

      </form>

      {/* Roster Table of All Groups and Currently Elected Executives */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Elected Leadership Roster Across All Groups
            </h3>
            <p className="text-xs text-slate-500">
              Current Presidents, Secretaries, and Treasurers elected for cooperative member groups
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
            {groups.length} Total Groups
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Group Name & Code</th>
                <th className="py-4 px-6">Branch Location</th>
                <th className="py-4 px-6">Elected President</th>
                <th className="py-4 px-6">Elected Secretary</th>
                <th className="py-4 px-6">Elected Treasurer</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {groups.map((g) => (
                <tr key={g._id} className={`hover:bg-teal-50/20 transition-colors ${selectedGroupId === g._id ? 'bg-teal-50/40' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{g.groupName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{g.groupCode} • {g.groupType}</div>
                  </td>

                  <td className="py-4 px-6 text-slate-600">
                    {g.branchId?.branchName || 'Main Branch'}
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-bold text-amber-900">
                      {g.presidentId?.fullName || g.leaderId?.fullName || <span className="text-slate-400 italic">Not Appointed</span>}
                    </div>
                    {(g.presidentId?.memberId || g.leaderId?.memberId) && (
                      <div className="text-[10px] text-slate-400 font-mono">{g.presidentId?.memberId || g.leaderId?.memberId}</div>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-bold text-teal-900">
                      {g.secretaryId?.fullName || <span className="text-slate-400 italic">Not Appointed</span>}
                    </div>
                    {g.secretaryId?.memberId && (
                      <div className="text-[10px] text-slate-400 font-mono">{g.secretaryId?.memberId}</div>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-bold text-emerald-900">
                      {g.treasurerId?.fullName || <span className="text-slate-400 italic">Not Appointed</span>}
                    </div>
                    {g.treasurerId?.memberId && (
                      <div className="text-[10px] text-slate-400 font-mono">{g.treasurerId?.memberId}</div>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleGroupSelect(g._id)}
                        className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200"
                      >
                        Edit / Appoint
                      </button>
                      <Link
                        to={`/groups/profile/${g._id}`}
                        className="p-1 rounded-lg text-slate-400 hover:text-teal-600"
                        title="View Group Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default GroupLeaderPage;
