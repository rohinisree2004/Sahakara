import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  HelpCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Layers,
  FileText,
  UserCheck2,
  FolderLock
} from 'lucide-react';

const OrgAdminSidebar = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Navigation Structure with Sub-Categories matching Super Admin style
  const menuSections = [
    {
      id: 'overview',
      title: 'Overview & Intelligence',
      icon: LayoutDashboard,
      color: 'text-teal-700',
      items: [
        { label: 'Society Dashboard', path: '/org-admin/dashboard', icon: LayoutDashboard },
        { label: 'Society Profile', path: '/org-admin/profile', icon: Building2 },
        { label: 'Activity Logs', path: '/org-admin/logs', icon: Activity },
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
      title: 'Users & Staff Desk',
      icon: Users,
      color: 'text-teal-700',
      items: [
        { label: 'Staff & Users Desk', path: '/users/dashboard', icon: Users },
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
        { label: 'Savings & Passbooks', path: '/savings/dashboard', icon: Banknote },
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
        { label: 'Member KYC Approvals', path: '/members/approvals', icon: UserCheck2 },
        { label: 'Group Meetings & AGMs', path: '/meetings/dashboard', icon: Calendar },
        { label: 'Complaints Desk', path: '/complaints', icon: HelpCircle },
        { label: 'Account Closures', path: '/member/account-closure', icon: AlertCircle },
      ]
    },
    {
      id: 'settings',
      title: 'Society Settings',
      icon: Settings,
      color: 'text-slate-600',
      items: [
        { label: 'Organization Settings', path: '/org-admin/settings', icon: Settings },
      ]
    }
  ];

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
      
      {/* Society Admin Identity Badge */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5 truncate">
                <span>Society Admin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
              </div>
              <p className="text-[10px] text-teal-700 font-mono font-semibold truncate">
                Executive Command
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-800 uppercase tracking-wider shrink-0 font-mono">
            ORG
          </span>
        </div>
      </div>

      {/* Accordion Menu Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-3">
        {menuSections.map((section) => {
          const isOpen = openSections[section.id];
          const hasActiveChild = section.items.some(
            item => location.pathname === item.path || location.pathname.startsWith(item.path)
          );

          return (
            <div key={section.id} className="space-y-1">
              
              {/* Category Header Button */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
                  hasActiveChild 
                    ? 'text-teal-900 bg-teal-50/70 font-black' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <section.icon className={`w-3.5 h-3.5 ${hasActiveChild ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Sub-items list */}
              {isOpen && (
                <div className="space-y-0.5 pl-2 border-l-2 border-slate-100 ml-3 pt-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-teal-600 text-white font-bold shadow-sm shadow-teal-600/20'
                            : 'text-slate-600 hover:bg-teal-50/60 hover:text-teal-900'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-mono text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default OrgAdminSidebar;
