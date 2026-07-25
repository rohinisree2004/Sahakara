import React from 'react';
import { Shield, Lock, Database, UserCheck, Layers, GitMerge, FileCheck, Award } from 'lucide-react';

const BenefitsSection = () => {
  return (
    <section id="architecture" className="py-20 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Information */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Multi-Tenant Data Isolation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Ironclad Data Security for Every <span className="gradient-text">Cooperative Society</span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              SAHAKARA ERP is engineered from the ground up to support hundreds of independent cooperative societies on a shared scalable backend, while guaranteeing 100% database isolation.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-xl glass-card border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Mandatory organizationId Tagging</h4>
                  <p className="text-sm text-slate-400">Every record across all database collections is strictly bound to its parent organizationId. Cross-tenant access is physically impossible.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl glass-card border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">7 Granular RBAC Roles</h4>
                  <p className="text-sm text-slate-400">Role-Based Access Control restricts actions between Super Admin, Org Admin, President, Secretary, Treasurer, Employees, and Members.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl glass-card border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Immutable Audit Trail Logs</h4>
                  <p className="text-sm text-slate-400">Every financial transaction, loan approval, and settings change is timestamped and recorded in permanent system audit logs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Diagram Card */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-sm font-bold text-white">System Architecture & Workflow</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">MVC Stack</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>1. Public Landing Site</span>
                <span className="text-emerald-400">Registration Request</span>
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>2. Super Admin Portal</span>
                <span className="text-cyan-400">Verification & Org Approval</span>
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>3. Org Admin & Executive Login</span>
                <span className="text-teal-400">Branches, Staff & Rules</span>
              </div>
              <div className="text-center text-slate-600">↓</div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>4. Member & Financial Operations</span>
                <span className="text-emerald-400">Savings, Loans, EMI & Audit</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                JWT Encrypted Sessions
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                MCA Project Standard
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default BenefitsSection;
