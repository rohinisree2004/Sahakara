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
    case 'President':
    case 'Secretary':
    case 'Treasurer':
      return '/executive/dashboard';
    case 'Employee':
      return '/employee/dashboard';
    case 'Member':
      return '/member/dashboard';
    default:
      return '/login';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await getAuthUser();
          if (res.data && res.data.success) {
            setUser(res.data.data);
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

  // Login handler
  const login = async (loginIdentifier, password, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await loginUser({ loginIdentifier, password });
      if (response.data && response.data.success) {
        const { token: jwtToken, user: userData } = response.data;

        setToken(jwtToken);
        setUser(userData);

        if (rememberMe) {
          localStorage.setItem('sahakara_token', jwtToken);
          localStorage.setItem('sahakara_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('sahakara_token', jwtToken);
          sessionStorage.setItem('sahakara_user', JSON.stringify(userData));
        }

        const targetRoute = getDashboardRoute(userData.role);
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
    localStorage.removeItem('sahakara_token');
    localStorage.removeItem('sahakara_user');
    sessionStorage.removeItem('sahakara_token');
    sessionStorage.removeItem('sahakara_user');
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
