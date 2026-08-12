import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/helpers';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.get('interviewiq_user'));
  const [token, setToken] = useState(() => storage.get('interviewiq_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          if (res?.data?.user) {
            setUser(res.data.user);
            storage.set('interviewiq_user', res.data.user);
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);


  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const { token: newToken, user: userData } = res.data || {};

      setToken(newToken);
      setUser(userData);
      storage.set('interviewiq_token', newToken);
      storage.set('interviewiq_user', userData);

      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userDataInput) => {
    setLoading(true);
    try {
      const res = await authService.register(userDataInput);
      const { token: newToken, user: userData } = res.data || {};

      if (newToken && userData) {
        setToken(newToken);
        setUser(userData);
        storage.set('interviewiq_token', newToken);
        storage.set('interviewiq_user', userData);
      }

      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    storage.remove('interviewiq_token');
    storage.remove('interviewiq_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    storage.set('interviewiq_user', updatedUser);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
