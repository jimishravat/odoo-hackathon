/**
 * FuelViewModal Component
 * Modal for viewing fuel entry details
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
} from '@mui/material';
import { mockVehicles } from '../services/mockData';

const FuelViewModal = ({ open, onClose, fuelData, vehicles = [] }) => {
  const availableVehicles = vehicles.length > 0 ? vehicles : mockVehicles;

  const getVehicleName = (vehicleId) => {
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getFuelTypeColor = (fuelType) => {
    const colorMap = {
      diesel: '#D4A017',
      petrol: '#FF6B6B',
      cng: '#4ECDC4',
      electric: '#95E1D3',
    };
    return colorMap[fuelType] || '#999999';
  };

  const DetailRow = ({ label, value, variant = 'body2' }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', minWidth: 120 }}>
        {label}:
      </Typography>
      <Typography variant={variant} sx={{ textAlign: 'right', flex: 1 }}>
        {value}
      </Typography>
    </Box>
  );

  if (!fuelData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.3rem', pb: 1 }}>
        Fuel Entry Details
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            mb: 2,
          }}
        >
          {/* Vehicle Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2196F3' }}>
              Vehicle Information
            </Typography>
            <DetailRow label="Vehicle" value={getVehicleName(fuelData.vehicle)} />
            <DetailRow label="Mileage" value={`${fuelData.mileage?.toLocaleString('en-IN') || 'N/A'} km`} />
          </Box>

          {/* Fuel Details Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2196F3' }}>
              Fuel Details
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                  Fuel Type:
                </Typography>
                <Chip
                  label={fuelData.fuelType?.charAt(0).toUpperCase() + fuelData.fuelType?.slice(1)}
                  sx={{
                    backgroundColor: getFuelTypeColor(fuelData.fuelType),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
            <DetailRow label="Quantity" value={`${fuelData.quantity?.toFixed(2)} liters`} />
            <DetailRow label="Price per Liter" value={formatCurrency(fuelData.price)} />
            <DetailRow label="Total Cost" value={formatCurrency(fuelData.totalCost)} variant="body1" />
          </Box>

          {/* Location & Date Section */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2196F3' }}>
              Location & Date
            </Typography>
            <DetailRow label="Location" value={fuelData.location} />
            <DetailRow label="Date" value={formatDate(fuelData.date)} />
          </Box>
        </Paper>

        {/* Summary Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#E3F2FD',
            borderLeft: '4px solid #2196F3',
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565C0', mb: 1 }}>
            Summary
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {fuelData.quantity?.toFixed(2)} liters of {fuelData.fuelType} fuel refilled at{' '}
            {fuelData.location} on {formatDate(fuelData.date)} with a total cost of{' '}
            <span style={{ fontWeight: 600, color: '#1565C0' }}>
              {formatCurrency(fuelData.totalCost)}
            </span>
            .
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#2196F3',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1976D2',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FuelViewModal;
