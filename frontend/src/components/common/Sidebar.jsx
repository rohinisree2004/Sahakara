import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Sparkles, Shield, User, Layers, RefreshCw } from 'lucide-react';
import SuperAdminSidebar from '../sidebars/SuperAdminSidebar';
import OrgAdminSidebar from '../sidebars/OrgAdminSidebar';
import BranchManagerSidebar from '../sidebars/BranchManagerSidebar';
import PresidentSidebar from '../sidebars/PresidentSidebar';
import SecretarySidebar from '../sidebars/SecretarySidebar';
import TreasurerSidebar from '../sidebars/TreasurerSidebar';
import EmployeeSidebar from '../sidebars/EmployeeSidebar';
import MemberSidebar from '../sidebars/MemberSidebar';

const Sidebar = ({ onCloseMobile }) => {
  const { user, activeGroup, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role || 'Member';

  const renderActiveSidebar = () => {
    switch (role) {
      case 'Super Admin': return <SuperAdminSidebar onCloseMobile={onCloseMobile} />;
      case 'Organization Admin': return <OrgAdminSidebar onCloseMobile={onCloseMobile} />;
      case 'Branch Manager': return <BranchManagerSidebar onCloseMobile={onCloseMobile} />;
      case 'President': return <PresidentSidebar onCloseMobile={onCloseMobile} />;
      case 'Secretary': return <SecretarySidebar onCloseMobile={onCloseMobile} />;
      case 'Treasurer': return <TreasurerSidebar onCloseMobile={onCloseMobile} />;
      case 'Employee': return <EmployeeSidebar onCloseMobile={onCloseMobile} />;
      case 'Member': return <MemberSidebar onCloseMobile={onCloseMobile} />;
      default: return <MemberSidebar onCloseMobile={onCloseMobile} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white select-none">
      {/* BRANDING */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 shrink-0 bg-white">
        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Sahakara</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold">ERP</span>
          </h1>
          <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">Cooperative Platform</p>
        </div>
      </div>

      {/* ACTIVE GROUP INDICATOR & SWITCHER BUTTON */}
      {activeGroup && (
        <div className="p-3 border-b border-slate-100 bg-teal-50/40">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                <Layers className="w-3 h-3 text-teal-600" /> Active Group
              </span>
              <p className="text-xs font-bold text-slate-900 truncate" title={activeGroup.groupName}>
                {activeGroup.groupName}
              </p>
            </div>
            <Link
              to="/select-group"
              onClick={onCloseMobile}
              className="p-1.5 bg-white hover:bg-teal-100/70 text-teal-800 border border-teal-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
              title="Switch Group & Dynamic Role"
            >
              <RefreshCw className="w-3 h-3 text-teal-600" />
              <span>Switch</span>
            </Link>
          </div>
        </div>
      )}

      {/* DYNAMIC SIDEBAR NAV */}
      <div className="flex-1 overflow-hidden">
        {renderActiveSidebar()}
      </div>

      {/* USER PROFILE & LOGOUT */}
      <div className="p-3.5 border-t border-slate-200 shrink-0 bg-slate-50 mt-auto space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <span className="font-black text-xs text-teal-800">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-teal-700 font-semibold truncate flex items-center gap-1">
              <span>{role}</span>
              {activeGroup && <span className="text-slate-400">• Active</span>}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
