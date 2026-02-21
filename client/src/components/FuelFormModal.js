/**
 * FuelFormModal Component
 * Modal form for creating and editing fuel entries
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
import { mockVehicles } from '../services/mockData';

const FuelFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  vehicles = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    vehicle: '',
    date: '',
    quantity: '',
    price: '',
    fuelType: '',
    mileage: '',
    location: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fuel types available
  const fuelTypes = ['diesel', 'petrol', 'cng', 'electric'];

  // Available vehicles for the dropdown
  const availableVehicles = vehicles.length > 0 ? vehicles : mockVehicles;

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicle: initialData.vehicle || '',
        date: initialData.date || '',
        quantity: initialData.quantity || '',
        price: initialData.price || '',
        fuelType: initialData.fuelType || '',
        mileage: initialData.mileage || '',
        location: initialData.location || '',
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        vehicle: '',
        date: '',
        quantity: '',
        price: '',
        fuelType: '',
        mileage: '',
        location: '',
      });
      setErrors({});
      setTouched({});
    }
  }, [open, initialData]);

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'vehicle':
        if (!value) {
          newErrors.vehicle = 'Vehicle is required';
        } else {
          delete newErrors.vehicle;
        }
        break;

      case 'date':
        if (!value) {
          newErrors.date = 'Date is required';
        } else if (new Date(value) > new Date()) {
          newErrors.date = 'Date cannot be in the future';
        } else {
          delete newErrors.date;
        }
        break;

      case 'quantity':
        if (!value) {
          newErrors.quantity = 'Quantity is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.quantity = 'Quantity must be a positive number';
        } else if (parseFloat(value) > 1000) {
          newErrors.quantity = 'Quantity cannot exceed 1000 liters';
        } else {
          delete newErrors.quantity;
        }
        break;

      case 'price':
        if (!value) {
          newErrors.price = 'Price per liter is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.price = 'Price must be a positive number';
        } else if (parseFloat(value) > 500) {
          newErrors.price = 'Price seems unusually high';
        } else {
          delete newErrors.price;
        }
        break;

      case 'fuelType':
        if (!value) {
          newErrors.fuelType = 'Fuel type is required';
        } else {
          delete newErrors.fuelType;
        }
        break;

      case 'mileage':
        if (!value) {
          newErrors.mileage = 'Mileage is required';
        } else if (isNaN(value) || parseFloat(value) < 0) {
          newErrors.mileage = 'Mileage must be a non-negative number';
        } else if (parseFloat(value) > 9999999) {
          newErrors.mileage = 'Mileage value is invalid';
        } else {
          delete newErrors.mileage;
        }
        break;

      case 'location':
        if (!value) {
          newErrors.location = 'Fuel station location is required';
        } else if (value.trim().length < 3) {
          newErrors.location = 'Location must be at least 3 characters';
        } else {
          delete newErrors.location;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, value);
  };

  const isFormValid = () => {
    const requiredFields = ['vehicle', 'date', 'quantity', 'price', 'fuelType', 'mileage', 'location'];
    return requiredFields.every(field => formData[field] && !errors[field]);
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

    if (isFormValid()) {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        mileage: parseFloat(formData.mileage),
        totalCost: parseFloat(formData.quantity) * parseFloat(formData.price),
        vehicle: parseInt(formData.vehicle),
      };
      onSubmit(submitData);
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = availableVehicles.find(v => v.id === parseInt(vehicleId));
    return vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : '';
  };

  const calculateTotalCost = () => {
    if (formData.quantity && formData.price) {
      return (parseFloat(formData.quantity) * parseFloat(formData.price)).toFixed(2);
    }
    return '0.00';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.3rem' }}>
        {initialData ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Vehicle Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={touched.vehicle && !!errors.vehicle}>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Vehicle"
                >
                  <MenuItem value="">
                    <em>Select a vehicle</em>
                  </MenuItem>
                  {availableVehicles.map(vehicle => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.licensePlate})
                    </MenuItem>
                  ))}
                </Select>
                {touched.vehicle && errors.vehicle && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.vehicle}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Date Input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                name="date"
                label="Date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                InputLabelProps={{ shrink: true }}
                error={touched.date && !!errors.date}
                helperText={touched.date && errors.date}
              />
            </Grid>

            {/* Quantity Input */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="quantity"
                label="Quantity (Liters)"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                inputProps={{ step: '0.1', min: '0' }}
                error={touched.quantity && !!errors.quantity}
                helperText={touched.quantity && errors.quantity}
                placeholder="e.g., 45.5"
              />
            </Grid>

            {/* Price Input */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="price"
                label="Price per Liter (₹)"
                value={formData.price}
                onChange={handleChange}
                onBlur={handleBlur}
                inputProps={{ step: '0.01', min: '0' }}
                error={touched.price && !!errors.price}
                helperText={touched.price && errors.price}
                placeholder="e.g., 95.50"
              />
            </Grid>

            {/* Total Cost Display */}
            {formData.quantity && formData.price && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Total Cost: ₹{calculateTotalCost()}
                </Alert>
              </Grid>
            )}

            {/* Fuel Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={touched.fuelType && !!errors.fuelType}>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Fuel Type"
                >
                  <MenuItem value="">
                    <em>Select fuel type</em>
                  </MenuItem>
                  {fuelTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {touched.fuelType && errors.fuelType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.fuelType}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Mileage Input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                name="mileage"
                label="Mileage (km)"
                value={formData.mileage}
                onChange={handleChange}
                onBlur={handleBlur}
                inputProps={{ step: '1', min: '0' }}
                error={touched.mileage && !!errors.mileage}
                helperText={touched.mileage && errors.mileage}
                placeholder="e.g., 45000"
              />
            </Grid>

            {/* Location Input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="location"
                label="Fuel Station Location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.location && !!errors.location}
                helperText={touched.location && errors.location}
                placeholder="e.g., Mumbai Fuel Station"
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#2196F3',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1976D2',
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FuelFormModal;
