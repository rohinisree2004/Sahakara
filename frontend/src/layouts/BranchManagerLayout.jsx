import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Globe, 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  FileCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Award,
  Layers
} from 'lucide-react';

const BranchManagerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { path: '/branches/dashboard', label: 'Branch Dashboard', icon: LayoutDashboard },
    { path: '/branches/management', label: 'Branch Registry', icon: Globe },
    { path: '/branches/manager-assign', label: 'Manager Assignment', icon: Award },
    { path: '/branches/employees', label: 'Branch Employees', icon: UserCheck },
    { path: '/branches/members', label: 'Branch Members', icon: Users },
    { path: '/branches/reports', label: 'Reports & Export', icon: FileText },
    { path: '/branches/logs', label: 'Branch Audit Trail', icon: FileCheck },
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
          {/* Logo & Branch Badge */}
          <Link to="/" className="flex items-center gap-3 px-2 py-2 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                SAHAKARA <span className="text-teal-400 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 font-mono">BRANCH</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">
                {user?.branchId?.branchName || (user?.role === 'Super Admin' ? 'Master Control' : 'Branch Desk')}
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Branch Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-teal-500/15 border border-teal-500/30 text-teal-300 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Session Card */}
        <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Branch Manager'}</div>
              <div className="text-[10px] text-teal-400 font-mono truncate">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-rose-400 border border-slate-700/80 hover:border-rose-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="glass-nav sticky top-0 z-20 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-white">{user?.organizationId?.name || 'Sahakara ERP'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-teal-400 font-mono font-bold">{user?.branchId?.branchName || 'Branch Operations'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Branch Status: Active</span>
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
                        isActive ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-teal-400" />
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

export default BranchManagerLayout;
