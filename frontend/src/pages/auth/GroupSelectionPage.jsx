import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMyGroupsApi } from '../../services/api';
import { 
  Users, 
  Crown, 
  FileText, 
  Banknote, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Building2, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  MapPin
} from 'lucide-react';

import { getDashboardRoute } from '../../contexts/AuthContext';

const GroupSelectionPage = () => {
  const { user, switchActiveGroup, logout } = useAuth();
  const navigate = useNavigate();

  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectingGroupId, setSelectingGroupId] = useState(null);

  useEffect(() => {
    // If user is not in a group role (Super Admin, Org Admin, Branch Manager, Employee), redirect immediately to dashboard
    // After login, all group members (including elected President/Secretary/Treasurer) arrive as 'Member'
    if (user && !['Member', 'President', 'Secretary', 'Treasurer'].includes(user.role)) {
      navigate(getDashboardRoute(user.role), { replace: true });
      return;
    }

    const loadGroups = async () => {
      try {
        setLoading(true);
        const res = await fetchMyGroupsApi();
        if (res.data?.success) {
          setMyGroups(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load user groups:', err);
        setError('Failed to fetch your assigned groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [user, navigate]);

  const handleSelectGroup = (groupItem) => {
    setSelectingGroupId(groupItem._id);
    try {
      const targetRoute = switchActiveGroup(groupItem, groupItem.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      console.error('Group selection error:', err);
      setSelectingGroupId(null);
    }
  };

  const getRoleCardConfig = (role) => {
    switch (role) {
      case 'President':
        return {
          icon: Crown,
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          borderColor: 'border-amber-200 hover:border-amber-400',
          accentBg: 'bg-amber-500/10 text-amber-600',
          buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
          desc: 'Presiding Officer Desk • Manage member rosters, enroll new members, board sanction reviews (No meeting scheduling).'
        };
      case 'Secretary':
        return {
          icon: FileText,
          badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
          borderColor: 'border-blue-200 hover:border-blue-400',
          accentBg: 'bg-blue-500/10 text-blue-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
          desc: 'Secretarial Desk • Schedule assemblies, record minutes & resolutions, maintain attendance and notice dispatches.'
        };
      case 'Treasurer':
        return {
          icon: Banknote,
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          borderColor: 'border-emerald-200 hover:border-emerald-400',
          accentBg: 'bg-emerald-500/10 text-emerald-600',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          desc: 'Treasury Desk • Track thrift savings, manage group collections, record loan disbursements, and reconcile cashbooks.'
        };
      default:
        return {
          icon: Users,
          badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
          borderColor: 'border-teal-200 hover:border-teal-400',
          accentBg: 'bg-teal-500/10 text-teal-600',
          buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white',
          desc: 'Member Participation Desk • View personal passbook, check active savings & loans, apply for credit, read meeting logs.'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-sm font-bold text-slate-600">Loading your cooperative group memberships...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between relative z-10 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Sahakara</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold">ERP</span>
            </h1>
            <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">Group Perspective Gateway</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto my-auto py-10 space-y-8 relative z-10">
        
        {/* Title & Instructions */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 shadow-xs mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Authenticated Member Gateway</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Member'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Please select a self-help or cooperative group to access your portal. Your active role and administrative controls will automatically adapt to your role in that group.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Group Cards Grid */}
        {myGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myGroups.map((groupItem) => {
              const cfg = getRoleCardConfig(groupItem.role);
              const RoleIcon = cfg.icon;
              const isSelected = selectingGroupId === groupItem._id;

              return (
                <div
                  key={groupItem._id}
                  onClick={() => !isSelected && handleSelectGroup(groupItem)}
                  className={`bg-white p-6 rounded-3xl border ${cfg.borderColor} shadow-soft-teal hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-5 relative overflow-hidden group`}
                >
                  <div className="space-y-4">
                    
                    {/* Top Row: Group Name & Role Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                          {groupItem.groupName}
                        </h3>
                        <p className="text-xs font-mono font-bold text-slate-500">
                          {groupItem.groupCode} • <span className="text-teal-700 font-sans">{groupItem.groupType}</span>
                        </p>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 shrink-0 ${cfg.badgeColor}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        <span>{groupItem.role}</span>
                      </div>
                    </div>

                    {/* Location & Details */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{groupItem.branch?.branchName || 'Main Branch'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{groupItem.memberCount || 0} Members</span>
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                      {cfg.desc}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={isSelected}
                    className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md ${cfg.buttonBg}`}
                  >
                    {isSelected ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Entering Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter as {groupItem.role}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Group Memberships Found</h3>
              <p className="text-xs text-slate-500">
                You are registered with the cooperative society. You can proceed to the primary member dashboard.
              </p>
            </div>
            <button
              onClick={() => navigate('/member/dashboard')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20"
            >
              Continue to Member Dashboard
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="max-w-5xl w-full mx-auto text-center pt-6 text-slate-400 text-xs font-semibold">
        Sahakara Multi-Tier Cooperative Platform • Secure Context & Role Boundary Governance
      </div>

    </div>
  );
};

export default GroupSelectionPage;
