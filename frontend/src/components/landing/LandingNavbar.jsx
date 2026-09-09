import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building2, ChevronRight, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

const LandingNavbar = ({ onOpenInquiry }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                SAHAKARA <span className="text-teal-800 text-xs px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 font-bold tracking-wide">ERP</span>
              </span>
              <p className="text-[10px] text-teal-700 font-bold tracking-wider uppercase">Cooperative Society Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-teal-700 transition-colors">Multi-Tenant Security</a>
            <a href="#benefits" className="hover:text-teal-700 transition-colors">Benefits</a>
            <a href="#flow" className="hover:text-teal-700 transition-colors">ERP Modules</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenInquiry}
              className="px-4 py-2 text-sm font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Register Society</span>
            </button>
            
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all duration-200 flex items-center gap-2"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-teal-700" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 bg-white space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-teal-50 rounded-lg">Features</a>
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-teal-50 rounded-lg">Multi-Tenant Security</a>
              <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-teal-50 rounded-lg">Benefits</a>
              <a href="#flow" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-teal-50 rounded-lg">ERP Modules</a>
            </div>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenInquiry(); }}
                className="w-full py-2.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl text-center"
              >
                Register Society
              </button>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-xs font-bold text-white bg-teal-600 rounded-xl text-center shadow-md shadow-teal-600/20"
              >
                Portal Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavbar;
