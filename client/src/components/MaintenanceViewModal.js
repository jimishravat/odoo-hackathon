/**
 * Maintenance View Modal Component
 * Read-only modal for viewing maintenance record details
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { mockVehicles } from '../services/mockData';

const MaintenanceViewModal = ({ open, onClose, data = null }) => {
  if (!data) return null;

  // Get vehicle name from vehicle ID
  const vehicle = mockVehicles.find((v) => v.id === data.vehicle);
  const vehicleDisplay = vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : 'N/A';

  // Status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      scheduled: 'info',
      'in-progress': 'warning',
      completed: 'success',
      cancelled: 'error',
    };
    return colorMap[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayFields = [
    { label: 'Vehicle', value: vehicleDisplay },
    { label: 'Maintenance Type', value: data.maintenanceType },
    { label: 'Scheduled Date', value: formatDate(data.scheduledDate) },
    { label: 'Completed Date', value: formatDate(data.completedDate) },
    { label: 'Status', value: data.status, isChip: true },
    { label: 'Cost', value: `₹${parseFloat(data.cost).toLocaleString('en-IN')}` },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Maintenance Record Details
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Basic Info Grid */}
          <Grid container spacing={2}>
            {displayFields.map((field, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {field.label}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {field.isChip ? (
                      <Chip
                        label={field.value.charAt(0).toUpperCase() + field.value.slice(1)}
                        color={getStatusColor(field.value)}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {field.value}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Description */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {data.description}
            </Typography>
          </Paper>

          {/* Notes */}
          {data.notes && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Notes
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {data.notes}
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

export default MaintenanceViewModal;
