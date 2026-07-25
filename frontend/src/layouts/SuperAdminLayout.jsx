import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  LayoutDashboard, 
  CheckSquare, 
  Building2, 
  Activity, 
  Settings, 
  FileCheck, 
  LogOut, 
  Bell, 
  User, 
  Menu, 
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/super-admin/approvals', label: 'Approvals Queue', icon: CheckSquare, badge: 'New' },
    { path: '/super-admin/organizations', label: 'Organizations', icon: Building2 },
    { path: '/super-admin/monitoring', label: 'Platform Health', icon: Activity },
    { path: '/super-admin/settings', label: 'System Settings', icon: Settings },
    { path: '/super-admin/audit-logs', label: 'Audit Trail Logs', icon: FileCheck },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 bg-slate-900/90 border-r border-slate-800/80 flex-col justify-between p-4 sticky top-0 h-screen z-30">
        
        <div className="space-y-6">
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-3 px-2 py-2 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                SAHAKARA <span className="text-rose-400 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 font-mono">SUPER</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Global Admin Panel</p>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Platform Governance
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Super Admin'}</div>
              <div className="text-[10px] text-rose-400 font-mono truncate">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-rose-400 border border-slate-700/80 hover:border-rose-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>End Admin Session</span>
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="glass-nav sticky top-0 z-20 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>SAHAKARA ERP</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-emerald-400 font-semibold">Super Admin Master Portal</span>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/super-admin/approvals"
              className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2 hover:bg-amber-500/20 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 animate-pulse" />
              <span>Pending Society Approvals</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>System Health: Optimal</span>
            </div>
          </div>

        </header>

        {/* MOBILE DRAWER */}
        {mobileSidebarOpen && (
          <div className="md:hidden glass-card border-b border-slate-800 p-4 space-y-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* PAGE BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default SuperAdminLayout;
