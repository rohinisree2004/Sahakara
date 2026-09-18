import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  getAuthUser,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetUserPassword,
  logoutUser,
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Map role to target dashboard route
export const getDashboardRoute = (role) => {
  switch (role) {
    case 'Super Admin':
      return '/super-admin/dashboard';
    case 'Organization Admin':
      return '/org-admin/dashboard';
    case 'Branch Manager':
      return '/branches/dashboard';
    case 'President':
      return '/executive/dashboard';
    case 'Secretary':
      return '/secretary/dashboard';
    case 'Treasurer':
      return '/treasurer/dashboard';
    case 'Employee':
      return '/employee/dashboard';
    case 'Member':
      return '/member/dashboard';
    default:
      return '/member/dashboard';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeGroup, setActiveGroup] = useState(
    JSON.parse(localStorage.getItem('sahakara_active_group') || sessionStorage.getItem('sahakara_active_group') || 'null')
  );
  const [token, setToken] = useState(
    localStorage.getItem('sahakara_token') || sessionStorage.getItem('sahakara_token') || null
  );
  const [loading, setLoading] = useState(true);

  // Load authenticated user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken =
        localStorage.getItem('sahakara_token') || sessionStorage.getItem('sahakara_token');
      const storedUser =
        localStorage.getItem('sahakara_user') || sessionStorage.getItem('sahakara_user');
      const storedRole =
        localStorage.getItem('sahakara_active_role') || sessionStorage.getItem('sahakara_active_role');
      const storedGroup =
        localStorage.getItem('sahakara_active_group') || sessionStorage.getItem('sahakara_active_group');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (storedRole) parsedUser.role = storedRole;
          setUser(parsedUser);
          if (storedGroup) setActiveGroup(JSON.parse(storedGroup));
          setToken(storedToken);

          // Verify with backend
          const res = await getAuthUser();
          if (res.data && res.data.success) {
            const freshUser = res.data.data;
            if (storedRole) freshUser.role = storedRole;
            setUser(freshUser);
          }
        } catch (err) {
          console.warn('[Auth Session Expired]:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Switch Active Group & Dynamic Role
  const switchActiveGroup = (group, newRole) => {
    const roleToSet = newRole || group.role || 'Member';
    setActiveGroup(group);

    setUser(prevUser => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser, role: roleToSet, activeGroup: group };
      localStorage.setItem('sahakara_user', JSON.stringify(updatedUser));
      sessionStorage.setItem('sahakara_user', JSON.stringify(updatedUser));
      return updatedUser;
    });

    localStorage.setItem('sahakara_active_group', JSON.stringify(group));
    sessionStorage.setItem('sahakara_active_group', JSON.stringify(group));
    localStorage.setItem('sahakara_active_role', roleToSet);
    sessionStorage.setItem('sahakara_active_role', roleToSet);

    return getDashboardRoute(roleToSet);
  };

  // Login handler
  const login = async (loginIdentifier, password, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await loginUser({ loginIdentifier, password });
      if (response.data && response.data.success) {
        const { token: jwtToken, user: userData } = response.data;

        // Reset previous active group selection so user always lands on fresh group selector
        localStorage.removeItem('sahakara_active_group');
        sessionStorage.removeItem('sahakara_active_group');
        localStorage.removeItem('sahakara_active_role');
        sessionStorage.removeItem('sahakara_active_role');
        setActiveGroup(null);

        setToken(jwtToken);
        setUser(userData);

        if (rememberMe) {
          localStorage.setItem('sahakara_token', jwtToken);
          localStorage.setItem('sahakara_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('sahakara_token', jwtToken);
          sessionStorage.setItem('sahakara_user', JSON.stringify(userData));
        }

        // Members always land on Group Selection Page first to choose a group and determine their position
        // (President, Secretary, Treasurer positions are resolved at group selection time)
        const isGroupMemberRole = userData.role === 'Member';
        const targetRoute = isGroupMemberRole ? '/select-group' : getDashboardRoute(userData.role);

        return { success: true, user: userData, targetRoute };
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {}
    setToken(null);
    setUser(null);
    setActiveGroup(null);
    localStorage.removeItem('sahakara_token');
    localStorage.removeItem('sahakara_user');
    localStorage.removeItem('sahakara_active_role');
    localStorage.removeItem('sahakara_active_group');
    sessionStorage.removeItem('sahakara_token');
    sessionStorage.removeItem('sahakara_user');
    sessionStorage.removeItem('sahakara_active_role');
    sessionStorage.removeItem('sahakara_active_group');
  };

  // Forgot password OTP request
  const forgotPassword = async (email) => {
    return await sendForgotPasswordOTP({ email });
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    return await verifyForgotPasswordOTP({ email, otp });
  };

  // Reset password
  const resetPassword = async (email, newPassword, resetToken) => {
    return await resetUserPassword({ email, newPassword, resetToken });
  };

  const value = {
    user,
    activeGroup,
    switchActiveGroup,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
