import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { createRoleApi } from '../../services/api';

const MODULES = [
  'Organizations',
  'Branches',
  'Users',
  'Members',
  'Groups',
  'Savings',
  'Loans',
  'Accounting',
  'Meetings',
  'Documents',
  'Reports',
  'Notifications',
  'Settings',
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'export', 'upload', 'download'];

const CreateRolePage = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  
  // Matrix State: { Organizations: ['read', 'update'], Loans: ['create', 'read', 'approve'] }
  const [matrix, setMatrix] = useState({
    Members: ['create', 'read', 'update'],
    Savings: ['create', 'read', 'update'],
    Loans: ['read'],
    Reports: ['read', 'export'],
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleAction = (mod, act) => {
    setMatrix((prev) => {
      const current = prev[mod] || [];
      const updated = current.includes(act)
        ? current.filter((a) => a !== act)
        : [...current, act];
      return { ...prev, [mod]: updated };
    });
  };

  const handleSelectAllModule = (mod) => {
    setMatrix((prev) => {
      const current = prev[mod] || [];
      const isAll = current.length === ACTIONS.length;
      return { ...prev, [mod]: isAll ? [] : [...ACTIONS] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName) {
      setErrorMsg('Please enter custom role name.');
      return;
    }

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      // Format matrix into API payload array
      const permissionsArray = Object.keys(matrix)
        .filter((mod) => matrix[mod] && matrix[mod].length > 0)
        .map((mod) => ({
          module: mod,
          actions: matrix[mod],
        }));

      const res = await createRoleApi({
        roleName,
        description,
        permissions: permissionsArray,
      });

      if (res.data && res.data.success) {
        setMsg(`Custom role '${roleName}' created successfully!`);
        setTimeout(() => navigate('/roles/list'), 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create custom role.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-indigo-400" />
            <span>Create Custom Organization Role & Permission Matrix</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define custom role title, description, and configure granular action permissions across 13 ERP modules
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Role Information Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">1. Role Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Role Name *</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
                placeholder="e.g. Senior Loan Officer / Teller Manager"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe operational responsibilities"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Permission Matrix Grid Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">2. Module Permission Matrix Mapping</h3>
              <p className="text-[11px] text-slate-400">Check actions granted for each operational ERP module</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ERP Module</th>
                  {ACTIONS.map((act) => (
                    <th key={act} className="px-3 py-3 text-center">{act}</th>
                  ))}
                  <th className="px-4 py-3 text-right">Quick Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {MODULES.map((mod) => {
                  const activeActions = matrix[mod] || [];
                  const isAll = activeActions.length === ACTIONS.length;

                  return (
                    <tr key={mod} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        <span>{mod}</span>
                      </td>

                      {ACTIONS.map((act) => {
                        const checked = activeActions.includes(act);
                        return (
                          <td key={act} className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAction(mod, act)}
                              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500 cursor-pointer accent-indigo-500"
                            />
                          </td>
                        );
                      })}

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectAllModule(mod)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-indigo-400 border border-slate-700"
                        >
                          {isAll ? 'Deselect All' : 'Select All'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Custom Role Matrix</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateRolePage;
