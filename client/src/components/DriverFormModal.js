/**
 * Driver Form Modal Component
 * Reusable modal for creating and editing driver profiles
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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { mockVehicles } from '../services/mockData';

const DriverFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: '',
    status: 'active',
    assignedVehicle: '',
    completionRate: 90,
    safetyRating: 4.5,
    complaints: 0,
    yearsExperience: 1,
    address: '',
    emergencyContact: '',
    dateOfBirth: '',
  });

  const [errors, setErrors] = useState({});

  const statuses = ['active', 'on-leave', 'suspended'];
  const licenseTypes = ['Truck', 'Van', 'Car'];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiry: '',
        licenseType: '',
        status: 'active',
        assignedVehicle: '',
        completionRate: 90,
        safetyRating: 4.5,
        complaints: 0,
        yearsExperience: 1,
        address: '',
        emergencyContact: '',
        dateOfBirth: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Driver name is required (min 2 characters)';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      newErrors.phone = 'Valid phone number is required (min 10 digits)';
    }

    if (!formData.licenseNumber || formData.licenseNumber.trim().length < 3) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.licenseExpiry) {
      newErrors.licenseExpiry = 'License expiry date is required';
    }

    if (!formData.licenseType) {
      newErrors.licenseType = 'License type is required';
    }

    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = 'Address is required (min 5 characters)';
    }

    if (!formData.emergencyContact || formData.emergencyContact.trim().length < 10) {
      newErrors.emergencyContact = 'Emergency contact is required (min 10 digits)';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (formData.completionRate < 0 || formData.completionRate > 100) {
      newErrors.completionRate = 'Completion rate must be between 0-100%';
    }

    if (formData.safetyRating < 0 || formData.safetyRating > 5) {
      newErrors.safetyRating = 'Safety rating must be between 0-5';
    }

    if (formData.complaints < 0) {
      newErrors.complaints = 'Complaints cannot be negative';
    }

    if (formData.yearsExperience < 0) {
      newErrors.yearsExperience = 'Years of experience cannot be negative';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'assignedVehicle' && value === '' ? '' : 
              (name === 'completionRate' || name === 'safetyRating' || 
               name === 'complaints' || name === 'yearsExperience') 
              ? parseFloat(value) : value,
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

    // Convert numeric fields
    const dataToSubmit = {
      ...formData,
      assignedVehicle: formData.assignedVehicle === '' ? null : parseInt(formData.assignedVehicle),
      completionRate: parseFloat(formData.completionRate),
      safetyRating: parseFloat(formData.safetyRating),
      complaints: parseInt(formData.complaints),
      yearsExperience: parseInt(formData.yearsExperience),
    };

    onSubmit(dataToSubmit);
  };

  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditMode ? 'Edit Driver Profile' : 'Add New Driver'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Name */}
          <TextField
            name="name"
            label="Driver Name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            fullWidth
            placeholder="Enter driver's full name"
          />

          {/* Email */}
          <TextField
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            fullWidth
            placeholder="driver@example.com"
          />

          {/* Phone */}
          <TextField
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
            disabled={loading}
            fullWidth
            placeholder="9876543210"
          />

          {/* License Number */}
          <TextField
            name="licenseNumber"
            label="License Number"
            value={formData.licenseNumber}
            onChange={handleChange}
            error={!!errors.licenseNumber}
            helperText={errors.licenseNumber}
            disabled={loading}
            fullWidth
            placeholder="DL-XXXXXXXXXXXXX"
          />

          {/* License Expiry */}
          <TextField
            name="licenseExpiry"
            label="License Expiry Date"
            type="date"
            value={formData.licenseExpiry}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.licenseExpiry}
            helperText={errors.licenseExpiry}
            disabled={loading}
            fullWidth
          />

          {/* License Type */}
          <FormControl fullWidth error={!!errors.licenseType}>
            <InputLabel>License Type</InputLabel>
            <Select
              name="licenseType"
              value={formData.licenseType}
              onChange={handleChange}
              label="License Type"
              disabled={loading}
            >
              {licenseTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {errors.licenseType && (
              <Box sx={{ color: '#f44336', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.licenseType}
              </Box>
            )}
          </FormControl>

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

          {/* Assigned Vehicle */}
          <FormControl fullWidth>
            <InputLabel>Assigned Vehicle (Optional)</InputLabel>
            <Select
              name="assignedVehicle"
              value={formData.assignedVehicle}
              onChange={handleChange}
              label="Assigned Vehicle (Optional)"
              disabled={loading}
            >
              <MenuItem value="">None</MenuItem>
              {mockVehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Completion Rate */}
          <TextField
            name="completionRate"
            label="Completion Rate (%)"
            type="number"
            value={formData.completionRate}
            onChange={handleChange}
            error={!!errors.completionRate}
            helperText={errors.completionRate}
            disabled={loading}
            fullWidth
            inputProps={{ min: '0', max: '100', step: '1' }}
          />

          {/* Safety Rating */}
          <TextField
            name="safetyRating"
            label="Safety Rating (0-5)"
            type="number"
            value={formData.safetyRating}
            onChange={handleChange}
            error={!!errors.safetyRating}
            helperText={errors.safetyRating}
            disabled={loading}
            fullWidth
            inputProps={{ min: '0', max: '5', step: '0.1' }}
          />

          {/* Complaints */}
          <TextField
            name="complaints"
            label="Number of Complaints"
            type="number"
            value={formData.complaints}
            onChange={handleChange}
            error={!!errors.complaints}
            helperText={errors.complaints}
            disabled={loading}
            fullWidth
            inputProps={{ min: '0', step: '1' }}
          />

          {/* Years of Experience */}
          <TextField
            name="yearsExperience"
            label="Years of Experience"
            type="number"
            value={formData.yearsExperience}
            onChange={handleChange}
            error={!!errors.yearsExperience}
            helperText={errors.yearsExperience}
            disabled={loading}
            fullWidth
            inputProps={{ min: '0', step: '1' }}
          />

          {/* Date of Birth */}
          <TextField
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth}
            disabled={loading}
            fullWidth
          />

          {/* Address */}
          <TextField
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            disabled={loading}
            fullWidth
            multiline
            rows={2}
            placeholder="Enter driver's address"
          />

          {/* Emergency Contact */}
          <TextField
            name="emergencyContact"
            label="Emergency Contact Number"
            value={formData.emergencyContact}
            onChange={handleChange}
            error={!!errors.emergencyContact}
            helperText={errors.emergencyContact}
            disabled={loading}
            fullWidth
            placeholder="9876543210"
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

export default DriverFormModal;
