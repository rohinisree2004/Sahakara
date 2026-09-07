import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, MessageSquare, BookOpen, User, Users, HelpCircle, Calendar, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MemberSidebar = ({ onCloseMobile }) => {
  const { activeGroup } = useAuth();

  return (
    <div className="flex flex-col h-full w-full bg-white select-none">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Member Space</h3>
              <p className="text-[10px] text-teal-700 font-mono font-semibold">Self-Help Portal</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        <NavLink 
          to="/member/dashboard" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <LayoutDashboard className="w-4 h-4 text-teal-600" />
          <span>My Overview</span>
        </NavLink>

        <NavLink 
          to="/passbook" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>Digital Passbook</span>
        </NavLink>

        <NavLink 
          to="/my-loans" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <CreditCard className="w-4 h-4 text-teal-600" />
          <span>My Loans</span>
        </NavLink>

        <NavLink 
          to="/meetings/calendar" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Meeting Schedule</span>
        </NavLink>

        <NavLink 
          to={activeGroup?._id ? `/groups/profile/${activeGroup._id}` : '/groups/profile'} 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>My Group Details</span>
        </NavLink>

        <NavLink 
          to="/groups/reports" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <FileSpreadsheet className="w-4 h-4 text-teal-600" />
          <span>Group Reports</span>
        </NavLink>

        <NavLink 
          to="/chat" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <span>Group Chat</span>
        </NavLink>

        <NavLink 
          to="/complaints" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>Support & Helpdesk</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MemberSidebar;
