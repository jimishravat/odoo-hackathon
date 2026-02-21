/**
 * App Context - Manages global app state
 * Handles notifications, loading states, sidebar toggle, etc.
 */

import { createContext, useCallback, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const showNotification = useCallback((message, severity = 'info', duration = 3000) => {
    setNotification({
      message,
      severity,
      id: Date.now(),
    });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const value = {
    sidebarOpen,
    toggleSidebar,
    notification,
    showNotification,
    hideNotification,
    globalLoading,
    setGlobalLoading,
    filters,
    updateFilters,
    clearFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
