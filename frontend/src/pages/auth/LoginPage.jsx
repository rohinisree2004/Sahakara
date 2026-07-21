import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  KeyRound,
  ChevronLeft
} from 'lucide-react';

const DEMO_ROLES = [
  { role: 'Super Admin', identifier: 'superadmin', label: 'Super Admin', badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { role: 'Organization Admin', identifier: 'ku_admin', label: 'Org Admin', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { role: 'President', identifier: 'ku_president', label: 'President', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { role: 'Secretary', identifier: 'ku_secretary', label: 'Secretary', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { role: 'Treasurer', identifier: 'ku_treasurer', label: 'Treasurer', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { role: 'Employee', identifier: 'ku_employee1', label: 'Employee', badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  { role: 'Member', identifier: 'ku_member1', label: 'Member', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
];

const LoginPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRoleLabel, setActiveRoleLabel] = useState('Org Admin');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        const redirectPath = location.state?.from?.pathname || res.targetRoute;
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Lighting Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT COLUMN: Visual Brand & Value Proposition (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900/60 border-r border-slate-800/80 p-12 flex-col justify-between hero-gradient">
        
        {/* Top Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                SAHAKARA <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase tracking-wider">ERP</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Cooperative Society Management System</p>
            </div>
          </Link>
        </div>

        {/* Center Visual Showcase */}
        <div className="space-y-8 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-emerald-400 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Tenant Isolated Database Architecture</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Secure Role-Based Access for <span className="gradient-text">Cooperative Societies</span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Enterprise-grade governance for Credit, Housing, Agriculture, and Multi-Purpose Cooperative Societies with complete data segregation and audit transparency.
          </p>

          {/* Feature Badges */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>7-Level RBAC: Super Admin, Org Admin, Executives, Staff & Members</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Strict organizationId query scoping prevents cross-tenant access</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>JWT Encrypted Sessions & bcrypt Password Hashing</span>
            </div>
          </div>
        </div>

        {/* Footer info in left column */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>SAHAKARA ERP System v1.0</span>
          <span className="font-mono text-emerald-400">MCA Mini Project</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 z-10">
        
        {/* Mobile Header Link */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Landing Website</span>
          </Link>
          <div className="lg:hidden flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">SAHAKARA ERP</span>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="max-w-md w-full mx-auto space-y-8 my-auto">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-sm text-slate-400">
              Select your role credentials or enter your email/username to authenticate
            </p>
          </div>

          {/* QUICK DEMO ROLE SELECTOR TABS */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                Select Demo Role Account
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                Pass: password123
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {DEMO_ROLES.map((demo) => {
                const isSelected = activeRoleLabel === demo.label;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleSelectDemoUser(demo)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isSelected
                        ? `${demo.badgeBg} font-bold shadow-md ring-1 ring-emerald-500/40`
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{demo.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-fade-in shadow-lg">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* MAIN LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email or Username Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Email Address or Username
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5 text-emerald-400/80" />
                </div>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setActiveRoleLabel('Custom');
                  }}
                  required
                  placeholder="e.g. admin@coop.org or superadmin"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5 text-emerald-400/80" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-semibold group-hover:text-white transition-colors">
                  Remember session on this device
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {activeRoleLabel} Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Need a new society onboarded?{' '}
          <Link to="/" className="text-emerald-400 font-bold hover:underline">
            Submit Registration Request
          </Link>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
