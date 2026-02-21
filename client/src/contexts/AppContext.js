/**
 * App Context - Manages global app state
 * Handles notifications, loading states, sidebar toggle, etc.
 */

import { createContext, useCallback, useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Initialize sidebar state: closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const isMobile = window.innerWidth < 960; // Material-UI md breakpoint
    return !isMobile; // Return false for mobile, true for desktop
  });
  
  const [notification, setNotification] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [filters, setFilters] = useState({});

  // Update sidebar state when window is resized
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 960;
      setSidebarOpen(!isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
