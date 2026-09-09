import React from 'react';
import { ShieldCheck, Layers, Users, TrendingUp, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

const HeroSection = ({ onOpenInquiry, stats }) => {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden hero-gradient">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-teal-800 font-bold">Multi-Organization Ready</span>
            <span className="text-teal-400">•</span>
            <span>Zero Data Leakage Security</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Empowering Cooperative Societies with Next-Gen <span className="gradient-text">Enterprise ERP</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            A unified, multi-tenant cloud platform built specifically for Credit, Housing, Agriculture, and Multi-Purpose Cooperative Societies. Manage Members, Savings, Loans, EMI, Accounting, and Audits seamlessly.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenInquiry}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/20 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
            >
              <span>Register Your Society Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#architecture"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 hover:text-teal-900 bg-white hover:bg-teal-50 border border-slate-200 rounded-xl shadow-xs transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-teal-600 text-teal-600" />
              <span>Explore Platform Architecture</span>
            </a>
          </div>

          {/* Quick Features Checklist */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Isolated Organization DB Schema</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>7-Level RBAC Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Bank-Grade Audit Trails</span>
            </div>
          </div>
        </div>

        {/* Live Platform Stats Dashboard Preview */}
        <div className="mt-16 bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-soft-teal">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            <div className="text-center space-y-1 pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">{stats.activeSocieties}</div>
              <p className="text-xs sm:text-sm text-teal-700 font-semibold uppercase tracking-wider">Registered Societies</p>
            </div>
            <div className="text-center space-y-1 pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">{stats.totalMembersServed}</div>
              <p className="text-xs sm:text-sm text-teal-700 font-semibold uppercase tracking-wider">Members Enrolled</p>
            </div>
            <div className="text-center space-y-1 pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-teal-800 font-mono tracking-tight">{stats.totalTransactionsProcessed}</div>
              <p className="text-xs sm:text-sm text-teal-700 font-semibold uppercase tracking-wider">Transactions Managed</p>
            </div>
            <div className="text-center space-y-1 pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-teal-700 font-mono tracking-tight">{stats.systemUptime}</div>
              <p className="text-xs sm:text-sm text-teal-700 font-semibold uppercase tracking-wider">System Availability</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
