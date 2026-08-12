import React, { createContext, useState, useEffect, useCallback } from 'react';
import { storage, parseApiError } from '../utils/helpers';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const fullName = userData.name || `${firstName} ${lastName}`.trim() || 'User';

  return {
    id: userData._id || userData.id,
    _id: userData._id || userData.id,
    email: userData.email,
    firstName,
    lastName,
    name: fullName,
    role: userData.role || 'Student',
    phone: userData.phone || '',
    isEmailVerified: Boolean(userData.isEmailVerified),
    isActive: userData.isActive !== false,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => normalizeUser(storage.get('interviewiq_user')));
  const [accessToken, setAccessToken] = useState(() => storage.get('interviewiq_token'));
  const [refreshToken, setRefreshToken] = useState(() => storage.get('interviewiq_refresh_token'));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    storage.remove('interviewiq_token');
    storage.remove('interviewiq_refresh_token');
    storage.remove('interviewiq_user');
  }, []);

  const restoreSession = useCallback(async () => {
    const token = storage.get('interviewiq_token');
    const rToken = storage.get('interviewiq_refresh_token');

    if (!token && !rToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser();
      const rawUser = res?.data?.user || res?.data || res?.user;
      if (rawUser) {
        const normalized = normalizeUser(rawUser);
        setUser(normalized);
        storage.set('interviewiq_user', normalized);
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    restoreSession();

    const handleUnauthorized = () => {
      clearSession();
      setLoading(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('interviewiq:auth:unauthorized', handleUnauthorized);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('interviewiq:auth:unauthorized', handleUnauthorized);
      }
    };
  }, [restoreSession, clearSession]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const resData = res?.data || res;

      const newAccessToken = resData?.accessToken;
      const newRefreshToken = resData?.refreshToken;
      const rawUser = resData?.user;

      if (!newAccessToken || !rawUser) {
        throw new Error(res?.message || 'Login failed: Invalid server response format');
      }

      const normalized = normalizeUser(rawUser);

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(normalized);

      storage.set('interviewiq_token', newAccessToken);
      if (newRefreshToken) {
        storage.set('interviewiq_refresh_token', newRefreshToken);
      }
      storage.set('interviewiq_user', normalized);

      return { user: normalized, accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      clearSession();
      throw new Error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const register = async (userDataInput) => {
    setLoading(true);
    try {
      let payload = { ...userDataInput };
      if (!payload.firstName && payload.name) {
        const parts = payload.name.trim().split(/\s+/);
        payload.firstName = parts[0] || '';
        payload.lastName = parts.slice(1).join(' ') || '';
      }

      const res = await authService.register(payload);
      const resData = res?.data || res;

      const newAccessToken = resData?.accessToken;
      const newRefreshToken = resData?.refreshToken;
      const rawUser = resData?.user;

      if (newAccessToken && rawUser) {
        const normalized = normalizeUser(rawUser);

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(normalized);

        storage.set('interviewiq_token', newAccessToken);
        if (newRefreshToken) {
          storage.set('interviewiq_refresh_token', newRefreshToken);
        }
        storage.set('interviewiq_user', normalized);
        return { user: normalized, accessToken: newAccessToken, refreshToken: newRefreshToken };
      }

      return res;
    } catch (err) {
      clearSession();
      throw new Error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch {
      // Ignore logout network errors and proceed with clearing local session
    } finally {
      clearSession();
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    const normalized = normalizeUser(updatedUser);
    setUser(normalized);
    storage.set('interviewiq_user', normalized);
  };

  const value = {
    user,
    token: accessToken,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken && user),
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshSession: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
