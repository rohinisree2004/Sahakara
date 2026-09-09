import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2, 
  Building2, 
  ShieldCheck, 
  Users, 
  FileText, 
  Hash, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { fetchBranchProfile, updateBranchApi } from '../../services/api';

const BranchProfilePage = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    state: 'Kerala',
    workingHours: '9:00 AM - 5:00 PM (Mon-Sat)',
    status: 'Active',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetchBranchProfile(id);
        if (res.data && res.data.success && res.data.data) {
          const b = res.data.data;
          setBranch(b);
          setFormData({
            branchName: b.branchName || '',
            branchCode: b.branchCode || '',
            phone: b.phone || '',
            email: b.email || '',
            address: b.address || '',
            district: b.district || '',
            state: b.state || 'Kerala',
            workingHours: b.workingHours || '9:00 AM - 5:00 PM (Mon-Sat)',
            status: b.status || 'Active',
          });
        }
      } catch (err) {
        console.warn('Error loading branch profile:', err.message);
        setErrorMsg('Unable to load branch profile from server.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadProfile();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await updateBranchApi(id, formData);
      if (res.data && res.data.success) {
        setMsg('Branch profile and operational details updated successfully.');
        if (res.data.data) {
          setBranch(res.data.data);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update branch profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const activeBranchName = formData.branchName || branch?.branchName || 'Branch Profile';
  const activeBranchCode = formData.branchCode || branch?.branchCode || 'BRANCH';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/branches/dashboard" 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600" />
          <span>Back to Branch Overview</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            formData.status === 'Active'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {formData.status} Operational
          </span>
        </div>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="font-semibold">{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 font-bold shadow-xs">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {activeBranchName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold">
                  {activeBranchCode}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-1 font-medium">
                {branch?.organizationId?.name && (
                  <span>
                    Cooperative: <strong className="text-slate-800">{branch.organizationId.name}</strong>
                  </span>
                )}
                <span>•</span>
                <span>
                  Manager: <strong className="text-slate-800">{branch?.managerName || 'Unassigned'}</strong>
                </span>
                <span>•</span>
                <span>
                  Created: {new Date(branch?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Branch Identifier</div>
          <div className="text-sm font-black text-slate-900 font-mono">{activeBranchCode}</div>
          <div className="text-[11px] text-teal-800 font-semibold">{branch?.organizationId?.code || 'COOP-ERP'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location & District</div>
          <div className="text-sm font-black text-slate-900">{formData.district || 'Not Configured'}</div>
          <div className="text-[11px] text-slate-500 font-semibold">{formData.state || 'Kerala'}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Manager</div>
          <div className="text-sm font-black text-slate-900">{branch?.managerName || 'Unassigned'}</div>
          <div className="text-[11px] text-teal-800 font-semibold">Local Supervision</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Working Schedule</div>
          <div className="text-sm font-black text-slate-900 truncate">{formData.workingHours}</div>
          <div className="text-[11px] text-slate-500 font-semibold">Counter Timings</div>
        </div>
      </div>

      {/* Edit Profile Form in Executive Teal & White */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
        
        {/* Section 1: Core Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Core Identity & Operating Schedule
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Branch Name *
              </label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                required
                placeholder="e.g. Kottayam Main Branch"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Working Hours & Schedule
              </label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="e.g. 9:00 AM - 5:00 PM (Mon-Sat)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Branch Code (System Key)
              </label>
              <input
                type="text"
                value={formData.branchCode}
                disabled
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-500 cursor-not-allowed uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Branch Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              >
                <option value="Active">Active (Operational)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Channels */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Phone className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Official Communication Channels
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Branch Official Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98470 12345"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Branch Official Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. branch.kottayam@sahakara.org"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Geographic Coordinates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Jurisdiction & Address Coordinates
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Physical Street Address Location
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Nedumkuzhi, NH-183 Main Road"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                District Jurisdiction
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Kottayam"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State Jurisdiction
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Kerala"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Updated configuration takes effect immediately across teller counters and member records.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving Profile...' : 'Save Branch Profile'}</span>
            </button>
          </div>
        </div>

      </form>

      {/* Connected Sub-Desk Links */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quick Access Branch Sub-Desks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/branches/employees"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Branch Personnel</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>

          <Link
            to="/branches/members"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Branch Members</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>

          <Link
            to="/branches/reports"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-soft-teal transition-all group flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Operational Reports</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default BranchProfilePage;
