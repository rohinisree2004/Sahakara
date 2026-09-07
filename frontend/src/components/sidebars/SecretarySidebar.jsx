import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  MessageSquare, 
  HelpCircle, 
  FileText,
  FileCheck
} from 'lucide-react';

const SecretarySidebar = ({ onCloseMobile }) => {
  const { activeGroup } = useAuth();

  return (
    <div className="flex flex-col h-full w-full bg-white select-none">
      <div className="p-4 border-b border-slate-100 bg-blue-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <FileText className="w-4 h-4 text-blue-200" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Secretary Desk</h3>
            <p className="text-[10px] text-blue-800 font-mono font-semibold">Reports & Assembly Records</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Core Member Services */}
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Personal Member Space
        </div>

        <NavLink 
          to="/secretary/dashboard" 
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
          <span>My Personal Loans</span>
        </NavLink>

        <NavLink 
          to={activeGroup?._id ? `/groups/profile/${activeGroup._id}` : '/groups/profile'} 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Group Profile & Roster</span>
        </NavLink>

        {/* Secretary Duties */}
        <div className="pt-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
          <FileCheck className="w-3 h-3 text-blue-600" />
          <span>Secretary Duties</span>
        </div>

        <NavLink 
          to="/groups/reports" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs' : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-900'}`}
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span>Create & Export Reports</span>
        </NavLink>

        <NavLink 
          to="/meetings/dashboard" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs' : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-900'}`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Assemblies & Attendance</span>
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

export default SecretarySidebar;
