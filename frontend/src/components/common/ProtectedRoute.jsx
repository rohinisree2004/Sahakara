import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying session permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect user to their own authorized dashboard if role doesn't match route
    const userDashboard = getDashboardRoute(user.role);
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
