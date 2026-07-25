import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Menu, X, Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 border-r border-slate-800/80 sticky top-0 h-screen z-30 shrink-0">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="glass-nav sticky top-0 z-20 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search Bar */}
            <div className="hidden lg:flex items-center relative w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Global ERP Search..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant ERP</span>
            </div>

            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
            </button>
          </div>

        </header>

        {/* MOBILE DRAWER */}
        {mobileSidebarOpen && (
          <div className="md:hidden glass-card border-b border-slate-800 p-4">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
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

export default MainLayout;
