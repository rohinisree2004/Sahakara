import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sliders, 
  Bell, 
  Globe 
} from 'lucide-react';
import { fetchOrgSettings, updateOrgSettingsApi } from '../../services/api';

const OrgSettingsPage = () => {
  const [formData, setFormData] = useState({
    financialYear: '2024-2025',
    currency: 'INR (₹)',
    timeZone: 'Asia/Kolkata',
    emailNotifications: true,
    smsNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetchOrgSettings();
        if (res.data && res.data.success) {
          setFormData((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.warn('Using default org settings:', err.message);
      } finally {
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
      const res = await updateOrgSettingsApi(formData);
      if (res.data && res.data.success) {
        setMsg('Organization preferences saved successfully!');
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
            <span>Organization Settings & Preferences</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure active financial accounting year, default currency, time zone, and automated SMS/Email alert triggers
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
        
        {/* Accounting Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Accounting & Financial Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Financial Year</label>
              <select
                name="financialYear"
                value={formData.financialYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="2024-2025">2024 - 2025</option>
                <option value="2025-2026">2025 - 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="INR (₹)">Indian Rupee (INR ₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time Zone</label>
              <select
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Asia/Kolkata">Asia / Kolkata (IST +5:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Member Notification Preferences</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Email Receipts & Monthly Statements</div>
                <div className="text-[11px] text-slate-400 font-normal">Automatically dispatch deposit & EMI receipts via email</div>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">SMS EMI Due Reminders</div>
                <div className="text-[11px] text-slate-400 font-normal">Send automated SMS reminders 3 days before loan EMI due dates</div>
              </div>
              <input
                type="checkbox"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Organization Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default OrgSettingsPage;
