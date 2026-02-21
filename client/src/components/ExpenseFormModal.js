/**
 * Expense Form Modal - Create and Edit Expenses
 * Features: Form validation, auto-calculated fields, error handling
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { mockVehicles } from '../services/mockData';

const ExpenseFormModal = ({ open, onClose, onSubmit, initialData, submitting }) => {
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    vehicle: '',
    amount: '',
    description: '',
    receipt: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState({});

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        category: initialData.category || 'Fuel',
        vehicle: initialData.vehicle || '',
        amount: initialData.amount || '',
        description: initialData.description || '',
        receipt: initialData.receipt || '',
        status: initialData.status || 'pending',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'Fuel',
        vehicle: '',
        amount: '',
        description: '',
        receipt: '',
        status: 'pending',
      });
    }
    setErrors({});
  }, [initialData, open]);

  // Validation Rules
  const validateForm = () => {
    const newErrors = {};

    // Date validation
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }

    // Category validation
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Vehicle validation
    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle is required';
    }

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    // Status validation
    if (!formData.status.trim()) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Handle close
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Date */}
          <TextField
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
          />

          {/* Category */}
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              label="Category"
            >
              <MenuItem value="Fuel">Fuel</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Toll">Toll</MenuItem>
              <MenuItem value="Insurance">Insurance</MenuItem>
              <MenuItem value="Parking">Parking</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.category}
              </Typography>
            )}
          </FormControl>

          {/* Vehicle */}
          <FormControl fullWidth error={!!errors.vehicle}>
            <InputLabel>Vehicle</InputLabel>
            <Select
              value={formData.vehicle}
              onChange={(e) => handleFieldChange('vehicle', e.target.value)}
              label="Vehicle"
            >
              <MenuItem value="">Select a vehicle</MenuItem>
              {mockVehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} ({vehicle.licensePlate})
                </MenuItem>
              ))}
            </Select>
            {errors.vehicle && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.vehicle}
              </Typography>
            )}
          </FormControl>

          {/* Amount */}
          <TextField
            type="number"
            label="Amount (₹)"
            value={formData.amount}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            multiline
            rows={3}
            placeholder="Enter expense details..."
          />

          {/* Receipt */}
          <TextField
            label="Receipt Number (Optional)"
            value={formData.receipt}
            onChange={(e) => handleFieldChange('receipt', e.target.value)}
            fullWidth
            placeholder="e.g., FUEL-001, MAINT-001"
          />

          {/* Status */}
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
            {errors.status && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.status}
              </Typography>
            )}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#2196F3',
            '&:hover': {
              backgroundColor: '#1976D2',
            },
          }}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseFormModal;
