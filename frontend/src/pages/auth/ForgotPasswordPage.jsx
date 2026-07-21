import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Mail, KeyRound, Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { forgotPassword, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword(email.trim());
      if (res.data && res.data.success) {
        setMessage(res.data.message);
        if (res.data.devOTP) {
          setDevOtpHint(res.data.devOTP);
        }
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyOtp(email.trim(), otp.trim());
      if (res.data && res.data.success) {
        setResetToken(res.data.resetToken || 'demo_reset_token');
        setMessage('OTP Verified successfully. Please enter your new password.');
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await resetPassword(email.trim(), newPassword, resetToken);
      if (res.data && res.data.success) {
        setStep(4);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 hero-gradient relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            SAHAKARA <span className="text-emerald-400">ERP</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Password Recovery Portal
        </h2>
        <p className="text-xs text-slate-400">
          Verify your identity with 6-digit OTP code to update your password
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">

          {/* Step Progress Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-bold text-slate-400">
            <span className={step >= 1 ? 'text-emerald-400 font-extrabold' : ''}>1. Email</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-emerald-400 font-extrabold' : ''}>2. OTP</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-emerald-400 font-extrabold' : ''}>3. Reset</span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Dev OTP Hint */}
          {devOtpHint && step === 2 && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>🔑 Dev OTP Code:</span>
              <strong className="text-sm font-bold tracking-widest text-emerald-400">{devOtpHint}</strong>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5 text-emerald-400/80" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. admin@coop.org"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-xs text-slate-400">
                A 6-digit verification code has been dispatched to <strong>{email}</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5 text-emerald-400/80" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-2xl border border-slate-700/80 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify Code</span>}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5 text-emerald-400/80" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5 text-emerald-400/80" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Update Password</span>}
              </button>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Password Reset Complete!</h3>
              <p className="text-xs text-slate-400">
                Your credentials have been updated securely. You may now log in to your role portal.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all"
              >
                Return to Login Portal
              </button>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors">
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
              Return to Login Portal
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
