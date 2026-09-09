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
  ToggleRight,
  Sparkles,
  AlertTriangle,
  UserPlus,
  Lock,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle,
  HelpCircle
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
      const res = await updateSystemSettings(formData);
      if (res.data && res.data.success) {
        setMsg('Master ERP platform policy and system settings saved successfully!');
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
        <p className="text-xs font-bold text-slate-700">Loading Master ERP System Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Master ERP Control Plane
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span>Master ERP System Settings</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Control platform-wide policy toggles, global maintenance mode, public member self-registration, and branding parameters.
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

      {/* Active Maintenance Warning Preview if toggled */}
      {formData.maintenanceMode && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500 text-amber-950 text-xs space-y-2">
          <div className="flex items-center gap-2 font-extrabold text-amber-900 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>⚠️ Maintenance Mode Flag Active</span>
          </div>
          <p className="font-medium text-slate-700 leading-relaxed">
            Non-administrator users (Members, Branch Managers, Society Officers) will receive a 503 Maintenance Notice upon login or API access. Only <strong>Super Administrators</strong> can bypass maintenance to conduct database or software updates.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: PLATFORM POLICY & REGISTRATION TOGGLES */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ToggleRight className="w-5 h-5 text-teal-600" />
              <span>Platform Policy & Registration Toggles</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live operational flags governing portal availability and new user onboarding.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Toggle 1: Maintenance Mode */}
            <div 
              onClick={() => handleToggle('maintenanceMode')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                formData.maintenanceMode 
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20' 
                  : 'bg-slate-50 border-slate-200/80 hover:border-teal-200 hover:bg-teal-50/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">System Maintenance Mode</span>
                  {formData.maintenanceMode ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 font-mono">
                      ACTIVE (RESTRICTED)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                      ONLINE (NORMAL)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Temporarily lock non-admin user logins across all societies for system upgrades, migrations, or database maintenance.
                </p>
              </div>

              <div className="shrink-0">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onChange={handleChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Toggle 2: Public Self-Registration */}
            <div 
              onClick={() => handleToggle('allowNewRegistrations')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                formData.allowNewRegistrations 
                  ? 'bg-teal-50/50 border-teal-300 ring-2 ring-teal-500/20' 
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Public Self-Registration</span>
                  {formData.allowNewRegistrations ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200 font-mono">
                      ENABLED (OPEN ENROLLMENT)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-mono">
                      DISABLED (INVITE ONLY)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Permit prospective members to self-register online at <code>/register</code>, select their cooperative society & branch, and submit digital enrollment KYC.
                </p>
              </div>

              <div className="shrink-0">
                <input
                  type="checkbox"
                  name="allowNewRegistrations"
                  checked={formData.allowNewRegistrations}
                  onChange={handleChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: PLATFORM BRANDING & SESSION TIMEOUT */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              <span>Platform Branding & Security Session</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ERP Application title, subtitle tagline, and session expiration timeout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ERP Application Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="appName"
                value={formData.appName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Session Timeout (Minutes) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="sessionTimeoutMinutes"
                value={formData.sessionTimeoutMinutes}
                onChange={handleChange}
                min={5}
                max={1440}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Platform Tagline / Description
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* SECTION 3: HELPDESK & SUPPORT CONTACTS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" />
              <span>Master Helpdesk & Support Contacts</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Contact channels displayed to members and users on the login, grievance, and error screens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Support Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Support Helpline Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying Platform Policy...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Platform Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default SystemSettingsPage;
