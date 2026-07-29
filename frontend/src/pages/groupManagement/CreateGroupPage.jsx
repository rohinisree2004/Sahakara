import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { createGroupApi, fetchBranchesList, fetchMembersList } from '../../services/api';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [formData, setFormData] = useState({
    groupName: '',
    groupType: 'Self-Help Group (SHG)',
    description: '',
    branchId: '',
    leaderId: '',
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [bRes, mRes] = await Promise.all([fetchBranchesList(), fetchMembersList()]);
        if (bRes.data && bRes.data.success) {
          setBranches(bRes.data.data);
          if (bRes.data.data.length > 0) setFormData((prev) => ({ ...prev, branchId: bRes.data.data[0]._id }));
        }
        if (mRes.data && mRes.data.success) {
          setMembers(mRes.data.data);
          if (mRes.data.data.length > 0) setFormData((prev) => ({ ...prev, leaderId: mRes.data.data[0]._id }));
        }
      } catch (err) {
        console.warn('Error loading group init data:', err.message);
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberCheckboxToggle = (mId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.groupName) {
      setErrorMsg('Please enter group name.');
      return;
    }

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await createGroupApi({
        ...formData,
        memberIds: selectedMemberIds,
      });

      if (res.data && res.data.success) {
        setMsg(`Group '${formData.groupName}' created successfully! Code: ${res.data.data.groupCode || 'Generated'}`);
        setTimeout(() => navigate('/groups/list'), 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create group.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-teal-400" />
            <span>Create New SHG / JLG Member Group</span>
          </h1>
          <p className="text-xs text-slate-400">
            Register new Self-Help Group or Joint Liability Group, assign designated leader, and allocate initial member roster
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">1. Group Details & Classification</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Group Name *</label>
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
                placeholder="e.g. Mahila Pragati SHG"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Group Type *</label>
              <select
                name="groupType"
                value={formData.groupType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Self-Help Group (SHG)">Self-Help Group (SHG)</option>
                <option value="Joint Liability Group (JLG)">Joint Liability Group (JLG)</option>
                <option value="Farmers Group">Farmers Group</option>
                <option value="Savings Group">Savings Group</option>
                <option value="Loan Group">Loan Group</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Branch *</label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Designated Group Leader *</label>
              <select
                name="leaderId"
                value={formData.leaderId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.fullName} ({m.memberId})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Group Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe group purpose, village location, or meeting schedule"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Member Roster Multi Select */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">2. Select Initial Group Members</h3>
            <span className="text-xs font-mono text-teal-400 font-bold">{selectedMemberIds.length} Selected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 rounded-2xl bg-slate-900 border border-slate-800">
            {members.map((m) => {
              const checked = selectedMemberIds.includes(m._id);
              return (
                <label key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer border border-slate-800/80 text-xs">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleMemberCheckboxToggle(m._id)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500 accent-teal-500"
                  />
                  <div>
                    <div className="font-bold text-white">{m.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{m.memberId} • {m.phone}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Register Member Group</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateGroupPage;
