import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2, 
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  Mail
} from 'lucide-react';
import { fetchUserDetails, updateUserApi } from '../../services/api';

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'Male',
    address: '',
    role: 'Employee',
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetchUserDetails(id || '65e000000000000000000006');
        if (res.data && res.data.success && res.data.data) {
          const u = res.data.data;
          setUser(u);
          setFormData({
            name: u.name || '',
            phone: u.phone || '',
            gender: u.gender || 'Male',
            address: u.address || '',
            role: u.role || 'Employee',
          });
        }
      } catch (err) {
        console.warn('Error loading user profile:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await updateUserApi(user?._id || id, formData);
      if (res.data && res.data.success) {
        setMsg('User profile updated successfully.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-teal-100/80 text-center space-y-3 max-w-4xl mx-auto my-12 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
        <p className="text-xs font-bold text-slate-700">Loading user profile records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Link
            to="/users/list"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors uppercase tracking-wider font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Back to User Directory
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>User Account Profile</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Update personal information, contact numbers, residential address, and system role assignments.
          </p>
        </div>
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

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-6">
        
        {/* User Identity Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
            {formData.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{formData.name || 'User Profile'}</h3>
            <p className="text-xs text-slate-500 font-mono">@{user?.username || 'user'} • {user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Legal Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Employee">Employee / Teller</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="President">Group President</option>
              <option value="Secretary">Group Secretary</option>
              <option value="Treasurer">Group Treasurer</option>
              <option value="Member">Member</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address / Town"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default UserProfilePage;
