/**
 * Mock Data for Development
 * All static data for the application when backend is not available
 * 
 * PERSISTENCE: Data is now persisted using localStorage
 * - Initial data loaded from JSON file
 * - Changes persist across page refreshes and browser restarts
 * - Can be reset to initial state anytime
 * - Schema migrations applied automatically for new fields
 */

import { loadFromStorage, STORAGE_KEYS } from '../utils/storageManager';

/**
 * Migrate stored vehicles to include new fields
 * Handles schema updates gracefully without losing data
 */
const migrateVehicles = (vehicles) => {
  return vehicles.map(vehicle => {
    // Add maintenanceSchedule if missing
    if (!vehicle.maintenanceSchedule) {
      vehicle.maintenanceSchedule = [];
    }
    return vehicle;
  });
};

/**
 * Migrate stored drivers to include new fields
 * Handles schema updates gracefully without losing data
 */
const migrateDrivers = (drivers) => {
  return drivers.map(driver => {
    // Add licenseType if missing - assign based on name or default to 'Truck'
    if (!driver.licenseType) {
      if (driver.name === 'Rajesh Kumar') {
        driver.licenseType = 'Truck';
      } else if (driver.name === 'Priya Singh') {
        driver.licenseType = 'Van';
      } else if (driver.name === 'Amit Patel') {
        driver.licenseType = 'Truck';
      } else {
        driver.licenseType = 'Truck'; // Default
      }
    }
    return driver;
  });
};

// Mock Users - RBAC Compliant Users
// Persisted in localStorage with key: fleetflow_users
export let mockUsers = loadFromStorage(STORAGE_KEYS.USERS, [
  {
    id: 1,
    email: 'fm@fleetflow.com',
    password: 'fm123',
    firstName: 'Rajendra',
    lastName: 'Singh',
    role: 'fleet_manager',
    phone: '9876543210',
    address: '123 Main St, Mumbai',
    createdAt: '2024-01-01',
    department: 'Operations',
  },
  {
    id: 2,
    email: 'dispatcher@fleetflow.com',
    password: 'dispatcher123',
    firstName: 'Vikram',
    lastName: 'Patel',
    role: 'dispatcher',
    phone: '9876543211',
    address: '456 Oak Ave, Pune',
    createdAt: '2024-01-05',
    department: 'Operations',
  },
  {
    id: 3,
    email: 'safety@fleetflow.com',
    password: 'safety123',
    firstName: 'Neha',
    lastName: 'Sharma',
    role: 'safety_officer',
    phone: '9876543212',
    address: '789 Pine Rd, Bangalore',
    createdAt: '2024-01-10',
    department: 'Safety & Compliance',
  },
  {
    id: 4,
    email: 'analyst@fleetflow.com',
    password: 'analyst123',
    firstName: 'Arjun',
    lastName: 'Gupta',
    role: 'financial_analyst',
    phone: '9876543213',
    address: '321 Elm St, Delhi',
    createdAt: '2024-01-15',
    department: 'Finance',
  },
]);

// Mock Vehicles - Persisted in localStorage with key: fleetflow_vehicles
let loadedVehicles = loadFromStorage(STORAGE_KEYS.VEHICLES, [
  {
    id: 1,
    name: 'Truck-001',
    licensePlate: 'MH-01-AB-1234',
    vin: '1HGBH41JXMN109186',
    type: 'Truck',
    fuelType: 'diesel',
    capacity: 5000,
    currentLoad: 3500,
    status: 'active',
    location: { lat: 19.0760, lng: 72.8777 },
    lastServiceDate: '2024-02-01',
    mileage: 45000,
    owner: 'John Doe',
    purchaseDate: '2022-05-15',
    insuranceExpiry: '2025-05-15',
    maintenanceSchedule: [
      {
        id: 1,
        type: 'Regular Service',
        scheduledDate: '2026-03-15',
        estimatedEndDate: '2026-03-17',
        status: 'scheduled',
        description: 'Oil change, filter replacement, general inspection'
      }
    ]
  },
  {
    id: 2,
    name: 'Van-002',
    licensePlate: 'MH-01-CD-5678',
    vin: '2T1BF1K84C9000001',
    type: 'Van',
    fuelType: 'petrol',
    capacity: 2000,
    currentLoad: 1200,
    status: 'out of service',
    location: { lat: 19.0850, lng: 72.8950 },
    lastServiceDate: '2024-01-15',
    mileage: 32000,
    owner: 'Jane Smith',
    purchaseDate: '2023-03-20',
    insuranceExpiry: '2025-03-20',
    maintenanceSchedule: [
      {
        id: 2,
        type: 'Engine Repair',
        scheduledDate: '2026-02-25',
        estimatedEndDate: '2026-02-28',
        status: 'scheduled',
        description: 'Engine malfunction repair'
      }
    ]
  },
  {
    id: 3,
    name: 'Car-003',
    licensePlate: 'MH-01-EF-9012',
    vin: '3G1YF21G965147256',
    type: 'Car',
    fuelType: 'cng',
    capacity: 500,
    currentLoad: 300,
    status: 'in shop',
    location: { lat: 19.0900, lng: 72.8700 },
    lastServiceDate: '2024-02-10',
    mileage: 28000,
    owner: 'Robert Johnson',
    purchaseDate: '2023-07-12',
    insuranceExpiry: '2025-07-12',
    maintenanceSchedule: [
      {
        id: 3,
        type: 'Major Service',
        scheduledDate: '2026-02-15',
        estimatedEndDate: '2026-02-22',
        status: 'ongoing',
        description: 'Complete vehicle maintenance and inspection'
      }
    ]
  },
]);

// Apply migrations to handle schema updates
export let mockVehicles = migrateVehicles(loadedVehicles);

// Mock Drivers - Persisted in localStorage with key: fleetflow_drivers
let loadedDrivers = loadFromStorage(STORAGE_KEYS.DRIVERS, [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh@fleetflow.com',
    phone: '9876543220',
    licenseNumber: 'DL-0020150091234',
    licenseType: 'Truck',
    licenseExpiry: '2026-05-20',
    status: 'active',
    assignedVehicle: 1,
    totalTrips: 145,
    completionRate: 94,
    safetyRating: 4.8,
    complaints: 2,
    yearsExperience: 8,
    address: '321 Maple Ln, City',
    emergencyContact: '9876543221',
    dateOfBirth: '1990-03-15',
  },
  {
    id: 2,
    name: 'Priya Singh',
    email: 'priya@fleetflow.com',
    phone: '9876543221',
    licenseNumber: 'DL-0020160091235',
    licenseType: 'Van',
    licenseExpiry: '2025-08-10',
    status: 'active',
    assignedVehicle: 2,
    totalTrips: 98,
    completionRate: 96,
    safetyRating: 4.6,
    complaints: 1,
    yearsExperience: 5,
    address: '654 Elm St, City',
    emergencyContact: '9876543222',
    dateOfBirth: '1992-07-22',
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit@fleetflow.com',
    phone: '9876543222',
    licenseNumber: 'DL-0020170091236',
    licenseType: 'Truck',
    licenseExpiry: '2027-02-14',
    status: 'on-leave',
    assignedVehicle: null,
    totalTrips: 156,
    completionRate: 98,
    safetyRating: 4.9,
    complaints: 0,
    yearsExperience: 10,
    address: '987 Cedar Ave, City',
    emergencyContact: '9876543223',
    dateOfBirth: '1988-11-05',
  },
]);

// Apply migrations to handle schema updates
export let mockDrivers = migrateDrivers(loadedDrivers);

// Mock Trips - Persisted in localStorage with key: fleetflow_trips
export let mockTrips = loadFromStorage(STORAGE_KEYS.TRIPS, [
  {
    id: 1,
    tripNumber: 'TRIP-2024-001',
    vehicle: 1,
    driver: 1,
    startLocation: 'Mumbai Warehouse',
    endLocation: 'Pune Distribution Center',
    startTime: '2024-02-20 08:00',
    endTime: '2024-02-20 14:30',
    distance: 148.5,
    status: 'completed',
    load: 3500,
    fuel: 45.5,
    rating: 4.8,
    notes: 'Delivery completed on time',
    fuelLogged: true,
    fuelRecordId: 1,
    expenseIds: [1],
    actualOperationalCost: 4322.5,
  },
  {
    id: 2,
    tripNumber: 'TRIP-2024-002',
    vehicle: 2,
    driver: 2,
    startLocation: 'Pune Distribution Center',
    endLocation: 'Nagpur Branch',
    startTime: '2024-02-20 15:00',
    endTime: '2024-02-21 06:00',
    distance: 312.0,
    status: 'in-progress',
    load: 1200,
    fuel: 52.0,
    rating: null,
    notes: 'In transit, ETA 06:00 AM',
    fuelLogged: false,
    fuelRecordId: null,
    expenseIds: [],
    actualOperationalCost: 0,
  },
  {
    id: 3,
    tripNumber: 'TRIP-2024-003',
    vehicle: 1,
    driver: 1,
    startLocation: 'Pune Distribution Center',
    endLocation: 'Aurangabad Warehouse',
    startTime: '2024-02-21 09:00',
    endTime: null,
    distance: 235.0,
    status: 'scheduled',
    load: 0,
    fuel: 0,
    rating: null,
    notes: 'Scheduled for tomorrow',
    fuelLogged: false,
    fuelRecordId: null,
    expenseIds: [],
    actualOperationalCost: 0,
  },
]);

// Mock Maintenance Records - Persisted in localStorage with key: fleetflow_maintenance
export let mockMaintenance = loadFromStorage(STORAGE_KEYS.MAINTENANCE, [
  {
    id: 1,
    vehicle: 1,
    maintenanceType: 'Regular Service',
    scheduledDate: '2024-03-01',
    completedDate: '2024-02-28',
    status: 'completed',
    cost: 5000,
    description: 'Oil change, filter replacement, inspection',
    notes: 'All checks passed',
  },
  {
    id: 2,
    vehicle: 3,
    maintenanceType: 'Major Repair',
    scheduledDate: '2024-02-25',
    completedDate: null,
    status: 'in-progress',
    cost: 25000,
    description: 'Engine repair and transmission check',
    notes: 'Waiting for parts',
  },
  {
    id: 3,
    vehicle: 2,
    maintenanceType: 'Tire Replacement',
    scheduledDate: '2024-03-15',
    completedDate: null,
    status: 'scheduled',
    cost: 8000,
    description: 'Replace all 4 tires',
    notes: 'Scheduled appointment',
  },
]);

// Mock Fuel Records - Persisted in localStorage with key: fleetflow_fuel
export let mockFuel = loadFromStorage(STORAGE_KEYS.FUEL, [
  {
    id: 1,
    vehicle: 1,
    tripId: 1,
    date: '2024-02-20',
    quantity: 45.5,
    price: 95,
    totalCost: 4322.5,
    fuelType: 'diesel',
    mileage: 45000,
    location: 'Mumbai Fuel Station',
  },
  {
    id: 2,
    vehicle: 2,
    tripId: 2,
    date: '2024-02-20',
    quantity: 52.0,
    price: 105,
    totalCost: 5460,
    fuelType: 'petrol',
    mileage: 32000,
    location: 'Pune Fuel Station',
  },
  {
    id: 3,
    vehicle: 1,
    tripId: null,
    date: '2024-02-19',
    quantity: 48.0,
    price: 95,
    totalCost: 4560,
    fuelType: 'diesel',
    mileage: 44920,
    location: 'Mumbai Fuel Station',
  },
]);

// Mock Expenses - SYNCED with Fuel Records - Persisted in localStorage with key: fleetflow_expenses
export let mockExpenses = loadFromStorage(STORAGE_KEYS.EXPENSES, [
  // Synced from Fuel Record 1
  {
    id: 1,
    date: '2024-02-20',
    category: 'Fuel',
    amount: 4322.5,
    vehicle: 1,
    tripId: 1,
    description: 'Diesel fuel refill - 45.5L at Mumbai Fuel Station',
    receipt: 'FUEL-001',
    status: 'approved',
    sourceType: 'fuel',
    sourceId: 1,
    notes: 'Fuel Type: diesel, Price: ₹95/L, Mileage: 45000',
  },
  // Synced from Fuel Record 2
  {
    id: 2,
    date: '2024-02-20',
    category: 'Fuel',
    amount: 5460,
    vehicle: 2,
    tripId: 2,
    description: 'Petrol fuel refill - 52.0L at Pune Fuel Station',
    receipt: 'FUEL-002',
    status: 'approved',
    sourceType: 'fuel',
    sourceId: 2,
    notes: 'Fuel Type: petrol, Price: ₹105/L, Mileage: 32000',
  },
  // Synced from Fuel Record 3
  {
    id: 3,
    date: '2024-02-19',
    category: 'Fuel',
    amount: 4560,
    vehicle: 1,
    tripId: null,
    description: 'Diesel fuel refill - 48.0L at Mumbai Fuel Station',
    receipt: 'FUEL-003',
    status: 'approved',
    sourceType: 'fuel',
    sourceId: 3,
    notes: 'Fuel Type: diesel, Price: ₹95/L, Mileage: 44920',
  },
  // Other Expenses
  {
    id: 4,
    date: '2024-02-20',
    category: 'Maintenance',
    amount: 5000,
    vehicle: 1,
    description: 'Regular service',
    receipt: 'MAINT-001',
    status: 'approved',
    sourceType: 'maintenance',
    sourceId: 1,
  },
  {
    id: 5,
    date: '2024-02-21',
    category: 'Toll',
    amount: 450,
    vehicle: 2,
    description: 'Toll charges',
    receipt: 'TOLL-001',
    status: 'pending',
    sourceType: 'other',
  },
]);

// Mock Alerts
export let mockAlerts = loadFromStorage(STORAGE_KEYS.ALERTS, [
  {
    id: 1,
    type: 'warning',
    vehicle: 3,
    message: 'Vehicle due for maintenance',
    severity: 'high',
    createdAt: '2024-02-21',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    vehicle: 2,
    message: 'Trip completed successfully',
    severity: 'low',
    createdAt: '2024-02-20',
    read: true,
  },
  {
    id: 3,
    type: 'warning',
    vehicle: 1,
    message: 'Fuel efficiency below average',
    severity: 'medium',
    createdAt: '2024-02-19',
    read: false,
  },
]);

// Mock Dashboard Data
export const mockDashboardData = {
  totalVehicles: 245,
  activeTrips: 18,
  totalDrivers: 156,
  fuelConsumed: 2450,
  utilization: {
    used: 180,
    total: 245,
  },
  completionRate: {
    completed: 1200,
    total: 1245,
  },
};

// Helper function to simulate API delay
export const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
