import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  GitBranch, 
  UserCheck, 
  Users, 
  ShieldAlert, 
  LayoutDashboard, 
  FileText, 
  FileCheck, 
  Settings, 
  LogOut, 
  User, 
  Sparkles,
  Wallet,
  Landmark,
  Banknote,
  HelpCircle,
  Calculator,
  PieChart,
  ArrowRightLeft,
  Calendar
} from 'lucide-react';

const Sidebar = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'Organization Admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine root dashboard path based on role
  const getDashboardPath = () => {
    switch (role) {
      case 'Super Admin':
        return '/super-admin/dashboard';
      case 'Organization Admin':
        return '/org-admin/dashboard';
      case 'Branch Manager':
        return '/branches/dashboard';
      case 'President':
      case 'Secretary':
      case 'Treasurer':
        return '/executive/dashboard';
      case 'Employee':
        return '/employee/dashboard';
      case 'Member':
        return '/member/dashboard';
      default:
        return '/org-admin/dashboard';
    }
  };

  // Define full menu items list across all 9 completed modules
  const allMenuItems = [
    {
      label: 'Main Dashboard',
      path: getDashboardPath(),
      icon: LayoutDashboard,
      roles: ['Super Admin', 'Organization Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer', 'Employee', 'Member'],
    },
    {
      label: 'Platform Governance',
      path: '/super-admin/approvals',
      icon: ShieldAlert,
      roles: ['Super Admin'],
    },
    {
      label: 'Organization Profile',
      path: '/org-admin/profile',
      icon: Building2,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer'],
    },
    {
      label: 'Branch Management',
      path: '/branches/dashboard',
      icon: GitBranch,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee'],
    },
    {
      label: 'User Accounts',
      path: '/users/dashboard',
      icon: UserCheck,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer'],
    },
    {
      label: 'Member Lifecycle',
      path: '/members/dashboard',
      icon: Users,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee'],
    },
    {
      label: 'Roles & Permissions',
      path: '/roles/dashboard',
      icon: ShieldAlert,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer'],
    },
    {
      label: 'Member Groups (SHG/JLG)',
      path: '/groups/dashboard',
      icon: Users,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee'],
    },
    {
      label: 'Savings Management',
      path: '/savings/dashboard',
      icon: Wallet,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee', 'Member'],
    },
    {
      label: 'Loan Management',
      path: '/loans/dashboard',
      icon: Banknote,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee', 'Member'],
    },
    {
      label: 'EMI & Repayments',
      path: '/repayments/dashboard',
      icon: Calculator,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee', 'Member'],
    },
    {
      label: 'Accounting & Ledgers',
      path: '/accounting/dashboard',
      icon: PieChart,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Branch Manager'],
    },
    {
      label: 'Transaction Center',
      path: '/transactions/dashboard',
      icon: ArrowRightLeft,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Branch Manager', 'Employee'],
    },
    {
      label: 'Meetings & Governance',
      path: '/meetings/dashboard',
      icon: Calendar,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Branch Manager', 'Employee', 'Member'],
    },
    {
      label: 'Reports & Analytics',
      path: '/members/reports',
      icon: FileText,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer', 'Employee'],
    },
    {
      label: 'Audit Trail Logs',
      path: '/users/logs',
      icon: FileCheck,
      roles: ['Super Admin', 'Organization Admin', 'President', 'Secretary', 'Treasurer'],
    },
    {
      label: 'Society Settings',
      path: '/org-admin/settings',
      icon: Settings,
      roles: ['Super Admin', 'Organization Admin'],
    },
  ];

  // Filter items by current user's role
  const allowedMenuItems = allMenuItems.filter((item) => item.roles.includes(role));

  return (
    <div className="flex flex-col justify-between h-full p-4 bg-slate-900/90 text-slate-100 font-sans">
      
      <div className="space-y-6">
        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-3 px-2 py-2 group" onClick={onCloseMobile}>
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
              SAHAKARA <span className="text-emerald-400 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono">ERP</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Multi-Coop ERP Platform</p>
          </div>
        </Link>

        {/* Dynamic RBAC Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ERP Navigation Matrix
          </div>

          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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

      {/* User Session Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{user?.name || 'Authenticated Officer'}</div>
            <div className="text-[10px] text-emerald-400 font-mono truncate">{role}</div>
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

    </div>
  );
};

export default Sidebar;
