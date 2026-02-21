/**
 * Utility Functions
 */

import { STATUS_LABELS, STATUS_COLORS } from '../constants';

/**
 * Format status to readable label
 */
export const formatStatus = (status) => {
  return STATUS_LABELS[status] || status;
};

/**
 * Get color for status
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#757575';
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = '₹') => {
  if (!amount && amount !== 0) return '-';
  return `${currency} ${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date
 */
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '-';
  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year);
};

/**
 * Format time
 */
export const formatTime = (time) => {
  if (!time) return '-';
  const date = new Date(time);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format datetime
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  const date = new Date(datetime);
  return date.toLocaleString('en-IN');
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert snake_case to readable text
 */
export const formatLabel = (label) => {
  return label
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  const queryParts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
};

/**
 * Parse query string to object
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Calculate distance between two coordinates
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

/**
 * Get role permissions
 */
export const getRolePermissions = (role) => {
  const permissions = {
    admin: ['all'],
    manager: ['view_all', 'create', 'edit', 'reports'],
    driver: ['view_own', 'update_profile'],
    operations_officer: ['view_all', 'create_trips', 'manage_trips'],
    maintenance_officer: ['view_maintenance', 'create_maintenance', 'edit_maintenance'],
  };
  return permissions[role] || [];
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, permission) => {
  const permissions = getRolePermissions(userRole);
  return permissions.includes('all') || permissions.includes(permission);
};
