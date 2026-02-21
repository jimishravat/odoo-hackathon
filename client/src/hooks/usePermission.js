/**
 * usePermission Hook
 * Custom hook to check user permissions based on RBAC
 * 
 * Usage:
 * const { can, hasPermission } = usePermission();
 * 
 * if (can.create('trips')) { // Show create button }
 * if (can.update('drivers')) { // Show edit button }
 * if (can.delete('vehicles')) { // Show delete button }
 */

import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS } from '../contexts/AuthContext';

export const usePermission = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission on a module
   * @param {string} module - Module name (e.g., 'trips', 'drivers')
   * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
   * @returns {boolean} - True if user has permission, false otherwise
   */
  const hasPermission = (module, action) => {
    if (!user || !user.role) {
      return false;
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) {
      return false;
    }

    const modulePermissions = rolePermissions[module] || [];
    return modulePermissions.includes(action);
  };

  /**
   * Convenience object for common permission checks
   */
  const can = {
    /**
     * Check if user can create records in a module
     * @param {string} module - Module name
     * @returns {boolean}
     */
    create: (module) => hasPermission(module, 'create'),

    /**
     * Check if user can read/view records in a module
     * @param {string} module - Module name
     * @returns {boolean}
     */
    read: (module) => hasPermission(module, 'read'),

    /**
     * Check if user can update records in a module
     * @param {string} module - Module name
     * @returns {boolean}
     */
    update: (module) => hasPermission(module, 'update'),

    /**
     * Check if user can delete records in a module
     * @param {string} module - Module name
     * @returns {boolean}
     */
    delete: (module) => hasPermission(module, 'delete'),

    /**
     * Check if user has write access (create or update)
     * @param {string} module - Module name
     * @returns {boolean}
     */
    write: (module) => hasPermission(module, 'create') || hasPermission(module, 'update'),

    /**
     * Check if user is admin (fleet_manager)
     * @returns {boolean}
     */
    isAdmin: () => user?.role === 'fleet_manager',

    /**
     * Check if user is dispatcher
     * @returns {boolean}
     */
    isDispatcher: () => user?.role === 'dispatcher',

    /**
     * Check if user is safety officer
     * @returns {boolean}
     */
    isSafetyOfficer: () => user?.role === 'safety_officer',

    /**
     * Check if user is financial analyst
     * @returns {boolean}
     */
    isFinancialAnalyst: () => user?.role === 'financial_analyst',
  };

  return {
    hasPermission,
    can,
    user,
    userRole: user?.role,
  };
};
