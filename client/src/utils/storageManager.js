/**
 * LocalStorage Persistence Layer
 * 
 * Manages mock data persistence using browser's localStorage
 * Provides automatic loading and saving of data across sessions
 * Falls back to initial data if localStorage is empty
 */

// Storage keys
const STORAGE_KEYS = {
  USERS: 'fleetflow_users',
  VEHICLES: 'fleetflow_vehicles',
  DRIVERS: 'fleetflow_drivers',
  TRIPS: 'fleetflow_trips',
  MAINTENANCE: 'fleetflow_maintenance',
  FUEL: 'fleetflow_fuel',
  EXPENSES: 'fleetflow_expenses',
  ALERTS: 'fleetflow_alerts',
  DASHBOARD: 'fleetflow_dashboard',
};

/**
 * Initialize localStorage with initial data from JSON
 * Only runs if localStorage is empty
 * 
 * @param {Object} initialData - Initial data object from JSON
 */
export const initializeStorage = (initialData) => {
  try {
    // Check if data already exists in localStorage
    const existingData = localStorage.getItem(STORAGE_KEYS.FUEL);
    
    if (!existingData) {
      // First time initialization - load from JSON
      console.log('🔄 Initializing localStorage with seed data...');
      
      if (initialData.users) saveToStorage(STORAGE_KEYS.USERS, initialData.users);
      if (initialData.vehicles) saveToStorage(STORAGE_KEYS.VEHICLES, initialData.vehicles);
      if (initialData.drivers) saveToStorage(STORAGE_KEYS.DRIVERS, initialData.drivers);
      if (initialData.trips) saveToStorage(STORAGE_KEYS.TRIPS, initialData.trips);
      if (initialData.fuel) saveToStorage(STORAGE_KEYS.FUEL, initialData.fuel);
      if (initialData.expenses) saveToStorage(STORAGE_KEYS.EXPENSES, initialData.expenses);
      
      console.log('✅ localStorage initialized successfully');
    } else {
      console.log('✅ Using existing localStorage data');
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

/**
 * Save data to localStorage
 * 
 * @param {string} key - Storage key
 * @param {*} data - Data to save
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
  }
};

/**
 * Load data from localStorage
 * 
 * @param {string} key - Storage key
 * @param {*} fallback - Fallback data if not found
 * @returns {*} - Stored data or fallback
 */
export const loadFromStorage = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error(`Failed to load from localStorage (${key}):`, error);
    return fallback;
  }
};

/**
 * Clear all data from localStorage and reinitialize with seed data
 * Useful for "Reset to Defaults" functionality
 * 
 * @param {Object} initialData - Initial data to reset to
 */
export const clearAndReinitialize = (initialData) => {
  try {
    console.log('🔄 Clearing all localStorage data and reinitializing...');
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reinitialize with fresh data
    initializeStorage(initialData);
    console.log('✅ Data reset to initial state');
    
    // Trigger a reload so changes take effect
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear and reinitialize:', error);
  }
};

/**
 * Get all storage statistics
 * Useful for debugging
 * 
 * @returns {Object} - Storage statistics
 */
export const getStorageStats = () => {
  const stats = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      stats[name] = {
        count: Array.isArray(parsed) ? parsed.length : 1,
        sizeKB: (new Blob([data]).size / 1024).toFixed(2),
      };
    }
  });
  
  return stats;
};

/**
 * Export all data from localStorage as JSON
 * Useful for backup/debugging
 * 
 * @returns {Object} - All stored data
 */
export const exportAllData = () => {
  const allData = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const data = localStorage.getItem(key);
    if (data) {
      allData[name] = JSON.parse(data);
    }
  });
  
  return allData;
};

/**
 * Import data from JSON into localStorage
 * 
 * @param {Object} importData - Data to import
 */
export const importData = (importData) => {
  try {
    console.log('📥 Importing data into localStorage...');
    
    if (importData.users) saveToStorage(STORAGE_KEYS.USERS, importData.users);
    if (importData.vehicles) saveToStorage(STORAGE_KEYS.VEHICLES, importData.vehicles);
    if (importData.drivers) saveToStorage(STORAGE_KEYS.DRIVERS, importData.drivers);
    if (importData.trips) saveToStorage(STORAGE_KEYS.TRIPS, importData.trips);
    if (importData.maintenance) saveToStorage(STORAGE_KEYS.MAINTENANCE, importData.maintenance);
    if (importData.fuel) saveToStorage(STORAGE_KEYS.FUEL, importData.fuel);
    if (importData.expenses) saveToStorage(STORAGE_KEYS.EXPENSES, importData.expenses);
    
    console.log('✅ Data imported successfully');
  } catch (error) {
    console.error('Failed to import data:', error);
  }
};

export { STORAGE_KEYS };
