/**
 * TripExpenseLoggerModal Component
 * Modal for logging fuel and expenses after trip completion
 * Pre-populates with trip data and allows user to enter actual fuel consumed and costs
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
  Box,
  Typography,
  Alert,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const TripExpenseLoggerModal = ({
  open,
  onClose,
  onSubmit,
  trip = null,
  vehicle = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    fuelQuantity: '',
    pricePerLiter: '',
    fuelType: 'diesel',
    location: '',
    additionalExpenseCategory: 'none',
    additionalExpenseAmount: '',
    additionalExpenseDescription: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [calculations, setCalculations] = useState({
    fuelCost: 0,
    totalAdditionalExpenses: 0,
    totalOperationalCost: 0,
  });

  const fuelTypes = ['diesel', 'petrol', 'cng', 'electric'];
  const expenseCategories = [
    'none',
    'toll',
    'parking',
    'maintenance',
    'other',
  ];

  // Initialize form when modal opens
  useEffect(() => {
    if (open && trip) {
      setFormData({
        fuelQuantity: trip.fuel ? trip.fuel.toString() : '',
        pricePerLiter: vehicle?.fuelType ? getDefaultFuelPrice(vehicle.fuelType) : '95',
        fuelType: vehicle?.fuelType || 'diesel',
        location: 'Fuel Station',
        additionalExpenseCategory: 'none',
        additionalExpenseAmount: '',
        additionalExpenseDescription: '',
        notes: `Logged for trip ${trip.tripNumber}`,
      });
      setErrors({});
      setTouched({});
    }
  }, [open, trip, vehicle]);

  // Recalculate costs when fuel data changes
  useEffect(() => {
    calculateCosts();
  }, [formData]);

  /**
   * Get default fuel price based on fuel type
   */
  const getDefaultFuelPrice = (fuelType) => {
    const prices = {
      diesel: 95,
      petrol: 105,
      cng: 75,
      electric: 50,
    };
    return prices[fuelType] || 95;
  };

  /**
   * Calculate operational costs
   */
  const calculateCosts = () => {
    const fuelQuantity = parseFloat(formData.fuelQuantity) || 0;
    const pricePerLiter = parseFloat(formData.pricePerLiter) || 0;
    const fuelCost = fuelQuantity * pricePerLiter;
    
    const additionalExpenseAmount = parseFloat(formData.additionalExpenseAmount) || 0;
    const totalAdditionalExpenses = formData.additionalExpenseCategory !== 'none' 
      ? additionalExpenseAmount 
      : 0;

    const totalOperationalCost = fuelCost + totalAdditionalExpenses;

    setCalculations({
      fuelCost: Math.round(fuelCost * 100) / 100,
      totalAdditionalExpenses: Math.round(totalAdditionalExpenses * 100) / 100,
      totalOperationalCost: Math.round(totalOperationalCost * 100) / 100,
    });
  };

  /**
   * Handle form field changes
   */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  /**
   * Handle blur event for form fields
   */
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  /**
   * Validate individual field
   */
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'fuelQuantity':
        if (!value) {
          newErrors.fuelQuantity = 'Fuel quantity is required';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          newErrors.fuelQuantity = 'Please enter a valid fuel quantity';
        } else {
          delete newErrors.fuelQuantity;
        }
        break;
      
      case 'pricePerLiter':
        if (!value) {
          newErrors.pricePerLiter = 'Price per liter is required';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) < 0) {
          newErrors.pricePerLiter = 'Please enter a valid price';
        } else {
          delete newErrors.pricePerLiter;
        }
        break;
      
      case 'additionalExpenseAmount':
        if (formData.additionalExpenseCategory !== 'none' && !value) {
          newErrors.additionalExpenseAmount = 'Please enter expense amount';
        } else if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
          newErrors.additionalExpenseAmount = 'Please enter a valid amount';
        } else {
          delete newErrors.additionalExpenseAmount;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fuelQuantity) {
      newErrors.fuelQuantity = 'Fuel quantity is required';
    } else if (isNaN(parseFloat(formData.fuelQuantity)) || parseFloat(formData.fuelQuantity) <= 0) {
      newErrors.fuelQuantity = 'Please enter a valid fuel quantity';
    }
    
    if (!formData.pricePerLiter) {
      newErrors.pricePerLiter = 'Price per liter is required';
    } else if (isNaN(parseFloat(formData.pricePerLiter)) || parseFloat(formData.pricePerLiter) < 0) {
      newErrors.pricePerLiter = 'Please enter a valid price';
    }
    
    if (formData.additionalExpenseCategory !== 'none' && !formData.additionalExpenseAmount) {
      newErrors.additionalExpenseAmount = 'Please enter expense amount';
    } else if (formData.additionalExpenseAmount && (isNaN(parseFloat(formData.additionalExpenseAmount)) || parseFloat(formData.additionalExpenseAmount) < 0)) {
      newErrors.additionalExpenseAmount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const expenseData = {
      tripId: trip.id,
      vehicle: trip.vehicle,
      fuel: {
        quantity: parseFloat(formData.fuelQuantity),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        fuelType: formData.fuelType,
        location: formData.location,
        totalCost: calculations.fuelCost,
      },
      additionalExpense: formData.additionalExpenseCategory !== 'none' ? {
        category: formData.additionalExpenseCategory,
        amount: parseFloat(formData.additionalExpenseAmount),
        description: formData.additionalExpenseDescription,
      } : null,
      totalOperationalCost: calculations.totalOperationalCost,
      notes: formData.notes,
    };

    onSubmit(expenseData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        Log Fuel & Expenses for Trip
      </DialogTitle>

      <DialogContent>
        {trip && (
          <Box sx={{ mb: 3, mt: 2 }}>
            {/* Trip Summary */}
            <Paper sx={{ p: 2, backgroundColor: '#E3F2FD', borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Trip</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{trip.tripNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Vehicle</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{vehicle?.name || 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Distance</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{trip.distance} km</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Estimated Fuel</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{trip.fuel} L</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Fuel Information */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>Fuel Information</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fuel Consumed (Liters)"
                  type="number"
                  value={formData.fuelQuantity}
                  onChange={handleChange('fuelQuantity')}
                  onBlur={() => handleBlur('fuelQuantity')}
                  error={!!(touched.fuelQuantity && errors.fuelQuantity)}
                  helperText={touched.fuelQuantity && errors.fuelQuantity}
                  size="small"
                  placeholder="e.g., 45.5"
                  inputProps={{ step: '0.1', min: '0' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price per Liter (₹)"
                  type="number"
                  value={formData.pricePerLiter}
                  onChange={handleChange('pricePerLiter')}
                  onBlur={() => handleBlur('pricePerLiter')}
                  error={!!(touched.pricePerLiter && errors.pricePerLiter)}
                  helperText={touched.pricePerLiter && errors.pricePerLiter}
                  size="small"
                  placeholder="e.g., 95"
                  inputProps={{ step: '0.1', min: '0' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    value={formData.fuelType}
                    label="Fuel Type"
                    onChange={handleChange('fuelType')}
                  >
                    {fuelTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fuel Station Location"
                  value={formData.location}
                  onChange={handleChange('location')}
                  size="small"
                  placeholder="e.g., Mumbai Fuel Station"
                />
              </Grid>
            </Grid>

            {/* Fuel Cost Display */}
            <Paper sx={{ p: 2, backgroundColor: '#F5F5F5', borderRadius: 1, mb: 3 }}>
              <Typography variant="body2" color="textSecondary">Fuel Cost</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2196F3' }}>
                ₹{calculations.fuelCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* Additional Expenses */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Additional Expenses</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.additionalExpenseCategory}
                    label="Category"
                    onChange={handleChange('additionalExpenseCategory')}
                  >
                    {expenseCategories.map(cat => (
                      <MenuItem key={cat} value={cat}>
                        {cat === 'none' ? 'None' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {formData.additionalExpenseCategory !== 'none' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount (₹)"
                    type="number"
                    value={formData.additionalExpenseAmount}
                    onChange={handleChange('additionalExpenseAmount')}
                    onBlur={() => handleBlur('additionalExpenseAmount')}
                    error={!!(touched.additionalExpenseAmount && errors.additionalExpenseAmount)}
                    helperText={touched.additionalExpenseAmount && errors.additionalExpenseAmount}
                    size="small"
                    placeholder="e.g., 450"
                    inputProps={{ step: '1', min: '0' }}
                  />
                </Grid>
              )}
              {formData.additionalExpenseCategory !== 'none' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    value={formData.additionalExpenseDescription}
                    onChange={handleChange('additionalExpenseDescription')}
                    size="small"
                    multiline
                    rows={2}
                    placeholder="e.g., Toll for highway"
                  />
                </Grid>
              )}
            </Grid>

            {/* Total Operational Cost */}
            <Paper sx={{ p: 2.5, backgroundColor: '#E8F5E9', borderRadius: 1, mb: 3, border: '2px solid #4CAF50' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Fuel Cost</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₹{calculations.fuelCost.toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Additional Expenses</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₹{calculations.totalAdditionalExpenses.toLocaleString('en-IN')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Total Operational Cost</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                    ₹{calculations.totalOperationalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes (Optional)"
              value={formData.notes}
              onChange={handleChange('notes')}
              size="small"
              multiline
              rows={3}
              placeholder="Add any additional notes or remarks"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          disabled={loading}
          startIcon={<CancelIcon />}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#45a049' },
            '&:disabled': { backgroundColor: '#ccc' },
          }}
        >
          {loading ? 'Saving...' : 'Save & Log'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripExpenseLoggerModal;
