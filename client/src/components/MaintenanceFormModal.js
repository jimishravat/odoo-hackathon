/**
 * Maintenance Form Modal Component
 * Reusable modal for creating and editing maintenance records
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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { mockVehicles, mockMaintenance } from '../services/mockData';

const MaintenanceFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    vehicle: '',
    maintenanceType: 'Regular Service',
    scheduledDate: '',
    completedDate: '',
    status: 'scheduled',
    cost: '',
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const maintenanceTypes = [
    'Regular Service',
    'Oil Change',
    'Tire Replacement',
    'Filter Replacement',
    'Inspection',
    'Major Repair',
    'Transmission Check',
    'Brake Service',
    'Electrical Repair',
    'Other',
  ];

  const statuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        vehicle: '',
        maintenanceType: 'Regular Service',
        scheduledDate: '',
        completedDate: '',
        status: 'scheduled',
        cost: '',
        description: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle is required';
    }

    if (!formData.maintenanceType) {
      newErrors.maintenanceType = 'Maintenance type is required';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    if (formData.status === 'completed' && !formData.completedDate) {
      newErrors.completedDate = 'Completed date is required when status is completed';
    }

    if (!formData.cost || isNaN(formData.cost) || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Valid cost amount is required';
    }

    if (!formData.description || formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert cost to number
    const dataToSubmit = {
      ...formData,
      cost: parseFloat(formData.cost),
    };

    onSubmit(dataToSubmit);
  };

  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditMode ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Vehicle Selection */}
          <FormControl fullWidth error={!!errors.vehicle}>
            <InputLabel>Vehicle</InputLabel>
            <Select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              label="Vehicle"
              disabled={loading}
            >
              {mockVehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} ({vehicle.licensePlate})
                </MenuItem>
              ))}
            </Select>
            {errors.vehicle && (
              <Box sx={{ color: '#f44336', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.vehicle}
              </Box>
            )}
          </FormControl>

          {/* Maintenance Type */}
          <FormControl fullWidth error={!!errors.maintenanceType}>
            <InputLabel>Maintenance Type</InputLabel>
            <Select
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              label="Maintenance Type"
              disabled={loading}
            >
              {maintenanceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {errors.maintenanceType && (
              <Box sx={{ color: '#f44336', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.maintenanceType}
              </Box>
            )}
          </FormControl>

          {/* Scheduled Date */}
          <TextField
            name="scheduledDate"
            label="Scheduled Date"
            type="date"
            value={formData.scheduledDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.scheduledDate}
            helperText={errors.scheduledDate}
            disabled={loading}
            fullWidth
          />

          {/* Completed Date (only if status is completed) */}
          {formData.status === 'completed' && (
            <TextField
              name="completedDate"
              label="Completed Date"
              type="date"
              value={formData.completedDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.completedDate}
              helperText={errors.completedDate}
              disabled={loading}
              fullWidth
            />
          )}

          {/* Status */}
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
              disabled={loading}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
            {errors.status && (
              <Box sx={{ color: '#f44336', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.status}
              </Box>
            )}
          </FormControl>

          {/* Cost */}
          <TextField
            name="cost"
            label="Cost (₹)"
            type="number"
            value={formData.cost}
            onChange={handleChange}
            error={!!errors.cost}
            helperText={errors.cost}
            disabled={loading}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />

          {/* Description */}
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            disabled={loading}
            fullWidth
            multiline
            rows={3}
            placeholder="Detailed description of maintenance work"
          />

          {/* Notes */}
          <TextField
            name="notes"
            label="Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
            disabled={loading}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional notes or comments"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: '100px' }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceFormModal;
