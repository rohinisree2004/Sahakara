import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Save, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Building2 
} from 'lucide-react';
import { registerMemberApi, fetchBranchesList, fetchOrganizations } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberRegisterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const [formData, setFormData] = useState({
    organizationId: '',
    fullName: '',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    state: 'Karnataka',
    pincode: '',
    occupation: 'Merchant / Business',
    branchId: '',
    category: 'Regular Member',
    nomineeName: '',
    nomineeRelationship: 'Spouse',
    nomineeShare: '100',
    nomineePhone: '',
    aadhaarNumber: '',
    panNumber: '',
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load organizations for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrgs = async () => {
        try {
          const res = await fetchOrganizations({ limit: 100 });
          if (res.data && res.data.success) {
            setOrganizations(res.data.data);
            if (res.data.data.length > 0) {
              setFormData((prev) => ({ ...prev, organizationId: res.data.data[0]._id }));
            }
          }
        } catch (err) {
          console.warn('Error loading organizations:', err.message);
        }
      };
      loadOrgs();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const branchParams = {};
        if (isSuperAdmin && formData.organizationId) {
          branchParams.organizationId = formData.organizationId;
        }
        const res = await fetchBranchesList(branchParams);
        if (res.data && res.data.success) {
          setBranches(res.data.data);
          if (res.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, branchId: res.data.data[0]._id }));
          } else {
            setFormData((prev) => ({ ...prev, branchId: '' }));
          }
        }
      } catch (err) {
        console.warn('Error loading branches:', err.message);
      } finally {
        setLoadingBranches(false);
      }
    };
    loadBranches();
  }, [formData.organizationId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key]);
      });

      if (profileImageFile) dataPayload.append('profileImage', profileImageFile);
      if (aadhaarFile) dataPayload.append('aadhaarFile', aadhaarFile);
      if (panFile) dataPayload.append('panFile', panFile);

      const res = await registerMemberApi(dataPayload);
      if (res.data && res.data.success) {
        setMsg(`Member '${formData.fullName}' registered successfully! ID: ${res.data.data.memberId || 'Generated'}`);
        setTimeout(() => navigate('/members/list'), 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Member enrollment failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-400" />
            <span>New Member Application & Enrollment</span>
          </h1>
          <p className="text-xs text-slate-400">
            Register new cooperative society member, generate sequential membership ID, and record KYC & Nominee details
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
        
        {/* Profile Photo Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 font-mono text-xl">
            {profilePreview ? (
              <img src={profilePreview} alt="Member Photo" className="w-full h-full object-cover" />
            ) : (
              <span>PHOTO</span>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Member Passport Photo</h4>
            <p className="text-xs text-slate-400">Upload recent passport photograph (JPG, PNG, max 5MB) for member passbook card.</p>
            <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Photo File</span>
              <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Super Admin Organization Picker */}
        {isSuperAdmin && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Target Organization *</label>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold focus:outline-none"
              >
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.code || 'ORG'})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500">Branches will dynamically populate for the selected cooperative society.</p>
          </div>
        )}

        {/* Section 1: Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">1. Personal & Contact Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="e.g. Ganesh Bhatt"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 99000 00007"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="member@coop.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Business / Agriculture"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Membership Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Regular Member">Regular Class 'A' Member</option>
                <option value="Associate Member">Associate Class 'B' Member</option>
                <option value="Nominal Member">Nominal Class 'C' Member</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">2. Residential Address</h3>
          <div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street / Area Location"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 3: Nominee Info */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">3. Nominee Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nominee Full Name</label>
              <input
                type="text"
                name="nomineeName"
                value={formData.nomineeName}
                onChange={handleChange}
                placeholder="e.g. Sunita Bhatt"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
              <input
                type="text"
                name="nomineeRelationship"
                value={formData.nomineeRelationship}
                onChange={handleChange}
                placeholder="Spouse / Son / Daughter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nominee Share %</label>
              <input
                type="number"
                name="nomineeShare"
                value={formData.nomineeShare}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: KYC Documents */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">4. Identity & KYC Numbers</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Aadhaar Card Number</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="12-digit Aadhaar Number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PAN Card Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="10-digit PAN Number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Enroll Society Member</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default MemberRegisterPage;
