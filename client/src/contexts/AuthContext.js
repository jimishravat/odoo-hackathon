/**
 * Auth Context - Manages authentication state globally
 * Handles login, logout, user data, and RBAC permissions
 */

import { createContext, useCallback, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

/**
 * Role-Based Access Control (RBAC) Permissions Matrix
 * Defines what each role can do for each module
 */
export const ROLE_PERMISSIONS = {
  fleet_manager: {
    dashboard: ['read', 'write'],
    vehicles: ['create', 'read', 'update', 'delete'],
    drivers: ['create', 'read', 'update', 'delete'],
    trips: ['create', 'read', 'update', 'delete'],
    maintenance: ['create', 'read', 'update', 'delete'],
    fuel: ['create', 'read', 'update', 'delete'],
    expenses: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read', 'write', 'admin'],
  },
  dispatcher: {
    dashboard: ['read'],
    vehicles: ['read'],
    drivers: ['read', 'update'],
    trips: ['create', 'read', 'update'],
    maintenance: [],
    fuel: [],
    expenses: [],
    reports: [],
    settings: ['update_profile'],
  },
  safety_officer: {
    dashboard: ['read'],
    vehicles: ['read'],
    drivers: ['read', 'update'],
    trips: [],
    maintenance: ['read', 'update'],
    fuel: [],
    expenses: [],
    reports: ['read'],
    settings: ['read_audit', 'update_profile'],
  },
  financial_analyst: {
    dashboard: ['read'],
    vehicles: ['read'],
    drivers: [],
    trips: ['read'],
    maintenance: ['read'],
    fuel: ['read'],
    expenses: ['read'],
    reports: ['read'],
    settings: ['update_profile'],
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login({ email, password });

      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.register(userData);

      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    ROLE_PERMISSIONS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
