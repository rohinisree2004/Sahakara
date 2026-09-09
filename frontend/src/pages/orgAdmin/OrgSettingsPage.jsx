import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sliders, 
  Bell, 
  Globe,
  ShieldCheck,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { fetchOrgSettings, updateOrgSettingsApi } from '../../services/api';

const OrgSettingsPage = () => {
  const [formData, setFormData] = useState({
    financialYear: '2025-2026',
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggle = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
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
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 max-w-4xl mx-auto my-12 shadow-xs">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-700">Loading Organization Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Society Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span>Organization Settings & Preferences</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Configure active financial accounting year, default ledger currency, operational timezone, and automated member notification triggers.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-bold flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center gap-3 shadow-xs animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Accounting Parameters */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-600" />
              <span>Accounting & Financial Defaults</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              General ledger accounting calendar, base currency format, and regional timezone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Financial Year</label>
              <select
                name="financialYear"
                value={formData.financialYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="2024-2025">2024 - 2025</option>
                <option value="2025-2026">2025 - 2026</option>
                <option value="2026-2027">2026 - 2027</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Default Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="INR (₹)">Indian Rupee (INR ₹)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Time Zone</label>
              <select
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="Asia/Kolkata">Asia / Kolkata (IST +5:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Automated Member Notifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-600" />
              <span>Automated Member Notification Triggers</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure automated delivery of transaction receipts, monthly statements, and EMI payment alerts.
            </p>
          </div>

          <div className="space-y-3">
            {/* Toggle 1: Email Receipts */}
            <div 
              onClick={() => handleToggle('emailNotifications')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                formData.emailNotifications 
                  ? 'bg-teal-50/50 border-teal-300 ring-2 ring-teal-500/20' 
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">Email Receipts & Monthly Statements</div>
                <div className="text-[11px] text-slate-500 font-medium">Automatically dispatch deposit & EMI payment receipts via email</div>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Toggle 2: SMS EMI Due Reminders */}
            <div 
              onClick={() => handleToggle('smsNotifications')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                formData.smsNotifications 
                  ? 'bg-teal-50/50 border-teal-300 ring-2 ring-teal-500/20' 
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">SMS EMI Due Reminders</div>
                <div className="text-[11px] text-slate-500 font-medium">Send automated SMS reminders 3 days before loan EMI installment due dates</div>
              </div>
              <input
                type="checkbox"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
