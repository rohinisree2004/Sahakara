import React from 'react';
import { Shield, Lock, Database, UserCheck, Layers, GitMerge, FileCheck, Award } from 'lucide-react';

const BenefitsSection = () => {
  return (
    <section id="architecture" className="py-20 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Information */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Multi-Tenant Data Isolation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Ironclad Data Security for Every <span className="gradient-text">Cooperative Society</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              SAHAKARA ERP is engineered from the ground up to support hundreds of independent cooperative societies on a shared scalable backend, while guaranteeing 100% database isolation.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-700 font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Mandatory organizationId Tagging</h4>
                  <p className="text-xs text-slate-500">Every record across all database collections is strictly bound to its parent organizationId. Cross-tenant access is physically impossible.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-700 font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">7 Granular RBAC Roles</h4>
                  <p className="text-xs text-slate-500">Role-Based Access Control restricts actions between Super Admin, Org Admin, President, Secretary, Treasurer, Employees, and Members.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-700 font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Immutable Audit Trail Logs</h4>
                  <p className="text-xs text-slate-500">Every financial transaction, loan approval, and settings change is timestamped and recorded in permanent system audit logs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hierarchy Diagram Card */}
          <div className="bg-white p-8 rounded-3xl border border-teal-100 shadow-soft-teal space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Hierarchical Structural Architecture</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-bold flex items-center justify-between shadow-xs">
                <span>1. Multi-Tenant Master Platform</span>
                <span className="text-[10px] bg-teal-100 px-2 py-0.5 rounded text-teal-800">Super Admin</span>
              </div>
              <div className="pl-6 border-l-2 border-teal-200 space-y-3 ml-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center justify-between">
                  <span>2. Autonomous Organizations (Societies)</span>
                  <span className="text-[10px] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-teal-800">Org Admin</span>
                </div>
                <div className="pl-6 border-l-2 border-teal-200 space-y-3 ml-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center justify-between">
                    <span>3. Operational Branch Network</span>
                    <span className="text-[10px] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-teal-800">Branch Manager</span>
                  </div>
                  <div className="pl-6 border-l-2 border-teal-200 space-y-3 ml-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center justify-between">
                      <span>4. Self-Help Groups (SHG / JLG)</span>
                      <span className="text-[10px] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-teal-800">Exec Officers</span>
                    </div>
                    <div className="pl-6 border-l-2 border-teal-200 ml-4">
                      <div className="p-3.5 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-between shadow-sm">
                        <span>5. Individual Society Members</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white">Passbook</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default BenefitsSection;
