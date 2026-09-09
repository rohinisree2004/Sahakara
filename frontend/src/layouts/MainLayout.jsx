import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ContextSwitcher from '../components/common/ContextSwitcher';
import { Menu, X, Bell, Search, Sparkles, Home, CreditCard, BookOpen, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { user, activeGroup, logout } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isMember = user?.role === 'Member';

  const memberTabs = [
    { label: 'Home', path: '/member/dashboard', icon: Home },
    { label: 'Loans', path: '/my-loans', icon: CreditCard },
    { label: 'Passbook', path: '/passbook', icon: BookOpen },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-teal-500 selection:text-white">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 border-r border-slate-200 sticky top-0 h-screen z-30 shrink-0 bg-white overflow-hidden shadow-[2px_0_12px_-4px_rgba(0,0,0,0.03)]">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md shadow-sm">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-teal-800 hover:bg-teal-50 transition-colors"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-teal-700" />}
            </button>

            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-3">
            <ContextSwitcher />

            {/* Global Search Bar */}
            <div className="hidden lg:flex items-center relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search platform..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 transition-all shadow-inner"
              />
            </div>

            {/* Active Group & Role Switcher Pill */}
            {activeGroup && (
              <Link
                to="/select-group"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-xs font-bold text-teal-800 transition-colors shadow-xs"
                title="Switch Group & Dynamic Role"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[140px] truncate">{activeGroup.groupName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-teal-200 font-mono font-bold text-teal-900">
                  {user?.role}
                </span>
              </Link>
            )}

            {/* Role Badge (if no activeGroup) */}
            {!activeGroup && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-mono font-bold text-teal-800 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{user?.role || 'Portal User'}</span>
              </div>
            )}

            {/* Notifications Button */}
            <button className="p-2 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 hover:text-teal-800 hover:bg-teal-50 transition-colors relative shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-teal-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100/70 transition-colors shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-teal-700 font-mono truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </header>

        {/* MOBILE DRAWER */}
        {mobileSidebarOpen && !isMember && (
          <div className="md:hidden bg-white border-b border-slate-200 p-0 max-h-[85vh] overflow-y-auto shadow-lg">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* PAGE BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-73px)] mb-16 md:mb-0">
          <Outlet />
        </main>

        {/* MOBILE BOTTOM TAB BAR (MEMBERS) */}
        {isMember && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-50 flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            {memberTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                    isActive ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-500 hover:text-teal-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

export default MainLayout;
