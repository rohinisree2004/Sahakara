import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  GitBranch, 
  Users, 
  Settings, 
  ShieldCheck, 
  Activity, 
  FileCheck, 
  CheckSquare, 
  UserPlus, 
  UserCheck, 
  CreditCard, 
  Banknote, 
  Receipt, 
  Calculator, 
  Calendar, 
  MessageSquare, 
  HelpCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

const SuperAdminSidebar = ({ onCloseMobile }) => {
  const location = useLocation();

  // Navigation Structure with Sub-Categories
  const menuSections = [
    {
      id: 'overview',
      title: 'Overview & Intelligence',
      icon: LayoutDashboard,
      color: 'text-teal-700',
      items: [
        { label: 'Platform Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
        { label: 'Infrastructure & Health', path: '/super-admin/monitoring', icon: Activity, badge: 'Live' },
        { label: 'Master Audit Trail', path: '/super-admin/audit-logs', icon: FileCheck },
      ]
    },
    {
      id: 'organizations',
      title: 'Organization Management',
      icon: Building2,
      color: 'text-teal-800',
      items: [
        { label: 'All Organizations', path: '/super-admin/organizations', icon: Building2 },
        { label: 'Society Approvals', path: '/super-admin/approvals', icon: CheckSquare },
      ]
    },
    {
      id: 'branches',
      title: 'Branch & Group Network',
      icon: GitBranch,
      color: 'text-teal-600',
      items: [
        { label: 'Branch Overview', path: '/branches/dashboard', icon: GitBranch },
        { label: 'Branch Directory', path: '/branches/management', icon: Layers },
        { label: 'Manager Assignments', path: '/branches/manager-assign', icon: UserCheck },
        { label: 'SHG Groups Network', path: '/groups/dashboard', icon: Users },
      ]
    },
    {
      id: 'users',
      title: 'Users & Identities',
      icon: Users,
      color: 'text-teal-700',
      items: [
        { label: 'Global Users Desk', path: '/users/dashboard', icon: Users },
        { label: 'User Directory List', path: '/users/list', icon: Users },
        { label: 'Create New User', path: '/users/create', icon: UserPlus },
        { label: 'User Activity Logs', path: '/users/logs', icon: Activity },
      ]
    },
    {
      id: 'financial',
      title: 'Financial & Credit Desks',
      icon: CreditCard,
      color: 'text-teal-800',
      items: [
        { label: 'Loan Portfolio', path: '/loans/dashboard', icon: CreditCard },
        { label: 'Loan Applications', path: '/loans/applications', icon: Banknote },
        { label: 'Savings & Passbooks', path: '/savings/dashboard', icon: WalletIcon },
        { label: 'EMI Repayments', path: '/repayments/dashboard', icon: Calculator },
        { label: 'General Ledger', path: '/accounting/dashboard', icon: Receipt },
      ]
    },
    {
      id: 'governance',
      title: 'Operations & Governance',
      icon: ShieldCheck,
      color: 'text-teal-700',
      items: [
        { label: 'Member Directory', path: '/members/dashboard', icon: Users },
        { label: 'Member KYC Approvals', path: '/members/approvals', icon: UserCheck },
        { label: 'Group Meetings & AGMs', path: '/meetings/dashboard', icon: Calendar },
        { label: 'Complaints Desk', path: '/complaints', icon: HelpCircle },
        { label: 'Account Closures', path: '/member/account-closure', icon: AlertCircle },
      ]
    },
    {
      id: 'settings',
      title: 'Platform System',
      icon: Settings,
      color: 'text-slate-600',
      items: [
        { label: 'System Settings', path: '/super-admin/settings', icon: Settings },
      ]
    }
  ];

  function WalletIcon(props) {
    return <Banknote {...props} />;
  }

  const getInitialOpenSections = () => {
    const openMap = {};
    menuSections.forEach(sec => {
      const hasActive = sec.items.some(item => location.pathname.startsWith(item.path));
      openMap[sec.id] = hasActive || sec.id === 'overview';
    });
    return openMap;
  };

  const [openSections, setOpenSections] = useState(getInitialOpenSections);

  useEffect(() => {
    menuSections.forEach(sec => {
      if (sec.items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path))) {
        setOpenSections(prev => ({ ...prev, [sec.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-white select-none">
      
      {/* Super Admin Identity Badge */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
                <span>Super Admin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-teal-700 font-mono font-semibold">Master Governance</p>
            </div>
          </div>

          <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold shadow-xs">
            ROOT
          </span>
        </div>
      </div>

      {/* Accordion Navigation Groups */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuSections.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = !!openSections[section.id];
          const hasActiveItem = section.items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path));

          return (
            <div key={section.id} className="rounded-xl overflow-hidden transition-colors">
              {/* Section Header Accordion Trigger */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  hasActiveItem 
                    ? 'text-teal-900 bg-teal-50/80 shadow-xs' 
                    : 'text-slate-600 hover:text-teal-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SectionIcon className={`w-4 h-4 ${section.color}`} />
                  <span className="tracking-tight">{section.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-teal-700 transition-transform" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform" />
                  )}
                </div>
              </button>

              {/* Sub-Items List */}
              {isOpen && (
                <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-teal-100 ml-3.5 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-xs'
                              : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ItemIcon className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-teal-100 border border-teal-200 text-teal-800 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Quick Diagnostic */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>MongoDB Atlas</span>
        </span>
        <span className="text-teal-700 font-bold">CONNECTED</span>
      </div>

    </div>
  );
};

export default SuperAdminSidebar;
