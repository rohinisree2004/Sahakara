import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  GitBranch, 
  Users, 
  ShieldCheck, 
  Activity, 
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
  MessageSquare,
  FileText,
  Building2
} from 'lucide-react';

const BranchManagerSidebar = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Navigation Structure tailored specifically for Branch Manager
  const menuSections = [
    {
      id: 'overview',
      title: 'Branch Intelligence',
      icon: LayoutDashboard,
      color: 'text-teal-700',
      items: [
        { label: 'Branch Dashboard', path: '/branches/dashboard', icon: LayoutDashboard },
        { label: 'Branch Staff Roster', path: '/branches/employees', icon: Users },
        { label: 'Operational Reports', path: '/branches/reports', icon: FileText },
      ]
    },
    {
      id: 'groups',
      title: 'SHG Groups & Network',
      icon: Layers,
      color: 'text-teal-600',
      items: [
        { label: 'SHG Groups Network', path: '/groups/dashboard', icon: Layers },
        { label: 'Create New Group', path: '/groups/create', icon: UserPlus },
        { label: 'Group Leadership Desk', path: '/groups/leaders', icon: UserCheck },
      ]
    },
    {
      id: 'members',
      title: 'Member Lifecycle & KYC',
      icon: Users,
      color: 'text-teal-700',
      items: [
        { label: 'Member Directory', path: '/members/dashboard', icon: Users },
        { label: 'Member KYC Approvals', path: '/members/approvals', icon: CheckSquare, badge: 'Audit' },
        { label: 'New Member Enrollment', path: '/members/register', icon: UserPlus },
        { label: 'Account Closures', path: '/member/account-closure', icon: AlertCircle },
      ]
    },
    {
      id: 'financial',
      title: 'Core Banking & Credit',
      icon: CreditCard,
      color: 'text-teal-800',
      items: [
        { label: 'Loan Applications', path: '/loans/applications', icon: Banknote },
        { label: 'Loan Portfolio', path: '/loans/dashboard', icon: CreditCard },
        { label: 'Savings & Passbooks', path: '/savings/dashboard', icon: Banknote },
        { label: 'EMI Repayment Desk', path: '/repayments/dashboard', icon: Calculator },
      ]
    },
    {
      id: 'governance',
      title: 'Governance & Desk',
      icon: ShieldCheck,
      color: 'text-teal-700',
      items: [
        { label: 'Group Meetings & AGMs', path: '/meetings/dashboard', icon: Calendar },
        { label: 'Branch Complaints Desk', path: '/complaints', icon: HelpCircle },
        { label: 'Branch Messenger', path: '/chat', icon: MessageSquare },
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
      
      {/* Branch Manager Identity Badge */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5 truncate">
                <span>Branch Manager</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
              </div>
              <p className="text-[10px] text-teal-700 font-mono font-semibold truncate">
                Branch Operations
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-800 uppercase tracking-wider shrink-0 font-mono">
            BRANCH
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
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
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-mono text-[9px] font-bold">
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

export default BranchManagerSidebar;
