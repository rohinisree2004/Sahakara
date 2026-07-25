import React from 'react';
import { Shield, Mail, Phone, MapPin, Heart } from 'lucide-react';

const LandingFooter = ({ onOpenInquiry }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                SAHAKARA <span className="text-emerald-400">ERP</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise Multi-Tenant ERP System for Cooperative Credit & Housing Societies. MCA Mini Project Implementation.
            </p>
            <div className="inline-block px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              Stack: MERN + Tailwind + JWT
            </div>
          </div>

          {/* Col 2: Modules Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Core Modules</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Super Admin Portal</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Branch Management</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Member & Group Ledger</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Savings & Deposits</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Loans & Automated EMI</a></li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Platform Security</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">Multi-Tenant Isolation</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">7-Level RBAC Roles</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">Double-Entry Accounting</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">Audit Log Traceability</a></li>
              <li><button onClick={onOpenInquiry} className="text-emerald-400 hover:underline">Register New Society</button></li>
            </ul>
          </div>

          {/* Col 4: Contact & Project Info */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Project Helpdesk</h4>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>support@sahakaraerp.org</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+91 (080) 2345-6789</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Dept of Computer Applications (MCA)</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SAHAKARA ERP System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted for MCA Mini Project with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>MERN Stack</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
