import React from 'react';
import { ShieldCheck, Layers, Users, TrendingUp, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

const HeroSection = ({ onOpenInquiry, stats }) => {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden hero-gradient">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">Multi-Organization Ready</span>
            <span className="text-slate-500">•</span>
            <span>Zero Data Leakage Security</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Empowering Cooperative Societies with Next-Gen <span className="gradient-text">Enterprise ERP</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            A unified, multi-tenant cloud platform built specifically for Credit, Housing, Agriculture, and Multi-Purpose Cooperative Societies. Manage Members, Savings, Loans, EMI, Accounting, and Audits seamlessly.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenInquiry}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
            >
              <span>Register Your Society Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#architecture"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              <span>Explore Platform Architecture</span>
            </a>
          </div>

          {/* Quick Features Checklist */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Isolated Organization DB Schema</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>7-Level RBAC Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated EMI & Ledger</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 text-center hover:border-emerald-500/30 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">{stats?.activeSocieties || '48+'}</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400">Cooperative Societies</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 text-center hover:border-emerald-500/30 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{stats?.totalMembersServed || '125,000+'}</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400">Active Members</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 text-center hover:border-emerald-500/30 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mb-1">{stats?.totalTransactionsProcessed || '₹ 450 Cr+'}</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400">Transactions Audited</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 text-center hover:border-emerald-500/30 transition-colors">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 mb-1">{stats?.systemUptime || '99.98%'}</div>
            <div className="text-xs sm:text-sm font-medium text-slate-400">System Availability</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
