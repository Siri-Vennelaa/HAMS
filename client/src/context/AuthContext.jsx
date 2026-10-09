import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on application mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Always query /auth/me to verify token cryptographically & fetch live server role
          const result = await authService.getMe();
          if (result && result.success && result.data) {
            setUser(result.data.user);
            setDoctorProfile(result.data.doctorProfile || null);
            setToken(storedToken);
          } else {
            // Invalid data returned, clear state
            logout();
          }
        } catch (error) {
          console.warn('[AuthContext] Session invalid or expired. Logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res && res.success && res.data) {
      const { user: userData, doctorProfile: docData, token: newToken } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setDoctorProfile(docData || null);
      return res.data;
    }
    throw new Error(res?.message || 'Failed to authenticate');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setDoctorProfile(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const updateDoctorProfile = (updatedProfile) => {
    setDoctorProfile((prev) => ({ ...prev, ...updatedProfile }));
  };

  const value = {
    user,
    doctorProfile,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUserProfile,
    updateDoctorProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
