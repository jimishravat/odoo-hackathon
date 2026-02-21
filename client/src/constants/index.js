/**
 * Application Constants
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DRIVER: 'driver',
  OPERATIONS_OFFICER: 'operations_officer',
  MAINTENANCE_OFFICER: 'maintenance_officer',
};

export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
  INACTIVE: 'inactive',
};

export const VEHICLE_FUEL_TYPES = {
  DIESEL: 'diesel',
  PETROL: 'petrol',
  CNG: 'cng',
  ELECTRIC: 'electric',
};

export const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
};

export const DRIVER_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on-leave',
  INACTIVE: 'inactive',
  RETIRED: 'retired',
};

export const MAINTENANCE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

export const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
};

export const API_TIMEOUT = 30000; // 30 seconds

export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';

export const STATUS_COLORS = {
  active: '#4CAF50',
  inactive: '#9E9E9E',
  'in-progress': '#FFC107',
  completed: '#2196F3',
  scheduled: '#FF9800',
  maintenance: '#FF9800',
  cancelled: '#F44336',
  'on-leave': '#9E9E9E',
  overdue: '#F44336',
};

export const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  'in-progress': 'In Progress',
  completed: 'Completed',
  scheduled: 'Scheduled',
  maintenance: 'Maintenance',
  cancelled: 'Cancelled',
  'on-leave': 'On Leave',
  overdue: 'Overdue',
  retired: 'Retired',
  closed: 'Closed',
};

export const NOTIFICATION_MESSAGES = {
  SUCCESS_CREATE: 'Record created successfully',
  SUCCESS_UPDATE: 'Record updated successfully',
  SUCCESS_DELETE: 'Record deleted successfully',
  ERROR_CREATE: 'Failed to create record',
  ERROR_UPDATE: 'Failed to update record',
  ERROR_DELETE: 'Failed to delete record',
  ERROR_LOAD: 'Failed to load data',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
};

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  LICENSE_PLATE: /^[A-Z]{2}-[0-9]{2}-[A-Z]{2}-[0-9]{4}$/,
  VIN: /^[A-Z0-9]{17}$/,
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  TRIPS: '/trips',
  MAINTENANCE: '/maintenance',
  FUEL: '/fuel',
  EXPENSES: '/expenses',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
};
