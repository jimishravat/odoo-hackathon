/**
 * Driver View Modal Component
 * Read-only modal for viewing driver profile details
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

const DriverViewModal = ({ open, onClose, data = null }) => {
  if (!data) return null;

  // Get vehicle name from vehicle ID
  const vehicle = mockVehicles.find((v) => v.id === data.assignedVehicle);
  const vehicleDisplay = vehicle ? vehicle.name : 'Unassigned';

  // Status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      active: 'success',
      'on-leave': 'warning',
      suspended: 'error',
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

  // Check if license is expired
  const isLicenseExpired = new Date(data.licenseExpiry) < new Date();
  const licenseExpiryColor = isLicenseExpired ? '#f44336' : '#4caf50';

  const displayFields = [
    { label: 'License Number', value: data.licenseNumber },
    { label: 'License Expiry', value: formatDate(data.licenseExpiry), color: licenseExpiryColor },
    { label: 'Completion Rate', value: `${data.completionRate}%` },
    { label: 'Safety Score', value: `${(data.safetyRating * 20).toFixed(0)}%` },
    { label: 'Complaints', value: data.complaints },
    { label: 'Status', value: data.status, isChip: true },
    { label: 'Years of Experience', value: data.yearsExperience },
    { label: 'Assigned Vehicle', value: vehicleDisplay },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Driver Profile - {data.name}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Contact Info Grid */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Contact Information
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {data.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {data.phone}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Emergency Contact
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {data.emergencyContact}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {data.address}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Performance & Compliance Grid */}
          <Grid container spacing={1.5}>
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
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: field.color || 'inherit' }}
                      >
                        {field.value}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Personal Info */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Personal Information
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(data.dateOfBirth)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Total Trips
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {data.totalTrips}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* License Expiry Warning */}
          {isLicenseExpired && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                backgroundColor: '#ffebee',
                borderColor: '#f44336',
                border: '1px solid #f44336',
              }}
            >
              <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 500 }}>
                ⚠️ License Expired - Driver cannot be assigned to new trips
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

export default DriverViewModal;
