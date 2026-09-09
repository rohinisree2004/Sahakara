import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, 
  Save, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Building2,
  GitBranch,
  ArrowLeft,
  Users,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Sparkles,
  CreditCard,
  HeartHandshake,
  Lock,
  Key,
  Check
} from 'lucide-react';
import { registerMemberApi, fetchBranchesList, fetchOrganizations, fetchGroupsList } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberRegisterPage = () => {
  const navigate = useNavigate();
  const { user, activeGroup } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isPresident = user?.role === 'President' || activeGroup?.role === 'President';

  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState(activeGroup?._id ? [activeGroup._id] : []);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [formData, setFormData] = useState({
    organizationId: '',
    fullName: '',
    username: '',
    password: 'password123',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    state: 'Kerala',
    pincode: '',
    occupation: 'Self-Employed / Business',
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

  const isBranchScoped = ['Branch Manager', 'Employee'].includes(user?.role);
  const userBranchId = user?.branchId?._id || user?.branchId || '';

  // Load branches dynamically for selected organization
  useEffect(() => {
    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const branchParams = {};
        if (isBranchScoped && userBranchId) {
          branchParams.branchId = userBranchId;
        } else if (isSuperAdmin && formData.organizationId) {
          branchParams.organizationId = formData.organizationId;
        }
        const res = await fetchBranchesList(branchParams);
        if (res.data && res.data.success) {
          const bList = res.data.data || [];
          setBranches(bList);
          if (isBranchScoped && userBranchId) {
            setFormData((prev) => ({ ...prev, branchId: userBranchId }));
          } else if (bList.length > 0) {
            setFormData((prev) => ({ ...prev, branchId: bList[0]._id }));
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
  }, [formData.organizationId, isBranchScoped, userBranchId]);

  // Load groups dynamically for selected branch & organization
  useEffect(() => {
    const loadGroups = async () => {
      if (!formData.branchId) {
        setAvailableGroups([]);
        setSelectedGroupIds([]);
        return;
      }
      setLoadingGroups(true);
      try {
        const groupParams = { branchId: formData.branchId };
        if (formData.organizationId) {
          groupParams.organizationId = formData.organizationId;
        }
        const res = await fetchGroupsList(groupParams);
        if (res.data && res.data.success) {
          const groups = res.data.data || [];
          setAvailableGroups(groups);
          // Default select the first group if available
          if (groups.length > 0) {
            setSelectedGroupIds([groups[0]._id]);
          } else {
            setSelectedGroupIds([]);
          }
        }
      } catch (err) {
        console.warn('Error loading groups:', err.message);
      } finally {
        setLoadingGroups(false);
      }
    };
    loadGroups();
  }, [formData.branchId, formData.organizationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto suggest username when full name changes and username hasn't been manually set
      if (name === 'fullName' && (!prev.username || prev.username.startsWith('mem_'))) {
        const clean = value.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean) next.username = `mem_${clean}`;
      }
      return next;
    });
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroupIds((prev) => {
      if (prev.includes(groupId)) {
        if (prev.length === 1) {
          return prev; // Keep at least one group selected
        }
        return prev.filter((id) => id !== groupId);
      } else {
        if (prev.length >= 4) {
          setErrorMsg('A member can belong to a maximum of 4 groups.');
          return prev;
        }
        setErrorMsg('');
        return [...prev, groupId];
      }
    });
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
    if (selectedGroupIds.length === 0 && availableGroups.length > 0) {
      setErrorMsg('Please select at least 1 group for this member (max 4 groups).');
      return;
    }

    setSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key]);
      });

      // Append group affiliations
      selectedGroupIds.forEach((gid) => {
        dataPayload.append('groupIds[]', gid);
      });
      if (selectedGroupIds.length > 0) {
        dataPayload.append('groupId', selectedGroupIds[0]);
      }

      if (profileImageFile) dataPayload.append('profileImage', profileImageFile);
      if (aadhaarFile) dataPayload.append('aadhaarFile', aadhaarFile);
      if (panFile) dataPayload.append('panFile', panFile);

      const res = await registerMemberApi(dataPayload);
      if (res.data && res.data.success) {
        setMsg('Member successfully registered and enrolled into group(s)!');
        setTimeout(() => {
          if (isPresident) {
            navigate('/executive/dashboard');
          } else {
            navigate('/branches/members');
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Member enrollment failed:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to enroll member.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link 
          to={isPresident ? "/executive/dashboard" : "/branches/members"} 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600" />
          <span>{isPresident ? 'Back to President Desk' : 'Back to Members Registry'}</span>
        </Link>
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

      {/* Master Scope Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-soft-teal space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Cooperative Member Application & Enrollment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              New Member Registration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Onboard a cooperative member into 1 to 4 groups under a branch, provision portal login credentials, and record KYC.
            </p>
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Photo Upload Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-teal-50 border-2 border-dashed border-teal-300 flex items-center justify-center text-teal-700 overflow-hidden shrink-0 font-bold shadow-xs">
              {profilePreview ? (
                <img src={profilePreview} alt="Member Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <Users className="w-8 h-8 mx-auto text-teal-600 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-teal-800">Photo</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-black text-slate-900">Member Passport Photograph</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Upload a recent portrait photograph (JPG, PNG, max 5MB) for member ID card and passbook printing.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-xs font-bold text-teal-800 border border-teal-200 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>Choose Photo File</span>
                <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Super Admin Organization & Branch Assignment Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              1. Cooperative Society & Branch Placement
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {isSuperAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Cooperative Society *
                </label>
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.code || 'ORG'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Branches will dynamically populate for this society.</p>
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
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all disabled:opacity-80"
              >
                {branches.length === 0 ? (
                  <option value="">No branches registered for this society</option>
                ) : (
                  branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Membership Category Classification *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              >
                <option value="Regular Member">Regular Class 'A' Member (Voting Rights & Savings)</option>
                <option value="Associate Member">Associate Class 'B' Member (Nominee & Credit Access)</option>
                <option value="Nominal Member">Nominal Class 'C' Member (Auxiliary Facility)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Group Enrollment Card (1 to 4 Groups Max) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                2. Branch Group Enrollment (1 to 4 Groups)
              </h3>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900">
              <span>{selectedGroupIds.length} of 4 Groups Selected</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Members belong to branch-level groups (SHGs, JLGs, Farmers collectives). A member can belong to a <strong>minimum of 1</strong> and a <strong>maximum of 4 groups</strong>. The first chosen group serves as their primary affiliation.
          </p>

          {loadingGroups ? (
            <div className="flex items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <span className="ml-2 text-xs font-bold text-slate-500">Loading branch groups...</span>
            </div>
          ) : availableGroups.length === 0 ? (
            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 text-center space-y-2">
              <Users className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="text-xs font-bold text-amber-900">No active groups found under the selected branch.</p>
              <p className="text-[11px] text-amber-700">Please create groups in Group Management first or select another branch.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableGroups.map((grp) => {
                const isSelected = selectedGroupIds.includes(grp._id);
                const isPrimary = selectedGroupIds[0] === grp._id;

                return (
                  <div
                    key={grp._id}
                    onClick={() => toggleGroupSelection(grp._id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative select-none ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 shadow-sm shadow-teal-500/10'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{grp.groupName}</span>
                          {isPrimary && (
                            <span className="px-1.5 py-0.2 rounded bg-teal-600 text-white text-[9px] font-black uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-teal-800 font-mono font-semibold">
                          {grp.groupCode} • {grp.groupType || 'SHG'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {grp.totalMembers || 0} active members
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Member Portal Login Credentials Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Key className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              3. Member Portal Access Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Portal Login Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="mem_username"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Unique login handle for the member mobile & web passbook.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Initial Account Password *
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="password123"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default temporary password. Member can reset on first login.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Personal & Demographic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              4. Personal & Demographic Particulars
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Legal Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="e.g. Ganesh Bhatt"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Contact Phone *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 98470 12345"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Occupation / Trade
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Agriculture / Merchant"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="member.name@example.com"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
            />
          </div>
        </div>

        {/* Section 5: Residential Address */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              5. Residential Jurisdiction Address
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Street / House / Area Location *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="e.g. House No. 42, Nedumkuzhi Main Road"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                District *
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                placeholder="e.g. Kottayam"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 686001"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Nominee Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartHandshake className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              6. Beneficiary & Nominee Designation
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nominee Full Legal Name
              </label>
              <input
                type="text"
                name="nomineeName"
                value={formData.nomineeName}
                onChange={handleChange}
                placeholder="e.g. Sunita Bhatt"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Relationship with Member
              </label>
              <input
                type="text"
                name="nomineeRelationship"
                value={formData.nomineeRelationship}
                onChange={handleChange}
                placeholder="e.g. Spouse / Daughter / Son"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nominee Benefit Share %
              </label>
              <input
                type="number"
                name="nomineeShare"
                value={formData.nomineeShare}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 7: Identity & KYC Documents */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              7. KYC Identification & Statutory Numbers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Aadhaar Number (12-Digit)
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="XXXX XXXX XXXX"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Income Tax PAN Card Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 uppercase transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions Toolbar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Enrolling a member creates an active login user, generates a unique ID, and assigns group memberships.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              to="/branches/members"
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Enrolling Member...' : 'Enroll Society Member'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default MemberRegisterPage;
