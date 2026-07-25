import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Phone, 
  Shield, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { fetchSystemSettings, updateSystemSettings } from '../../services/api';

const SystemSettingsPage = () => {
  const [formData, setFormData] = useState({
    appName: 'SAHAKARA ERP',
    tagline: 'A Multi-Organization Cooperative Society ERP System',
    supportEmail: 'support@sahakaraerp.org',
    supportPhone: '+91 (080) 2345-6789',
    maintenanceMode: false,
    allowNewRegistrations: true,
    sessionTimeoutMinutes: 60,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetchSystemSettings();
        if (res.data && res.data.success) {
          setFormData((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.warn('Error loading settings:', err.message);
      } fontally: {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await updateSystemSettings(formData);
      if (res.data && res.data.success) {
        setMsg('Master ERP system settings saved successfully!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>Master ERP System Settings</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure platform branding, helpdesk contacts, maintenance mode, and registration policies
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
        
        {/* Section 1: Platform Branding */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Platform Branding & Identification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ERP Application Name</label>
              <input
                type="text"
                name="appName"
                value={formData.appName}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Session Timeout (Minutes)</label>
              <input
                type="number"
                name="sessionTimeoutMinutes"
                value={formData.sessionTimeoutMinutes}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 2: Contact Info */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Master Helpdesk & Support Contacts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Phone</label>
              <input
                type="text"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: System Toggles */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ToggleRight className="w-4 h-4 text-amber-400" />
            <span>Platform Policy & Registration Toggles</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Allow Public Society Registrations</div>
                <div className="text-[11px] text-slate-400">Enables the registration inquiry form on the Landing Website</div>
              </div>
              <input
                type="checkbox"
                name="allowNewRegistrations"
                checked={formData.allowNewRegistrations}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">System Maintenance Mode</div>
                <div className="text-[11px] text-slate-400">Temporarily restricts tenant logins to Super Admin only</div>
              </div>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save System Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default SystemSettingsPage;
