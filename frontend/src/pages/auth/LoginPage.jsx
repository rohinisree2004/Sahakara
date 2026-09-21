import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '../../contexts/AuthContext';
import { fetchPublicSettings } from '../../services/api';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  AlertTriangle,
  Loader2, 
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  KeyRound,
  ChevronLeft,
  UserPlus
} from 'lucide-react';

const DEMO_ROLES = [
  { role: 'Super Admin', identifier: 'superadmin', label: 'Super Admin', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { role: 'Organization Admin', identifier: 'ku_admin', label: 'Org Admin', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
  { role: 'Branch Manager', identifier: 'ku_admin', label: 'Branch Manager', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  { role: 'President', identifier: 'ku_president', label: 'Group President', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
  { role: 'Secretary', identifier: 'ku_secretary', label: 'Group Secretary', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
  { role: 'Treasurer', identifier: 'ku_treasurer', label: 'Group Treasurer', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
  { role: 'Employee', identifier: 'ku_employee1', label: 'Teller / Staff', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
  { role: 'Member', identifier: 'ku_member1', label: 'Member', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
];

const LoginPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRoleLabel, setActiveRoleLabel] = useState('Org Admin');
  const [publicSettings, setPublicSettings] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPublicSettings().then(res => {
      if (res.data?.success) {
        setPublicSettings(res.data.data);
      }
    }).catch(console.warn);
  }, []);

  const handleSelectDemoUser = (demo) => {
    setLoginIdentifier(demo.identifier);
    setPassword('password123');
    setActiveRoleLabel(demo.label);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !password.trim()) {
      setError('Please enter both Email/Username and Password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(loginIdentifier.trim(), password.trim(), rememberMe);
      if (res && res.success) {
        const isGroupMemberRole = res.user?.role === 'Member';
        let redirectPath = '';
        if (isGroupMemberRole) {
          redirectPath = '/select-group';
        } else {
          const savedPath = location.state?.from?.pathname;
          redirectPath = (savedPath && savedPath !== '/select-group' && savedPath !== '/login')
            ? savedPath
            : getDashboardRoute(res.user?.role);
        }
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      if (err.maintenanceMode) {
        setError('⚠️ System Maintenance in Progress: Non-administrator logins are temporarily restricted. Please check back shortly.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Lighting Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT COLUMN: Visual Brand & Value Proposition (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white border-r border-slate-200/80 p-12 flex-col justify-between shadow-xs">
        
        {/* Top Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                SAHAKARA <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold uppercase tracking-wider">ERP</span>
              </span>
              <p className="text-[11px] text-teal-700 font-bold tracking-wider uppercase">Cooperative Society Management System</p>
            </div>
          </Link>
        </div>

        {/* Center Hero Info */}
        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold font-mono uppercase">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Multi-Tenant Cooperative Platform
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Next-Generation Core Banking for Cooperatives
          </h1>

          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Empowering primary credit cooperative societies, SHGs, and federation banks with comprehensive loan ledgers, savings passbooks, and statutory AGM governance.
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Audit Compliant</p>
                <p className="text-[10px] text-slate-500">Full general ledger parity</p>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Multi-Branch</p>
                <p className="text-[10px] text-slate-500">Society-level isolation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} Sahakara ERP • Secured with 256-bit SSL Encryption</p>
        </div>

      </div>

      {/* RIGHT COLUMN: Sign In Form & Self-Registration Link */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="max-w-md w-full space-y-6">
          
          {/* Top Mobile Brand */}
          <div className="lg:hidden text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto shadow-md shadow-teal-600/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">SAHAKARA ERP</h2>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your credentials or click any demo role below for 1-click access.
            </p>
          </div>

          {/* Maintenance Mode Notice if active */}
          {publicSettings?.maintenanceMode && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-950 text-xs space-y-1">
              <div className="flex items-center gap-2 font-extrabold text-amber-900 uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Scheduled Maintenance Active</span>
              </div>
              <p className="font-medium text-slate-700">
                Non-administrator access is temporarily restricted. Only Super Admins can log in at this time.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Roles Grid */}
          <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DEMO_ROLES.map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => handleSelectDemoUser(demo)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all text-center truncate ${
                    activeRoleLabel === demo.label
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : `${demo.badgeBg} hover:opacity-80`
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/80 shadow-xs space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. superadmin or ku_admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-teal-700 hover:text-teal-800 font-bold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Sahakara ERP</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Public Self-Registration Card if enabled */}
          {publicSettings?.allowNewRegistrations !== false && (
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">New to the Society?</p>
                  <p className="text-[11px] text-slate-500 font-medium">Register online for member onboarding</p>
                </div>
              </div>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 shrink-0"
              >
                <span>Self-Register</span>
                <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
