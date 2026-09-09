import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, activeGroup, token, loading } = useAuth();
  const location = useLocation();

  const isAuthenticated = !!token || !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying session permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Group perspective check: ONLY for Members and Group Elected Executives (President, Secretary, Treasurer)
  const isGroupRole = ['Member', 'President', 'Secretary', 'Treasurer'].includes(user?.role);
  
  // Non-group roles (Super Admin, Org Admin, Branch Manager, Employee) must NEVER be sent to /select-group
  if (!isGroupRole && location.pathname === '/select-group') {
    return <Navigate to={getDashboardRoute(user?.role)} replace />;
  }

  // If user is in a group role and has not chosen an active group yet, redirect to /select-group
  if (isGroupRole && !activeGroup && location.pathname !== '/select-group') {
    return <Navigate to="/select-group" replace />;
  }

  // Check if role is allowed
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect user to their own authorized dashboard if role doesn't match route
    const userDashboard = getDashboardRoute(user.role);
    return <Navigate to={userDashboard} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
