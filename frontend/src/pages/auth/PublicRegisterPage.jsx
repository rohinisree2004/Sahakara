import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchPublicSettings, 
  registerPublicUser, 
  fetchOrganizations, 
  fetchBranches 
} from '../../services/api';
import { 
  Shield, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  GitBranch, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Loader2, 
  Sparkles,
  ShieldCheck,
  CreditCard,
  MapPin,
  Calendar,
  ChevronLeft
} from 'lucide-react';

const PublicRegisterPage = () => {
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();

  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Organizations & Branches
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    organizationId: '',
    branchId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    dateOfBirth: '1995-01-01',
    idType: 'Aadhaar',
    idNumber: '',
    street: '',
    city: '',
    state: 'Kerala',
    pincode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Fetch Public System Settings
  useEffect(() => {
    const initSettings = async () => {
      try {
        const res = await fetchPublicSettings();
        if (res.data?.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.warn('Error fetching public settings:', err.message);
      } finally {
        setSettingsLoading(false);
      }
    };
    initSettings();
  }, []);

  // 2. Fetch Organizations List
  useEffect(() => {
    const loadOrgs = async () => {
      setLoadingOrgs(true);
      try {
        const res = await fetchOrganizations();
        if (res.data?.success) {
          const orgList = res.data.data || [];
          setOrganizations(orgList);
          if (orgList.length > 0) {
            setFormData(prev => ({ ...prev, organizationId: orgList[0]._id }));
          }
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
      } finally {
        setLoadingOrgs(false);
      }
    };
    loadOrgs();
  }, []);

  // 3. Fetch Branches when Organization changes
  useEffect(() => {
    if (!formData.organizationId) {
      setBranches([]);
      return;
    }
    const loadBranches = async () => {
      try {
        const res = await fetchBranches({ organizationId: formData.organizationId });
        if (res.data?.success) {
          setBranches(res.data.data || []);
        }
      } catch (err) {
        console.error('Error loading branches:', err);
      }
    };
    loadBranches();
  }, [formData.organizationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        organizationId: formData.organizationId,
        branchId: formData.branchId || undefined,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        idType: formData.idType,
        idNumber: formData.idNumber.trim(),
        address: {
          street: formData.street.trim() || 'Main Street',
          city: formData.city.trim() || 'Town',
          state: formData.state.trim() || 'Kerala',
          pincode: formData.pincode.trim() || '686001'
        }
      };

      const res = await registerPublicUser(payload);
      if (res.data && res.data.success) {
        setSuccess(true);
        if (res.data.token && res.data.user) {
          // Store token in localStorage
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // If Public Registration is Disabled by System Policy
  if (settings && settings.allowNewRegistrations === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">Public Registration Disabled</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Online member self-enrollment is currently turned off by system policy. Please visit your nearest cooperative society branch for offline membership onboarding.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Member Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT COLUMN: Value Proposition & Information */}
      <div className="hidden lg:flex lg:w-5/12 bg-white border-r border-slate-200/80 p-12 flex-col justify-between shadow-xs">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                SAHAKARA <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold uppercase tracking-wider">ERP</span>
              </span>
              <p className="text-[11px] text-teal-700 font-bold tracking-wider uppercase">Cooperative Society Management System</p>
            </div>
          </Link>

          <div className="pt-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold font-mono uppercase">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Digital Member Onboarding
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Join Your Local Cooperative Society Today
            </h1>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Create your member account in under 2 minutes. Gain instant access to thrift savings accounts, microloan applications, dividend distributions, and general body assemblies.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {[
              { title: 'Zero Minimum Balance Savings', desc: 'Compliant statutory thrift & recurring savings accounts' },
              { title: 'Affordable Microcredit & Loans', desc: 'Direct access to agricultural, enterprise, and gold loans' },
              { title: 'Democratic Governance', desc: 'Voting rights in Annual General Meetings (AGMs) & group assemblies' }
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-4">
          © {new Date().getFullYear()} Sahakara ERP • Multi-Tenant Cooperative Platform
        </p>
      </div>

      {/* RIGHT COLUMN: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-xl w-full space-y-6">
          
          <div className="flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors uppercase tracking-wider font-mono"
            >
              <ChevronLeft className="w-4 h-4" /> Already a Member? Sign In
            </Link>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Member Self-Registration
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Fill in your details below to enroll in your cooperative society branch.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              <span>Registration successful! Redirecting to your Member Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-5">
            
            {/* Step 1: Society & Branch Selection */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                1. Select Cooperative Society & Branch
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Cooperative Society <span className="text-rose-500">*</span></label>
                  <select
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">-- Choose Society --</option>
                    {organizations.map(org => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Branch</label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Main Branch / Head Office</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.branchName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Personal KYC & Contact Details */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                2. Member Details & Contact
              </h3>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Full Legal Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Anand K. Nair"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Mobile Phone <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Identity & Address Details */}
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                3. Identity Document & Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">ID Document Type</label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Document Number</label>
                  <input
                    type="text"
                    name="idNumber"
                    placeholder="XXXX-XXXX-XXXX"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  name="street"
                  placeholder="Street / House No."
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City / Town"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>
            </div>

            {/* Step 4: Password Security */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                4. Account Security Password
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-[11px] font-bold text-slate-700">Create Password <span className="text-rose-500">*</span></label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Confirm Password <span className="text-rose-500">*</span></label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Enrollment...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Member Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
};

export default PublicRegisterPage;
