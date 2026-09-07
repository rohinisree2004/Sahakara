import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Banknote, 
  Users, 
  Calculator, 
  Receipt,
  UserCheck
} from 'lucide-react';

const EmployeeSidebar = ({ onCloseMobile }) => {
  return (
    <div className="flex flex-col h-full w-full bg-white select-none">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Field Officer / Teller</h3>
            <p className="text-[10px] text-teal-700 font-mono font-semibold">Counter & Field Desk</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        <NavLink 
          to="/employee/dashboard" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <LayoutDashboard className="w-4 h-4 text-teal-600" />
          <span>Staff Desk</span>
        </NavLink>

        <NavLink 
          to="/savings/dashboard" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <Banknote className="w-4 h-4 text-teal-600" />
          <span>Deposit Entries</span>
        </NavLink>

        <NavLink 
          to="/repayments/dashboard" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <Calculator className="w-4 h-4 text-teal-600" />
          <span>Collect EMI</span>
        </NavLink>

        <NavLink 
          to="/members/dashboard" 
          onClick={onCloseMobile} 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-900'}`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Member Verification</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default EmployeeSidebar;
