import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Users,
  ArrowLeft,
  Building2,
  GitBranch,
  Crown,
  FileSpreadsheet,
  Coins,
  Search,
  Sparkles,
  Check
} from 'lucide-react';
import { 
  createGroupApi, 
  fetchBranchesList, 
  fetchMembersList, 
  fetchOrganizations 
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [formData, setFormData] = useState({
    groupName: '',
    groupType: 'Self-Help Group (SHG)',
    description: '',
    branchId: '',
    presidentId: '',
    secretaryId: '',
    treasurerId: '',
    leaderId: '',
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  // Load Initial Societies, Branches, and Members
  useEffect(() => {
    const init = async () => {
      try {
        const branchParams = isBranchScoped && userBranchId ? { branchId: userBranchId } : {};
        const promises = [fetchBranchesList(branchParams), fetchMembersList({ limit: 100 })];
        if (isSuperAdmin) {
          promises.push(fetchOrganizations());
        }

        const results = await Promise.all(promises);
        const bRes = results[0];
        const mRes = results[1];
        const oRes = isSuperAdmin ? results[2] : null;

        if (oRes && oRes.data && oRes.data.success) {
          const oList = oRes.data.data || [];
          setOrganizations(oList);
          if (oList.length > 0) setSelectedOrgId(oList[0]._id);
        }

        if (bRes.data && bRes.data.success) {
          const bList = bRes.data.data || [];
          setBranches(bList);
          if (isBranchScoped && userBranchId) {
            setFormData((prev) => ({ ...prev, branchId: userBranchId }));
          } else if (bList.length > 0) {
            setFormData((prev) => ({ ...prev, branchId: bList[0]._id }));
          }
        }

        if (mRes.data && mRes.data.success) {
          const mList = mRes.data.data || [];
          setMembers(mList);
        }
      } catch (err) {
        console.warn('Error loading group creation dependencies:', err.message);
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, [isSuperAdmin, isBranchScoped, userBranchId]);

  // Filter branches and members when organization changes (for Super Admin)
  useEffect(() => {
    if (selectedOrgId && isSuperAdmin) {
      const loadOrgData = async () => {
        try {
          const [bRes, mRes] = await Promise.all([
            fetchBranchesList({ organizationId: selectedOrgId }),
            fetchMembersList({ organizationId: selectedOrgId, limit: 150 })
          ]);
          if (bRes.data && bRes.data.success) {
            const bList = bRes.data.data || [];
            setBranches(bList);
            if (bList.length > 0) {
              setFormData((prev) => ({ ...prev, branchId: bList[0]._id }));
            }
          }
          if (mRes.data && mRes.data.success) {
            setMembers(mRes.data.data || []);
            setSelectedMemberIds([]);
            setFormData(f => ({ ...f, presidentId: '', secretaryId: '', treasurerId: '', leaderId: '' }));
          }
        } catch (err) {
          console.warn('Error loading org data:', err.message);
        }
      };
      loadOrgData();
    }
  }, [selectedOrgId, isSuperAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberCheckboxToggle = (mId) => {
    setSelectedMemberIds((prev) => {
      const isSelected = prev.includes(mId);
      const next = isSelected ? prev.filter((id) => id !== mId) : [...prev, mId];
      
      // Auto assign first 3 selected members to President, Secretary, Treasurer if not assigned
      if (!isSelected) {
        if (!formData.presidentId) setFormData(f => ({ ...f, presidentId: mId, leaderId: mId }));
        else if (!formData.secretaryId && mId !== formData.presidentId) setFormData(f => ({ ...f, secretaryId: mId }));
        else if (!formData.treasurerId && mId !== formData.presidentId && mId !== formData.secretaryId) setFormData(f => ({ ...f, treasurerId: mId }));
      }
      return next;
    });
  };

  const handleSelectAllMembers = () => {
    const allFilteredIds = filteredMembers.map(m => m._id);
    setSelectedMemberIds(allFilteredIds);
    if (allFilteredIds.length > 0) {
      setFormData(f => ({
        ...f,
        presidentId: f.presidentId || allFilteredIds[0],
        leaderId: f.leaderId || allFilteredIds[0],
        secretaryId: f.secretaryId || (allFilteredIds[1] || allFilteredIds[0]),
        treasurerId: f.treasurerId || (allFilteredIds[2] || allFilteredIds[0]),
      }));
    }
  };

  const handleClearMemberSelection = () => {
    setSelectedMemberIds([]);
    setFormData(f => ({ ...f, presidentId: '', secretaryId: '', treasurerId: '', leaderId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.groupName.trim()) {
      setErrorMsg('Please enter a valid group name.');
      return;
    }

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        organizationId: isSuperAdmin && selectedOrgId ? selectedOrgId : undefined,
        memberIds: selectedMemberIds,
        leaderId: formData.presidentId || formData.leaderId || (selectedMemberIds[0] || null),
      };

      const res = await createGroupApi(payload);

      if (res.data && res.data.success) {
        const created = res.data.data;
        setMsg(`Group '${formData.groupName}' created successfully with code '${created.groupCode || 'GRP'}'!`);
        setTimeout(() => navigate(`/groups/profile/${created._id}`), 1200);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to register member group.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const term = memberSearch.toLowerCase();
    return (
      (m.fullName || '').toLowerCase().includes(term) ||
      (m.memberId || '').toLowerCase().includes(term) ||
      (m.phone || '').includes(term)
    );
  });

  // Selected member objects for executive dropdowns (strictly from members selected for this group)
  const chosenMembersList = members.filter((m) => selectedMemberIds.includes(m._id));
  const availableForExecutive = chosenMembersList;

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            to="/groups/list" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Groups Registry</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <PlusCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Create New SHG / JLG Member Group
              </h1>
              <p className="text-xs text-slate-500">
                Register a new member group, assign to branch, allocate members, and elect office-bearers (President, Secretary, Treasurer)
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/groups/dashboard"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Group Dashboard</span>
        </Link>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{msg}</span>
          </div>
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

      {/* Master Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Society & Branch Placement */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Society & Branch Allocation
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {isSuperAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cooperative Society *
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned Operational Branch *
              </label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                disabled={isBranchScoped}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 disabled:opacity-80"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.branchName} ({b.branchCode}) {b.district ? `• ${b.district}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Group Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Group Details & Classification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Group Name *
              </label>
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
                placeholder="e.g. Mahila Pragati SHG"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Group Classification / Model *
              </label>
              <select
                name="groupType"
                value={formData.groupType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
              >
                <option value="Self-Help Group (SHG)">Self-Help Group (SHG)</option>
                <option value="Joint Liability Group (JLG)">Joint Liability Group (JLG)</option>
                <option value="Farmers Group">Farmers Collective (FCG)</option>
                <option value="Women Micro-Enterprise Group">Women Micro-Enterprise Group</option>
                <option value="Savings Group">Savings Collective</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Group Description & Meeting Schedule
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Weekly Wednesday thrift collection meetings at Ward 4 Community Center"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Section 3: Allocate Member Roster Multi-Select */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Select Group Members
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Check society members to include in this group roster (1 to 4 groups allowed per member)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                {selectedMemberIds.length} Selected
              </span>
              <button
                type="button"
                onClick={handleSelectAllMembers}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 px-2 py-1"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearMemberSelection}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Filter for Members */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search member by full name, ID, or phone number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Member Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
            {filteredMembers.map((m) => {
              const checked = selectedMemberIds.includes(m._id);
              return (
                <label 
                  key={m._id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all ${
                    checked 
                      ? 'bg-teal-50/70 border-teal-400 shadow-xs' 
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleMemberCheckboxToggle(m._id)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 shrink-0"
                  />
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {m.fullName?.charAt(0) || 'M'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs truncate">{m.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{m.memberId || 'MEM'} • {m.phone || 'N/A'}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 4: Elect Group Executives (President, Secretary, Treasurer) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Elect Group Leadership (President, Secretary & Treasurer)
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Elected from members of this group
            </span>
          </div>

          {chosenMembersList.length === 0 ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Select Group Members First</span>
              </div>
              <p className="text-slate-600">
                Group President, Secretary, and Treasurer must be chosen from the members enrolled in this group. Please check member cards in <strong>Section 3</strong> above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* President */}
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Group President *</span>
              </label>
              <select
                name="presidentId"
                value={formData.presidentId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose President --</option>
                {availableForExecutive.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName} ({m.memberId || 'MEM'})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-amber-800 font-medium">Head of group affairs & operations</p>
            </div>

            {/* Secretary */}
            <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-2">
              <label className="block text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                <span>Group Secretary *</span>
              </label>
              <select
                name="secretaryId"
                value={formData.secretaryId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-white border border-teal-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500"
              >
                <option value="">-- Choose Secretary --</option>
                {availableForExecutive.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName} ({m.memberId || 'MEM'})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-teal-800 font-medium">Meeting minutes & attendance records</p>
            </div>

            {/* Treasurer */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-2">
              <label className="block text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Group Treasurer *</span>
              </label>
              <select
                name="treasurerId"
                value={formData.treasurerId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Treasurer --</option>
                {availableForExecutive.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName} ({m.memberId || 'MEM'})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-emerald-800 font-medium">Savings collection & loan registers</p>
            </div>
          </div>
        )}
      </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/groups/list"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Register & Initialize Group</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateGroupPage;
