/**
 * Centralized API Service Layer - MOCK VERSION (Development)
 * Using localStorage-persisted mock data instead of real API calls
 * Now includes RBAC support with role-based permissions
 * Data persists across sessions using browser localStorage
 */

import {
  mockUsers,
  mockVehicles,
  mockDrivers,
  mockTrips,
  mockMaintenance,
  mockFuel,
  mockExpenses,
  mockAlerts,
  mockDashboardData,
  simulateDelay,
} from './mockData';
import { saveToStorage, STORAGE_KEYS } from '../utils/storageManager';

// Import ROLE_PERMISSIONS from AuthContext
import { ROLE_PERMISSIONS } from '../contexts/AuthContext';

// Simulate API delay for realistic behavior
const API_DELAY = 500;

// ============= AUTHENTICATION API =============
export const authAPI = {
  register: async (userData) => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: { id: Date.now(), ...userData },
      message: 'Registration successful',
    };
  },

  login: async (credentials) => {
    await simulateDelay(API_DELAY);
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user || user.password !== credentials.password) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    const rolePermissions = ROLE_PERMISSIONS[user.role] || {};

    return {
      success: true,
      data: {
        accessToken: token,
        refreshToken: `refresh-${token}`,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          permissions: rolePermissions,
        },
      },
    };
  },

  logout: async () => {
    await simulateDelay(API_DELAY);
    return { success: true, message: 'Logged out' };
  },

  getCurrentUser: async () => {
    await simulateDelay(API_DELAY);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const error = new Error('No token found');
      error.status = 401;
      throw error;
    }
    
    // Find user from mock data (using first user as default)
    const user = mockUsers[0];
    const rolePermissions = ROLE_PERMISSIONS[user.role] || {};

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        permissions: rolePermissions,
      },
    };
  },
};

// ============= VEHICLES API =============
export const vehiclesAPI = {
  list: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    let vehicles = [...mockVehicles];
    
    if (filters.status) {
      vehicles = vehicles.filter(v => v.status === filters.status);
    }
    
    return {
      success: true,
      data: vehicles,
      total: vehicles.length,
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const vehicle = mockVehicles.find(v => v.id === parseInt(id));
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: vehicle };
  },

  create: async (vehicleData) => {
    await simulateDelay(API_DELAY);
    const newVehicle = { id: Date.now(), ...vehicleData };
    mockVehicles.push(newVehicle);
    saveToStorage(STORAGE_KEYS.VEHICLES, mockVehicles);
    return { success: true, data: newVehicle, message: 'Vehicle created' };
  },

  update: async (id, vehicleData) => {
    await simulateDelay(API_DELAY);
    const vehicle = mockVehicles.find(v => v.id === parseInt(id));
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.status = 404;
      throw error;
    }
    Object.assign(vehicle, vehicleData);
    saveToStorage(STORAGE_KEYS.VEHICLES, mockVehicles);
    return { success: true, data: vehicle, message: 'Vehicle updated' };
  },

  delete: async (id) => {
    await simulateDelay(API_DELAY);
    const index = mockVehicles.findIndex(v => v.id === parseInt(id));
    if (index === -1) {
      const error = new Error('Vehicle not found');
      error.status = 404;
      throw error;
    }
    mockVehicles.splice(index, 1);
    saveToStorage(STORAGE_KEYS.VEHICLES, mockVehicles);
    return { success: true, message: 'Vehicle deleted' };
  },

  getLocation: async (id) => {
    await simulateDelay(API_DELAY);
    const vehicle = mockVehicles.find(v => v.id === parseInt(id));
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: { id, location: vehicle.location } };
  },

  getLocationHistory: async (id) => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: [
        { lat: 19.0760, lng: 72.8777, timestamp: '2024-02-21 10:00' },
        { lat: 19.0850, lng: 72.8950, timestamp: '2024-02-21 11:00' },
        { lat: 19.0900, lng: 72.8700, timestamp: '2024-02-21 12:00' },
      ],
    };
  },

  getTrips: async (id) => {
    await simulateDelay(API_DELAY);
    const trips = mockTrips.filter(t => t.vehicle === parseInt(id));
    return { success: true, data: trips };
  },

  getAnalytics: async (id) => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: {
        totalTrips: 145,
        totalDistance: 12500,
        averageFuelConsumption: 8.5,
        maintenanceCost: 15000,
        utilizationRate: 85,
      },
    };
  },
};

// ============= DRIVERS API =============
export const driversAPI = {
  list: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    let drivers = [...mockDrivers];
    
    if (filters.status) {
      drivers = drivers.filter(d => d.status === filters.status);
    }
    
    return {
      success: true,
      data: drivers,
      total: drivers.length,
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const driver = mockDrivers.find(d => d.id === parseInt(id));
    if (!driver) {
      const error = new Error('Driver not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: driver };
  },

  create: async (driverData) => {
    await simulateDelay(API_DELAY);
    const newDriver = { id: Date.now(), ...driverData };
    mockDrivers.push(newDriver);
    saveToStorage(STORAGE_KEYS.DRIVERS, mockDrivers);
    return { success: true, data: newDriver, message: 'Driver created' };
  },

  update: async (id, driverData) => {
    await simulateDelay(API_DELAY);
    const driver = mockDrivers.find(d => d.id === parseInt(id));
    if (!driver) {
      const error = new Error('Driver not found');
      error.status = 404;
      throw error;
    }
    Object.assign(driver, driverData);
    saveToStorage(STORAGE_KEYS.DRIVERS, mockDrivers);
    return { success: true, data: driver, message: 'Driver updated' };
  },

  delete: async (id) => {
    await simulateDelay(API_DELAY);
    const index = mockDrivers.findIndex(d => d.id === parseInt(id));
    if (index === -1) {
      const error = new Error('Driver not found');
      error.status = 404;
      throw error;
    }
    mockDrivers.splice(index, 1);
    saveToStorage(STORAGE_KEYS.DRIVERS, mockDrivers);
    return { success: true, message: 'Driver deleted' };
  },

  getPerformance: async (id) => {
    await simulateDelay(API_DELAY);
    const driver = mockDrivers.find(d => d.id === parseInt(id));
    if (!driver) {
      const error = new Error('Driver not found');
      error.status = 404;
      throw error;
    }
    return {
      success: true,
      data: {
        safetyRating: driver.safetyRating,
        totalTrips: driver.totalTrips,
        accidentsCount: 0,
        violationsCount: 2,
        avgRating: driver.safetyRating,
      },
    };
  },

  updateStatus: async (id, status) => {
    await simulateDelay(API_DELAY);
    const driver = mockDrivers.find(d => d.id === parseInt(id));
    if (!driver) {
      const error = new Error('Driver not found');
      error.status = 404;
      throw error;
    }
    driver.status = status;
    saveToStorage(STORAGE_KEYS.DRIVERS, mockDrivers);
    return { success: true, data: driver, message: 'Driver status updated' };
  },
};

// ============= TRIPS API =============
export const tripsAPI = {
  list: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    let trips = [...mockTrips];
    
    if (filters.status) {
      trips = trips.filter(t => t.status === filters.status);
    }
    
    return {
      success: true,
      data: trips,
      total: trips.length,
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const trip = mockTrips.find(t => t.id === parseInt(id));
    if (!trip) {
      const error = new Error('Trip not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: trip };
  },

  create: async (tripData) => {
    await simulateDelay(API_DELAY);
    const newTrip = { id: Date.now(), ...tripData };
    mockTrips.push(newTrip);
    saveToStorage(STORAGE_KEYS.TRIPS, mockTrips);
    return { success: true, data: newTrip, message: 'Trip created' };
  },

  update: async (id, tripData) => {
    await simulateDelay(API_DELAY);
    const trip = mockTrips.find(t => t.id === parseInt(id));
    if (!trip) {
      const error = new Error('Trip not found');
      error.status = 404;
      throw error;
    }
    Object.assign(trip, tripData);
    saveToStorage(STORAGE_KEYS.TRIPS, mockTrips);
    return { success: true, data: trip, message: 'Trip updated' };
  },

  delete: async (id) => {
    await simulateDelay(API_DELAY);
    const index = mockTrips.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      const error = new Error('Trip not found');
      error.status = 404;
      throw error;
    }
    mockTrips.splice(index, 1);
    saveToStorage(STORAGE_KEYS.TRIPS, mockTrips);
    return { success: true, message: 'Trip deleted' };
  },

  startTrip: async (id) => {
    await simulateDelay(API_DELAY);
    const trip = mockTrips.find(t => t.id === parseInt(id));
    if (!trip) {
      const error = new Error('Trip not found');
      error.status = 404;
      throw error;
    }
    trip.status = 'in-progress';
    trip.startTime = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.TRIPS, mockTrips);
    return { success: true, data: trip, message: 'Trip started' };
  },

  completeTrip: async (id) => {
    await simulateDelay(API_DELAY);
    const trip = mockTrips.find(t => t.id === parseInt(id));
    if (!trip) {
      const error = new Error('Trip not found');
      error.status = 404;
      throw error;
    }
    trip.status = 'completed';
    trip.endTime = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.TRIPS, mockTrips);
    return { success: true, data: trip, message: 'Trip completed' };
  },

  cancelTrip: async (id) => {
    await simulateDelay(API_DELAY);
    const trip = mockTrips.find(t => t.id === parseInt(id));
    if (!trip) {
      const error = new Error('Trip not found');
      error.status = 404;
      throw error;
    }
    trip.status = 'cancelled';
    saveToStorage(STORAGE_KEYS.TRIPS, mockTrips);
    return { success: true, data: trip, message: 'Trip cancelled' };
  },

  getTracking: async (id) => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: {
        tripId: id,
        currentLocation: { lat: 19.0850, lng: 72.8950 },
        route: [
          { lat: 19.0760, lng: 72.8777 },
          { lat: 19.0850, lng: 72.8950 },
          { lat: 19.0900, lng: 72.8700 },
        ],
      },
    };
  },
};

// ============= MAINTENANCE API =============
export const maintenanceAPI = {
  list: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    let maintenance = [...mockMaintenance];
    
    if (filters.status) {
      maintenance = maintenance.filter(m => m.status === filters.status);
    }
    
    return {
      success: true,
      data: maintenance,
      total: maintenance.length,
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const m = mockMaintenance.find(m => m.id === parseInt(id));
    if (!m) {
      const error = new Error('Maintenance record not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: m };
  },

  create: async (maintenanceData) => {
    await simulateDelay(API_DELAY);
    const newM = { id: Date.now(), ...maintenanceData };
    mockMaintenance.push(newM);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, mockMaintenance);
    return { success: true, data: newM, message: 'Maintenance scheduled' };
  },

  update: async (id, maintenanceData) => {
    await simulateDelay(API_DELAY);
    const m = mockMaintenance.find(m => m.id === parseInt(id));
    if (!m) {
      const error = new Error('Maintenance record not found');
      error.status = 404;
      throw error;
    }
    Object.assign(m, maintenanceData);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, mockMaintenance);
    return { success: true, data: m, message: 'Maintenance updated' };
  },

  delete: async (id) => {
    await simulateDelay(API_DELAY);
    const index = mockMaintenance.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
      const error = new Error('Maintenance record not found');
      error.status = 404;
      throw error;
    }
    mockMaintenance.splice(index, 1);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, mockMaintenance);
    return { success: true, message: 'Maintenance deleted' };
  },

  schedule: async (scheduleData) => {
    await simulateDelay(API_DELAY);
    const newM = { id: Date.now(), status: 'scheduled', ...scheduleData };
    mockMaintenance.push(newM);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, mockMaintenance);
    return { success: true, data: newM, message: 'Maintenance scheduled' };
  },

  logService: async (logData) => {
    await simulateDelay(API_DELAY);
    const newM = { id: Date.now(), status: 'completed', ...logData };
    mockMaintenance.push(newM);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, mockMaintenance);
    return { success: true, data: newM, message: 'Service logged' };
  },
};

// ============= FUEL API =============
export const fuelAPI = {
  list: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    let fuel = [...mockFuel];
    
    if (filters.vehicle) {
      fuel = fuel.filter(f => f.vehicle === parseInt(filters.vehicle));
    }
    
    return {
      success: true,
      data: fuel,
      total: fuel.length,
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const f = mockFuel.find(f => f.id === parseInt(id));
    if (!f) {
      const error = new Error('Fuel record not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: f };
  },

  create: async (fuelData) => {
    await simulateDelay(API_DELAY);
    const newF = { id: Date.now(), ...fuelData };
    mockFuel.push(newF);
    saveToStorage(STORAGE_KEYS.FUEL, mockFuel);
    return { success: true, data: newF, message: 'Fuel record added' };
  },

  update: async (id, fuelData) => {
    await simulateDelay(API_DELAY);
    const f = mockFuel.find(f => f.id === parseInt(id));
    if (!f) {
      const error = new Error('Fuel record not found');
      error.status = 404;
      throw error;
    }
    Object.assign(f, fuelData);
    saveToStorage(STORAGE_KEYS.FUEL, mockFuel);
    return { success: true, data: f, message: 'Fuel record updated' };
  },

  delete: async (id) => {
    await simulateDelay(API_DELAY);
    const index = mockFuel.findIndex(f => f.id === parseInt(id));
    if (index === -1) {
      const error = new Error('Fuel record not found');
      error.status = 404;
      throw error;
    }
    mockFuel.splice(index, 1);
    saveToStorage(STORAGE_KEYS.FUEL, mockFuel);
    return { success: true, message: 'Fuel record deleted' };
  },

  getAnalytics: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    const totalQuantity = mockFuel.reduce((sum, f) => sum + f.quantity, 0);
    const totalCost = mockFuel.reduce((sum, f) => sum + f.totalCost, 0);
    
    return {
      success: true,
      data: {
        totalQuantity,
        totalCost,
        averagePrice: totalCost / totalQuantity,
        fuelByType: {
          diesel: mockFuel.filter(f => f.fuelType === 'diesel').length,
          petrol: mockFuel.filter(f => f.fuelType === 'petrol').length,
          cng: mockFuel.filter(f => f.fuelType === 'cng').length,
        },
      },
    };
  },
};

// ============= EXPENSES API =============
export const expensesAPI = {
  list: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    let expenses = [...mockExpenses];
    
    if (filters.category) {
      expenses = expenses.filter(e => e.category === filters.category);
    }
    
    return {
      success: true,
      data: expenses,
      total: expenses.length,
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const e = mockExpenses.find(e => e.id === parseInt(id));
    if (!e) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: e };
  },

  create: async (expenseData) => {
    await simulateDelay(API_DELAY);
    const newE = { id: Date.now(), ...expenseData };
    mockExpenses.push(newE);
    saveToStorage(STORAGE_KEYS.EXPENSES, mockExpenses);
    return { success: true, data: newE, message: 'Expense added' };
  },

  update: async (id, expenseData) => {
    await simulateDelay(API_DELAY);
    const e = mockExpenses.find(e => e.id === parseInt(id));
    if (!e) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }
    Object.assign(e, expenseData);
    saveToStorage(STORAGE_KEYS.EXPENSES, mockExpenses);
    return { success: true, data: e, message: 'Expense updated' };
  },

  delete: async (id) => {
    await simulateDelay(API_DELAY);
    const index = mockExpenses.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }
    mockExpenses.splice(index, 1);
    saveToStorage(STORAGE_KEYS.EXPENSES, mockExpenses);
    return { success: true, message: 'Expense deleted' };
  },
};

// ============= ALERTS API =============
export const alertsAPI = {
  list: async (filters = {}) => {
    await simulateDelay(API_DELAY);
    let alerts = [...mockAlerts];
    
    if (filters.read !== undefined) {
      alerts = alerts.filter(a => a.read === filters.read);
    }
    
    return {
      success: true,
      data: alerts,
      total: alerts.length,
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const alert = mockAlerts.find(a => a.id === parseInt(id));
    if (!alert) {
      const error = new Error('Alert not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: alert };
  },

  markAsRead: async (id) => {
    await simulateDelay(API_DELAY);
    const alert = mockAlerts.find(a => a.id === parseInt(id));
    if (!alert) {
      const error = new Error('Alert not found');
      error.status = 404;
      throw error;
    }
    alert.read = true;
    saveToStorage(STORAGE_KEYS.ALERTS, mockAlerts);
    return { success: true, data: alert };
  },

  markAllAsRead: async () => {
    await simulateDelay(API_DELAY);
    mockAlerts.forEach(a => (a.read = true));
    saveToStorage(STORAGE_KEYS.ALERTS, mockAlerts);
    return { success: true, message: 'All alerts marked as read' };
  },
};

// ============= REPORTS API =============
export const reportsAPI = {
  getDashboard: async () => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: mockDashboardData,
    };
  },

  getVehicleUtilization: async () => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: {
        utilization: mockDashboardData.utilization,
        vehicles: mockVehicles,
      },
    };
  },

  getDriverPerformance: async () => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: mockDrivers.map(d => ({
        id: d.id,
        name: d.name,
        rating: d.safetyRating,
        trips: d.totalTrips,
      })),
    };
  },

  getTripAnalytics: async () => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: {
        totalTrips: mockTrips.length,
        completedTrips: mockTrips.filter(t => t.status === 'completed').length,
        inProgressTrips: mockTrips.filter(t => t.status === 'in-progress').length,
        trips: mockTrips,
      },
    };
  },

  getFuelAnalytics: async () => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: {
        totalFuel: mockFuel.reduce((sum, f) => sum + f.quantity, 0),
        totalCost: mockFuel.reduce((sum, f) => sum + f.totalCost, 0),
        fuelRecords: mockFuel,
      },
    };
  },

  exportReport: async () => {
    await simulateDelay(API_DELAY);
    return { success: true, message: 'Report exported' };
  },
};

// ============= USERS API =============
export const usersAPI = {
  list: async () => {
    await simulateDelay(API_DELAY);
    return {
      success: true,
      data: mockUsers.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      })),
    };
  },

  getById: async (id) => {
    await simulateDelay(API_DELAY);
    const user = mockUsers.find(u => u.id === parseInt(id));
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return { success: true, data: user };
  },

  create: async (userData) => {
    await simulateDelay(API_DELAY);
    const newUser = { id: Date.now(), ...userData };
    mockUsers.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, mockUsers);
    return { success: true, data: newUser, message: 'User created' };
  },

  update: async (id, userData) => {
    await simulateDelay(API_DELAY);
    const user = mockUsers.find(u => u.id === parseInt(id));
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    Object.assign(user, userData);
    saveToStorage(STORAGE_KEYS.USERS, mockUsers);
    return { success: true, data: user, message: 'User updated' };
  },

  delete: async (id) => {
    await simulateDelay(API_DELAY);
    const index = mockUsers.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    mockUsers.splice(index, 1);
    saveToStorage(STORAGE_KEYS.USERS, mockUsers);
    return { success: true, message: 'User deleted' };
  },

  updateRole: async (id, role) => {
    await simulateDelay(API_DELAY);
    const user = mockUsers.find(u => u.id === parseInt(id));
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    user.role = role;
    saveToStorage(STORAGE_KEYS.USERS, mockUsers);
    return { success: true, data: user, message: 'User role updated' };
  },
};

const apiServiceModule = null;
export default apiServiceModule;
