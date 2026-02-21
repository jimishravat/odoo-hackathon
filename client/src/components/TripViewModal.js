/**
 * TripViewModal Component
 * Modal for viewing trip details
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
  Chip,
  Paper,
} from '@mui/material';
import { getCostEfficiencyStatus, calculateCostPerKm, getTripCostMetrics, formatCurrency } from '../utils/tripCostCalculator';

const TripViewModal = ({
  open,
  onClose,
  trip,
  vehicles = [],
  drivers = [],
  onLogExpenses = null,
}) => {
  if (!trip) return null;

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : 'Unknown Vehicle';
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unassigned';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#FFC107',
      'in-progress': '#2196F3',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Scheduled',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const calculateDuration = () => {
    if (!trip.startTime || !trip.endTime) return '-';
    const start = new Date(trip.startTime);
    const end = new Date(trip.endTime);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Trip Details</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Trip Header */}
          <Paper sx={{ p: 2, backgroundColor: '#F5F5F5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {trip.tripNumber}
              </Typography>
              <Chip
                label={getStatusLabel(trip.status)}
                sx={{
                  backgroundColor: getStatusColor(trip.status),
                  color: '#FFF',
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography color="textSecondary" variant="body2">
              {trip.startLocation} → {trip.endLocation}
            </Typography>
          </Paper>

          {/* Vehicle & Driver */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Vehicle
              </Typography>
              <Typography variant="body2">{getVehicleName(trip.vehicle)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Driver
              </Typography>
              <Typography variant="body2">{getDriverName(trip.driver)}</Typography>
            </Grid>
          </Grid>

          {/* Route Details */}
          <Paper sx={{ p: 2, backgroundColor: '#F9F9F9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Route Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Distance
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {trip.distance} km
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Load
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {trip.load || 0} kg
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Fuel Used
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {trip.fuel || 0} L
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Efficiency
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {trip.fuel && trip.distance
                    ? ((trip.distance / trip.fuel).toFixed(2))
                    : '-'}
                  {' '}km/L
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Time Details */}
          <Paper sx={{ p: 2, backgroundColor: '#F9F9F9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Timeline
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Start Date & Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatDate(trip.startTime)} at {formatTime(trip.startTime)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  End Date & Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {trip.endTime ? (
                    <>
                      {formatDate(trip.endTime)} at {formatTime(trip.endTime)}
                    </>
                  ) : (
                    'Not yet completed'
                  )}
                </Typography>
              </Grid>
              {trip.endTime && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {calculateDuration()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Rating */}
          {trip.rating && (
            <Paper sx={{ p: 2, backgroundColor: '#F9F9F9' }}>
              <Typography variant="caption" color="textSecondary">
                Trip Rating
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {trip.rating} / 5.0 ⭐
              </Typography>
            </Paper>
          )}

          {/* Fuel & Expense Logging Status */}
          {trip.status === 'completed' && (
            <Paper sx={{ p: 2, backgroundColor: trip.fuelLogged ? '#E8F5E9' : '#FFF3E0', borderLeft: `3px solid ${trip.fuelLogged ? '#4CAF50' : '#FF9800'}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Fuel & Expense Logging
                </Typography>
                <Chip
                  label={trip.fuelLogged ? '✓ Logged' : 'Pending'}
                  color={trip.fuelLogged ? 'success' : 'warning'}
                  variant="outlined"
                  size="small"
                />
              </Box>
              {trip.fuelLogged && trip.actualOperationalCost > 0 && (
                <Box>
                  {/* Operational Cost */}
                  <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="caption" color="textSecondary">
                      Total Operational Cost
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#4CAF50', mb: 1 }}>
                      {formatCurrency(trip.actualOperationalCost)}
                    </Typography>
                  </Box>

                  {/* Cost Efficiency Metrics */}
                  {trip.distance > 0 && (
                    <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                        Cost Efficiency
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(calculateCostPerKm(trip.actualOperationalCost, trip.distance)).toFixed(2)}₹/km
                        </Typography>
                        <Chip
                          label={getCostEfficiencyStatus(calculateCostPerKm(trip.actualOperationalCost, trip.distance)).label}
                          size="small"
                          sx={{
                            backgroundColor: getCostEfficiencyStatus(calculateCostPerKm(trip.actualOperationalCost, trip.distance)).color,
                            color: '#FFF',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Load Efficiency */}
                  {trip.load > 0 && (
                    <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                        Cost per Unit Load
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {(trip.actualOperationalCost / trip.load).toFixed(2)}₹/kg
                      </Typography>
                    </Box>
                  )}

                  {/* Profitability Status */}
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                      Trip Status
                    </Typography>
                    <Chip
                      label="✓ Cost Tracked"
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              )}
              {!trip.fuelLogged && onLogExpenses && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#FF9800',
                      '&:hover': { backgroundColor: '#F57C00' },
                    }}
                    onClick={onLogExpenses}
                  >
                    Log Fuel & Expenses
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          {/* Notes */}
          {trip.notes && (
            <Paper sx={{ p: 2, backgroundColor: '#FAFAFA', borderLeft: '3px solid #2196F3' }}>
              <Typography variant="caption" color="textSecondary">
                Notes
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#333' }}>
                {trip.notes}
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripViewModal;
