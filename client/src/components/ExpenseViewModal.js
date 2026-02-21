/**
 * Expense View Modal - Display Expense Details
 * Features: Read-only detailed view of expense records
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import { mockVehicles } from '../services/mockData';

const ExpenseViewModal = ({ open, onClose, expense }) => {
  if (!expense) return null;

  // Helper functions
  const getVehicleName = (vehicleId) => {
    if (!vehicleId) return 'No Vehicle';
    const vehicle = mockVehicles.find((v) => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const getVehicleLicensePlate = (vehicleId) => {
    if (!vehicleId) return '-';
    const vehicle = mockVehicles.find((v) => v.id === vehicleId);
    return vehicle ? vehicle.licensePlate : '-';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      approved: 'success',
      pending: 'warning',
      rejected: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Fuel': '#FF6B6B',
      'Maintenance': '#4ECDC4',
      'Toll': '#45B7D1',
      'Insurance': '#96CEB4',
      'Parking': '#FFEAA7',
      'Other': '#DFE6E9',
    };
    return colorMap[category] || '#DFE6E9';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
        Expense Details
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Date Section */}
          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              DATE
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
              {formatDate(expense.date)}
            </Typography>
          </Paper>

          {/* Category & Status Section */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                CATEGORY
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={expense.category}
                  size="small"
                  sx={{
                    backgroundColor: getCategoryColor(expense.category),
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                STATUS
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                  color={getStatusColor(expense.status)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Paper>
          </Box>

          {/* Vehicle Section */}
          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              VEHICLE
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
              {getVehicleName(expense.vehicle)}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
              License Plate: {getVehicleLicensePlate(expense.vehicle)}
            </Typography>
          </Paper>

          {/* Amount Section */}
          <Paper sx={{ p: 2, backgroundColor: '#E3F2FD' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              AMOUNT
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 0.5, fontWeight: 600, color: '#2196F3' }}
            >
              ₹{parseFloat(expense.amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>

          {/* Description Section */}
          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              DESCRIPTION
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6, color: '#555' }}>
              {expense.description}
            </Typography>
          </Paper>

          {/* Receipt Section (if available) */}
          {expense.receipt && (
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                RECEIPT NUMBER
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', fontWeight: 500 }}>
                {expense.receipt}
              </Typography>
            </Paper>
          )}

          {/* Meta Information */}
          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  RECORD ID
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                  {expense.id}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <Button onClick={onClose} variant="contained" sx={{
          backgroundColor: '#2196F3',
          '&:hover': {
            backgroundColor: '#1976D2',
          },
        }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseViewModal;
