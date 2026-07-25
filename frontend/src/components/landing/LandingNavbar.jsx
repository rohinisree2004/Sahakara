import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building2, ChevronRight, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

const LandingNavbar = ({ onOpenInquiry }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                SAHAKARA <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold tracking-wide">ERP</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Cooperative Society Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">Multi-Tenant Security</a>
            <a href="#benefits" className="hover:text-emerald-400 transition-colors">Benefits</a>
            <a href="#flow" className="hover:text-emerald-400 transition-colors">ERP Modules</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenInquiry}
              className="px-4 py-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Register Society
            </button>
            
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-400/20 hover:shadow-emerald-400/30 transition-all duration-200 flex items-center gap-2"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-slate-800 px-4 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col gap-3 font-medium text-slate-300">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-400">Features</a>
            <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-400">Multi-Tenant Security</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-400">Benefits</a>
            <a href="#flow" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-400">ERP Modules</a>
          </nav>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInquiry();
              }}
              className="w-full py-2.5 text-center font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
            >
              Register Society
            </button>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center font-semibold text-slate-950 bg-emerald-400 rounded-lg shadow-md"
            >
              Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
