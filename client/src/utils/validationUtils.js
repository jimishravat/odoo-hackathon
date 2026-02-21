/**
 * Validation Utilities for Driver License & Vehicle Maintenance
 * Comprehensive validation functions for trip creation constraints
 */

/**
 * Check if driver has valid license for vehicle type
 * @param {Object} driver - Driver object with license info
 * @param {Object} vehicle - Vehicle object with type info
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateDriverLicense = (driver, vehicle) => {
  if (!driver || !vehicle) {
    return { isValid: false, message: 'Driver or vehicle data missing' };
  }

  // Check if driver has a license
  if (!driver.licenseNumber) {
    return { isValid: false, message: `${driver.name} does not have a valid license` };
  }

  // Check if license is expired
  const expiryDate = new Date(driver.licenseExpiry);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiryDate < today) {
    const formattedDate = expiryDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return {
      isValid: false,
      message: `${driver.name}'s license expired on ${formattedDate}. Cannot assign ${vehicle.type}.`,
    };
  }

  // Check if driver has appropriate license type for vehicle
  // If vehicle type is Truck, driver must have Truck license (licenseType)
  const vehicleType = vehicle.type?.toLowerCase() || '';

  if (driver.licenseType) {
    const driverLicenseType = driver.licenseType.toLowerCase();

    // Truck requires explicit truck license
    if (vehicleType === 'truck' && driverLicenseType !== 'truck') {
      return {
        isValid: false,
        message: `${driver.name} does not have a Truck license. Current license: ${driver.licenseType}`,
      };
    }

    // Heavy vehicles require appropriate license
    if ((vehicleType === 'bus' || vehicleType === 'truck') && driverLicenseType === 'private') {
      return {
        isValid: false,
        message: `${driver.name}'s license (${driver.licenseType}) is not valid for ${vehicle.type}. Heavy vehicle license required.`,
      };
    }
  }

  return { isValid: true, message: 'License is valid' };
};

/**
 * Check if vehicle is available (not in shop and not under maintenance)
 * @param {Object} vehicle - Vehicle object with status and maintenance info
 * @returns {Object} { isAvailable: boolean, reason: string }
 */
export const validateVehicleAvailability = (vehicle) => {
  if (!vehicle) {
    return { isAvailable: false, reason: 'Vehicle data missing' };
  }

  // Check if vehicle is in shop
  if (vehicle.status === 'in shop') {
    return {
      isAvailable: false,
      reason: `${vehicle.name} is currently in shop for maintenance and cannot be assigned to trips.`,
    };
  }

  // Check if vehicle is out of service
  if (vehicle.status === 'out of service') {
    return {
      isAvailable: false,
      reason: `${vehicle.name} is out of service and cannot be assigned to trips.`,
    };
  }

  return { isAvailable: true, reason: 'Vehicle is available' };
};

/**
 * Check if trip date conflicts with scheduled maintenance
 * @param {Object} vehicle - Vehicle object with maintenance schedule
 * @param {string} tripStartDate - Trip start date (ISO format or Date string)
 * @param {string} tripEndDate - Trip end date (ISO format or Date string)
 * @returns {Object} { hasConflict: boolean, message: string }
 */
export const validateMaintenanceSchedule = (vehicle, tripStartDate, tripEndDate) => {
  if (!vehicle || !tripStartDate) {
    return { hasConflict: false, message: 'Missing vehicle or trip date' };
  }

  // If no maintenance schedule, no conflict
  if (!vehicle.maintenanceSchedule || vehicle.maintenanceSchedule.length === 0) {
    return { hasConflict: false, message: 'No scheduled maintenance' };
  }

  const tripStart = new Date(tripStartDate);
  const tripEnd = tripEndDate ? new Date(tripEndDate) : tripStart;

  // Normalize dates to just date part (no time)
  tripStart.setHours(0, 0, 0, 0);
  tripEnd.setHours(23, 59, 59, 999);

  // Check each maintenance schedule
  for (const maintenance of vehicle.maintenanceSchedule) {
    const maintStart = new Date(maintenance.scheduledDate);
    const maintEnd = maintenance.estimatedEndDate ? new Date(maintenance.estimatedEndDate) : maintStart;

    maintStart.setHours(0, 0, 0, 0);
    maintEnd.setHours(23, 59, 59, 999);

    // Check for overlap
    // Overlap occurs if: tripStart <= maintEnd AND tripEnd >= maintStart
    if (tripStart <= maintEnd && tripEnd >= maintStart) {
      const formattedStart = maintStart.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const formattedEnd = maintEnd.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return {
        hasConflict: true,
        message: `${vehicle.name} is scheduled for maintenance from ${formattedStart} to ${formattedEnd}. Cannot create trip during this period.`,
      };
    }
  }

  return { hasConflict: false, message: 'No maintenance conflict' };
};

/**
 * Check if driver is compliant for assignment
 * @param {Object} driver - Driver object
 * @returns {Object} { isCompliant: boolean, issues: string[] }
 */
export const validateDriverCompliance = (driver) => {
  if (!driver) {
    return { isCompliant: false, issues: ['Driver data missing'] };
  }

  const issues = [];

  // Check if driver has license
  if (!driver.licenseNumber) {
    issues.push('Driver does not have a valid license number');
  }

  // Check if license is expired
  if (driver.licenseExpiry) {
    const expiryDate = new Date(driver.licenseExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      const formattedDate = expiryDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      issues.push(`License expired on ${formattedDate}`);
    }
  }

  // Check if driver is on leave
  if (driver.status === 'on-leave') {
    issues.push('Driver is currently on leave');
  }

  // Check if driver is inactive
  if (driver.status === 'inactive') {
    issues.push('Driver account is inactive');
  }

  return {
    isCompliant: issues.length === 0,
    issues: issues,
  };
};

/**
 * Comprehensive validation for trip assignment
 * @param {Object} driver - Driver object
 * @param {Object} vehicle - Vehicle object
 * @param {string} tripStartDate - Trip start date
 * @param {string} tripEndDate - Trip end date (optional)
 * @returns {Object} { isValid: boolean, errors: string[], warnings: string[] }
 */
export const validateTripAssignment = (driver, vehicle, tripStartDate, tripEndDate = null) => {
  const errors = [];
  const warnings = [];

  // Check driver license
  if (driver) {
    const licenseCheck = validateDriverLicense(driver, vehicle);
    if (!licenseCheck.isValid) {
      errors.push(licenseCheck.message);
    }

    // Check driver compliance
    const complianceCheck = validateDriverCompliance(driver);
    if (!complianceCheck.isCompliant) {
      errors.push(...complianceCheck.issues);
    }
  }

  // Check vehicle availability
  if (vehicle) {
    const availabilityCheck = validateVehicleAvailability(vehicle);
    if (!availabilityCheck.isAvailable) {
      errors.push(availabilityCheck.reason);
    }

    // Check maintenance schedule
    const maintenanceCheck = validateMaintenanceSchedule(vehicle, tripStartDate, tripEndDate);
    if (maintenanceCheck.hasConflict) {
      errors.push(maintenanceCheck.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
  };
};

/**
 * Get available vehicles for a driver
 * Filters out vehicles the driver cannot operate
 * @param {Array} vehicles - List of all vehicles
 * @param {Object} driver - Driver object
 * @returns {Array} Array of available vehicles
 */
export const getAvailableVehicles = (vehicles, driver) => {
  if (!vehicles || !driver) return [];

  return vehicles.filter(vehicle => {
    // Check vehicle status
    const availabilityCheck = validateVehicleAvailability(vehicle);
    if (!availabilityCheck.isAvailable) return false;

    // Check driver license compatibility
    const licenseCheck = validateDriverLicense(driver, vehicle);
    if (!licenseCheck.isValid) return false;

    return true;
  });
};

/**
 * Get available drivers for a vehicle on a specific date
 * Filters out drivers who cannot operate the vehicle
 * @param {Array} drivers - List of all drivers
 * @param {Object} vehicle - Vehicle object
 * @param {string} tripDate - Trip date
 * @returns {Array} Array of available drivers
 */
export const getAvailableDrivers = (drivers, vehicle, tripDate = null) => {
  if (!drivers || !vehicle) return [];

  return drivers.filter(driver => {
    // Check driver compliance
    const complianceCheck = validateDriverCompliance(driver);
    if (!complianceCheck.isCompliant) return false;

    // Check driver license compatibility
    const licenseCheck = validateDriverLicense(driver, vehicle);
    if (!licenseCheck.isValid) return false;

    return true;
  });
};

/**
 * Format license expiry status for display
 * @param {string} expiryDate - License expiry date
 * @returns {Object} { status: string, daysLeft: number, label: string, color: string }
 */
export const getLicenseExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return { status: 'invalid', daysLeft: -1, label: 'No License', color: '#F44336' };
  }

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'expired', daysLeft, label: 'Expired', color: '#F44336' };
  }

  if (daysLeft <= 30) {
    return { status: 'expiring-soon', daysLeft, label: `Expiring in ${daysLeft} days`, color: '#FF9800' };
  }

  if (daysLeft <= 90) {
    return { status: 'valid-soon-expiry', daysLeft, label: `Valid (${daysLeft} days left)`, color: '#FFC107' };
  }

  return { status: 'valid', daysLeft, label: 'Valid', color: '#4CAF50' };
};

/**
 * Check if vehicle needs maintenance soon
 * @param {Object} vehicle - Vehicle object
 * @returns {Object} { needsMaintenance: boolean, daysUntil: number, message: string }
 */
export const checkMaintenanceNeeds = (vehicle) => {
  if (!vehicle || !vehicle.maintenanceSchedule || vehicle.maintenanceSchedule.length === 0) {
    return { needsMaintenance: false, daysUntil: null, message: 'No scheduled maintenance' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const maintenance of vehicle.maintenanceSchedule) {
    const schedDate = new Date(maintenance.scheduledDate);
    schedDate.setHours(0, 0, 0, 0);

    const daysUntil = Math.ceil((schedDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil >= 0 && daysUntil <= 7) {
      return {
        needsMaintenance: true,
        daysUntil,
        message: `Maintenance scheduled in ${daysUntil} days (${schedDate.toLocaleDateString('en-IN')})`,
      };
    }
  }

  return { needsMaintenance: false, daysUntil: null, message: 'No urgent maintenance' };
};

export default {
  validateDriverLicense,
  validateVehicleAvailability,
  validateMaintenanceSchedule,
  validateDriverCompliance,
  validateTripAssignment,
  getAvailableVehicles,
  getAvailableDrivers,
  getLicenseExpiryStatus,
  checkMaintenanceNeeds,
};
