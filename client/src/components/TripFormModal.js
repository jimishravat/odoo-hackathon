/**
 * TripFormModal Component
 * Modal form for creating and editing trip entries
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { validateTripAssignment, validateVehicleAvailability, validateDriverLicense, validateCargoCapacity, getLicenseExpiryStatus } from '../utils/validationUtils';

const TripFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  vehicles = [],
  drivers = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    tripNumber: '',
    vehicle: '',
    driver: '',
    startLocation: '',
    endLocation: '',
    startTime: '',
    endTime: '',
    distance: '',
    status: 'scheduled',
    load: '',
    fuel: '',
    rating: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationAlerts, setValidationAlerts] = useState([]);

  // Trip statuses
  const tripStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];

  // Set initial data when modal opens for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        tripNumber: initialData.tripNumber || '',
        vehicle: initialData.vehicle || '',
        driver: initialData.driver || '',
        startLocation: initialData.startLocation || '',
        endLocation: initialData.endLocation || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        distance: initialData.distance || '',
        status: initialData.status || 'scheduled',
        load: initialData.load || '',
        fuel: initialData.fuel || '',
        rating: initialData.rating || '',
        notes: initialData.notes || '',
      });
    } else {
      // Reset form for creating new trip
      setFormData({
        tripNumber: generateTripNumber(),
        vehicle: '',
        driver: '',
        startLocation: '',
        endLocation: '',
        startTime: '',
        endTime: '',
        distance: '',
        status: 'scheduled',
        load: '',
        fuel: '',
        rating: '',
        notes: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, open]);

  // Generate trip number
  const generateTripNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000);
    return `TRIP-${dateStr}-${String(random).padStart(3, '0')}`;
  };

  // Validation
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'vehicle':
        if (!value) {
          newErrors[field] = 'Vehicle is required';
        } else {
          // Check vehicle availability
          const vehicle = vehicles.find(v => v.id === parseInt(value));
          if (vehicle) {
            const availCheck = validateVehicleAvailability(vehicle);
            if (!availCheck.isAvailable) {
              newErrors[field] = availCheck.reason;
            } else {
              delete newErrors[field];
            }
          } else {
            delete newErrors[field];
          }
        }
        break;

      case 'driver':
        if (!value) {
          newErrors[field] = 'Driver is required';
        } else {
          // Check driver-vehicle compatibility
          const driver = drivers.find(d => d.id === parseInt(value));
          const vehicle = vehicles.find(v => v.id === parseInt(formData.vehicle));
          if (driver && vehicle) {
            const licenseCheck = validateDriverLicense(driver, vehicle);
            if (!licenseCheck.isValid) {
              newErrors[field] = licenseCheck.message;
            } else {
              delete newErrors[field];
            }
          } else {
            delete newErrors[field];
          }
        }
        break;

      case 'startLocation':
        if (!value) {
          newErrors[field] = 'Start location is required';
        } else if (value.length < 3) {
          newErrors[field] = 'Start location must be at least 3 characters';
        } else {
          delete newErrors[field];
        }
        break;

      case 'endLocation':
        if (!value) {
          newErrors[field] = 'End location is required';
        } else if (value.length < 3) {
          newErrors[field] = 'End location must be at least 3 characters';
        } else {
          delete newErrors[field];
        }
        break;

      case 'startTime':
        if (!value) {
          newErrors[field] = 'Start time is required';
        } else {
          delete newErrors[field];
        }
        break;

      case 'distance':
        if (!value) {
          newErrors[field] = 'Distance is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors[field] = 'Distance must be a positive number';
        } else {
          delete newErrors[field];
        }
        break;

      case 'status':
        if (!value) {
          newErrors[field] = 'Status is required';
        } else {
          delete newErrors[field];
        }
        break;

      case 'load':
        // Validate cargo capacity
        if (value && formData.vehicle) {
          const vehicle = vehicles.find(v => v.id === parseInt(formData.vehicle));
          if (vehicle) {
            const capacityValidation = validateCargoCapacity(vehicle, value);
            if (!capacityValidation.isValid) {
              newErrors[field] = capacityValidation.message;
            } else {
              delete newErrors[field];
            }
          }
        } else {
          delete newErrors[field];
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    const requiredFields = ['vehicle', 'driver', 'startLocation', 'endLocation', 'startTime', 'distance', 'status'];
    const hasErrors = requiredFields.some(field => errors[field]);
    const hasEmptyRequired = requiredFields.some(field => !formData[field]);
    return !hasErrors && !hasEmptyRequired;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
    validateField(field, formData[field]);
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    const allFields = Object.keys(formData);
    setTouched(
      allFields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {})
    );

    // Validate all fields
    allFields.forEach(field => {
      validateField(field, formData[field]);
    });

    // Comprehensive validation for trip assignment
    const driver = drivers.find(d => d.id === parseInt(formData.driver));
    const vehicle = vehicles.find(v => v.id === parseInt(formData.vehicle));

    const alerts = [];

    // Check cargo capacity
    if (vehicle && formData.load) {
      const cargoValidation = validateCargoCapacity(vehicle, formData.load);
      if (!cargoValidation.isValid) {
        alerts.push({
          type: 'error',
          message: cargoValidation.message,
        });
        setErrors(prev => ({
          ...prev,
          load: cargoValidation.message,
        }));
      }
    }

    if (driver && vehicle && formData.startTime) {
      const assignmentValidation = validateTripAssignment(driver, vehicle, formData.startTime, formData.endTime);
      
      if (!assignmentValidation.isValid) {
        alerts.push(...assignmentValidation.errors);
      }
      
      if (assignmentValidation.warnings && assignmentValidation.warnings.length > 0) {
        alerts.push(...assignmentValidation.warnings.map(w => ({ type: 'warning', message: w })));
      }
    }

    setValidationAlerts(alerts);

    if (isFormValid() && alerts.filter(a => !a.type || a.type !== 'warning').length === 0) {
      const submitData = {
        ...formData,
        distance: parseFloat(formData.distance),
        load: formData.load ? parseFloat(formData.load) : 0,
        fuel: formData.fuel ? parseFloat(formData.fuel) : 0,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        vehicle: parseInt(formData.vehicle),
        driver: parseInt(formData.driver),
      };
      onSubmit(submitData);
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    return vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : '';
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === parseInt(driverId));
    return driver ? driver.name : '';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {initialData ? 'Edit Trip' : 'Create New Trip'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Validation Alerts */}
            {validationAlerts.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {validationAlerts.map((alert, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                      • {typeof alert === 'string' ? alert : alert.message}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            )}

            {/* Trip Number (read-only for edit) */}
            <TextField
              fullWidth
              label="Trip Number"
              value={formData.tripNumber}
              disabled={initialData !== null}
              variant="outlined"
              size="small"
            />

            {/* Vehicle */}
            <FormControl fullWidth size="small" error={touched.vehicle && !!errors.vehicle}>
              <InputLabel>Vehicle *</InputLabel>
              <Select
                value={formData.vehicle}
                label="Vehicle *"
                onChange={(e) => handleInputChange('vehicle', e.target.value)}
                onBlur={() => handleBlur('vehicle')}
              >
                <MenuItem value="">Select a vehicle</MenuItem>
                {vehicles.map(vehicle => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.licensePlate})
                  </MenuItem>
                ))}
              </Select>
              {touched.vehicle && errors.vehicle && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.vehicle}
                </Typography>
              )}
            </FormControl>

            {/* Driver */}
            <FormControl fullWidth size="small" error={touched.driver && !!errors.driver}>
              <InputLabel>Driver *</InputLabel>
              <Select
                value={formData.driver}
                label="Driver *"
                onChange={(e) => handleInputChange('driver', e.target.value)}
                onBlur={() => handleBlur('driver')}
              >
                <MenuItem value="">Select a driver</MenuItem>
                {drivers.map(driver => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
              {touched.driver && errors.driver && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.driver}
                </Typography>
              )}
            </FormControl>

            {/* Vehicle & Driver Status Info */}
            {formData.vehicle && formData.driver && (
              <Box sx={{ p: 1.5, backgroundColor: '#F5F5F5', borderRadius: 1, borderLeft: '3px solid #2196F3' }}>
                {vehicles.find(v => v.id === parseInt(formData.vehicle)) && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      <strong>Vehicle Status:</strong> {vehicles.find(v => v.id === parseInt(formData.vehicle))?.status}
                    </Typography>
                  </Box>
                )}
                {drivers.find(d => d.id === parseInt(formData.driver)) && (
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      <strong>Driver License:</strong> {drivers.find(d => d.id === parseInt(formData.driver))?.licenseType || 'Not specified'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong>License Expiry:</strong> {drivers.find(d => d.id === parseInt(formData.driver))?.licenseExpiry ? new Date(drivers.find(d => d.id === parseInt(formData.driver))?.licenseExpiry).toLocaleDateString('en-IN') : 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Start Location */}
            <TextField
              fullWidth
              label="Start Location *"
              value={formData.startLocation}
              onChange={(e) => handleInputChange('startLocation', e.target.value)}
              onBlur={() => handleBlur('startLocation')}
              size="small"
              error={touched.startLocation && !!errors.startLocation}
              helperText={touched.startLocation ? errors.startLocation : ''}
            />

            {/* End Location */}
            <TextField
              fullWidth
              label="End Location *"
              value={formData.endLocation}
              onChange={(e) => handleInputChange('endLocation', e.target.value)}
              onBlur={() => handleBlur('endLocation')}
              size="small"
              error={touched.endLocation && !!errors.endLocation}
              helperText={touched.endLocation ? errors.endLocation : ''}
            />

            {/* Start Time */}
            <TextField
              fullWidth
              label="Start Time *"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              onBlur={() => handleBlur('startTime')}
              size="small"
              InputLabelProps={{ shrink: true }}
              error={touched.startTime && !!errors.startTime}
              helperText={touched.startTime ? errors.startTime : ''}
            />

            {/* End Time */}
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            {/* Distance */}
            <TextField
              fullWidth
              label="Distance (km) *"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={formData.distance}
              onChange={(e) => handleInputChange('distance', e.target.value)}
              onBlur={() => handleBlur('distance')}
              size="small"
              error={touched.distance && !!errors.distance}
              helperText={touched.distance ? errors.distance : ''}
            />

            <Grid container spacing={2}>
              {/* Load */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Load (kg)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.load}
                  onChange={(e) => handleInputChange('load', e.target.value)}
                  onBlur={() => handleBlur('load')}
                  size="small"
                  error={touched.load && !!errors.load}
                  helperText={touched.load ? errors.load : formData.vehicle && formData.load ? `Vehicle capacity: ${vehicles.find(v => v.id === parseInt(formData.vehicle))?.capacity || 0} kg` : ''}
                />
              </Grid>

              {/* Fuel */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Fuel (L)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.fuel}
                  onChange={(e) => handleInputChange('fuel', e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {/* Status */}
              <Grid item xs={6}>
                <FormControl fullWidth size="small" error={touched.status && !!errors.status}>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status *"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    onBlur={() => handleBlur('status')}
                  >
                    {tripStatuses.map(status => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.status && errors.status && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {errors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Rating */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Rating (0-5)"
                  type="number"
                  inputProps={{ step: '0.1', min: '0', max: '5' }}
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              size="small"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripFormModal;
