/**
 * Drivers Page - Driver Management Module
 * Features: Manage driver profiles, license tracking, safety scores, performance metrics
 * Added: Search, Filters, Grouping, and Sorting functionality
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WarningIcon from '@mui/icons-material/Warning';
import MainLayout from '../components/MainLayout';
import DriverFormModal from '../components/DriverFormModal';
import DriverViewModal from '../components/DriverViewModal';
import { useApp } from '../hooks/useApp';
import { driversAPI } from '../services/api';

const Drivers = () => {
  const { showNotification } = useApp();

  // State Management
  const [driverRecords, setDriverRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLicenseStatus, setFilterLicenseStatus] = useState(''); // all, valid, expired
  const [groupBy, setGroupBy] = useState('none'); // none, status, experience
  const [sortBy, setSortBy] = useState('name'); // name, safetyScore, completionRate, complaints

  // Load driver records on component mount
  useEffect(() => {
    loadDriverRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDriverRecords = async () => {
    try {
      setLoading(true);
      const response = await driversAPI.list();
      if (response.success) {
        setDriverRecords(response.data || []);
      }
    } catch (error) {
      showNotification(error.message || 'Failed to load driver records', 'error');
      setDriverRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if license is expired
  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  // Handle Create
  const handleOpenCreateModal = () => {
    setSelectedDriver(null);
    setFormModalOpen(true);
  };

  // Handle Edit
  const handleOpenEditModal = (driver) => {
    setSelectedDriver(driver);
    setFormModalOpen(true);
  };

  // Handle View
  const handleOpenViewModal = (driver) => {
    setSelectedDriver(driver);
    setViewModalOpen(true);
  };

  // Handle Form Submission (Create/Update)
  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);

      if (selectedDriver) {
        // Update existing driver
        const response = await driversAPI.update(selectedDriver.id, formData);
        if (response.success) {
          showNotification('Driver profile updated successfully', 'success');
          setFormModalOpen(false);
          await loadDriverRecords();
        }
      } else {
        // Create new driver
        const response = await driversAPI.create(formData);
        if (response.success) {
          showNotification('Driver added successfully', 'success');
          setFormModalOpen(false);
          await loadDriverRecords();
        }
      }
    } catch (error) {
      showNotification(error.message || 'Failed to save driver record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete - Open Confirmation Dialog
  const handleOpenDeleteDialog = (driver) => {
    setSelectedDriver(driver);
    setDeleteDialogOpen(true);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      const response = await driversAPI.delete(selectedDriver.id);
      if (response.success) {
        showNotification('Driver removed successfully', 'success');
        setDeleteDialogOpen(false);
        setSelectedDriver(null);
        await loadDriverRecords();
      }
    } catch (error) {
      showNotification(error.message || 'Failed to delete driver record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: 'success',
      'on-leave': 'warning',
      suspended: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getSafetyScoreColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'info';
    if (rating >= 3.0) return 'warning';
    return 'error';
  };

  // Pagination
  // Removed pagination for now - all records shown in groups

  // Filter and search logic
  const getFilteredRecords = () => {
    let filtered = [...driverRecords];

    // Search by name or license number
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchLower) ||
          driver.licenseNumber.toLowerCase().includes(searchLower) ||
          driver.email.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((driver) => driver.status === filterStatus);
    }

    // Filter by license status
    if (filterLicenseStatus) {
      if (filterLicenseStatus === 'expired') {
        filtered = filtered.filter((driver) => isLicenseExpired(driver.licenseExpiry));
      } else if (filterLicenseStatus === 'valid') {
        filtered = filtered.filter((driver) => !isLicenseExpired(driver.licenseExpiry));
      }
    }

    return filtered;
  };

  // Sorting logic
  const getSortedRecords = (records) => {
    const sorted = [...records];

    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'safetyScore':
        sorted.sort((a, b) => b.safetyRating - a.safetyRating);
        break;
      case 'completionRate':
        sorted.sort((a, b) => b.completionRate - a.completionRate);
        break;
      case 'complaints':
        sorted.sort((a, b) => a.complaints - b.complaints);
        break;
      default:
        break;
    }

    return sorted;
  };

  // Grouping logic
  const getGroupedRecords = () => {
    const filtered = getSortedRecords(getFilteredRecords());

    if (groupBy === 'none') {
      return [{ name: '', records: filtered }];
    }

    const grouped = {};

    filtered.forEach((driver) => {
      let groupKey;

      if (groupBy === 'status') {
        groupKey = driver.status.charAt(0).toUpperCase() + driver.status.slice(1);
      } else if (groupBy === 'experience') {
        groupKey =
          driver.yearsExperience >= 10
            ? '10+ Years'
            : driver.yearsExperience >= 5
            ? '5-10 Years'
            : 'Below 5 Years';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(driver);
    });

    return Object.entries(grouped).map(([name, records]) => ({ name, records }));
  };

  const filteredAndGroupedRecords = getGroupedRecords();
  const totalRecords = getFilteredRecords().length;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterLicenseStatus('');
    setGroupBy('none');
    setSortBy('name');
  };

  return (
    <MainLayout>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Drivers
          </Typography>
          <Typography color="textSecondary">
            Manage driver profiles, licenses, and performance metrics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          sx={{
            backgroundColor: '#2196F3',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#1976D2',
            },
          }}
        >
          Add Driver
        </Button>
      </Box>

      {/* Search and Filter Section */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Search Bar */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by driver name, license number, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#2196F3' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchTerm('');
                    }}
                    sx={{ color: '#2196F3' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fff',
                '&:hover fieldset': {
                  borderColor: '#2196F3',
                },
              },
            }}
          />
        </Box>

        {/* Filters and Group By */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                }}
                label="Filter by Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on-leave">On Leave</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by License</InputLabel>
              <Select
                value={filterLicenseStatus}
                onChange={(e) => {
                  setFilterLicenseStatus(e.target.value);
                }}
                label="Filter by License"
              >
                <MenuItem value="">All Licenses</MenuItem>
                <MenuItem value="valid">Valid</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                onChange={(e) => {
                  setGroupBy(e.target.value);
                }}
                label="Group By"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                }}
                label="Sort By"
              >
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="safetyScore">Safety Score (High to Low)</MenuItem>
                <MenuItem value="completionRate">Completion Rate (High to Low)</MenuItem>
                <MenuItem value="complaints">Complaints (Low to High)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Clear Filters Button */}
        <Grid container spacing={2} sx={{ mt: 0, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                color: '#2196F3',
                borderColor: '#2196F3',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                  borderColor: '#1976D2',
                  color: '#1976D2',
                },
              }}
            >
              Clear All Filters
            </Button>
          </Grid>
        </Grid>

        {/* Results Info */}
        {(searchTerm || filterStatus || filterLicenseStatus || groupBy !== 'none' || sortBy !== 'name') && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="textSecondary">
              Showing <strong>{totalRecords}</strong> driver
              {totalRecords !== 1 ? 's' : ''} of <strong>{driverRecords.length}</strong>
            </Typography>
          </Box>
        )}
      </Paper>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress sx={{ color: '#2196F3' }} />
        </Box>
      ) : getFilteredRecords().length === 0 ? (
        /* Empty State */
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            No drivers found matching your filters
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              backgroundColor: '#2196F3',
              '&:hover': {
                backgroundColor: '#1976D2',
              },
            }}
          >
            Add First Driver
          </Button>
        </Paper>
      ) : (
        /* Data Table with Grouping */
        <Box>
          {filteredAndGroupedRecords.map((group, groupIndex) => (
            <Box key={groupIndex} sx={{ mb: 3 }}>
              {/* Group Header */}
              {group.name && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#2196F3',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {group.name}
                    <Chip
                      label={group.records.length}
                      size="small"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#2196F3',
                        fontWeight: 600,
                      }}
                    />
                  </Typography>
                </Box>
              )}

              {/* Group Table */}
              <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>License</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Expiry</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Completion Rate</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Safety Score</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Complaints</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.records.map((driver) => {
                        const expired = isLicenseExpired(driver.licenseExpiry);
                        return (
                          <TableRow
                            key={driver.id}
                            sx={{
                              '&:hover': { backgroundColor: '#f9f9f9' },
                              borderBottom: '1px solid #eee',
                              backgroundColor: expired ? 'rgba(244, 67, 54, 0.05)' : 'inherit',
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {expired && (
                                  <WarningIcon
                                    sx={{ fontSize: '18px', color: '#f44336' }}
                                    title="License Expired"
                                  />
                                )}
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {driver.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{driver.licenseNumber}</TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: expired ? '#f44336' : 'inherit',
                                  fontWeight: expired ? 600 : 400,
                                }}
                              >
                                {formatDate(driver.licenseExpiry)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: '40px',
                                    height: '6px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${driver.completionRate}%`,
                                      height: '100%',
                                      backgroundColor:
                                        driver.completionRate >= 90
                                          ? '#4caf50'
                                          : driver.completionRate >= 75
                                          ? '#ff9800'
                                          : '#f44336',
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ minWidth: '30px' }}>
                                  {driver.completionRate}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${(driver.safetyRating * 20).toFixed(0)}%`}
                                color={getSafetyScoreColor(driver.safetyRating)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {driver.complaints}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                                color={getStatusColor(driver.status)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenViewModal(driver)}
                                title="View Details"
                                sx={{ color: '#2196F3' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditModal(driver)}
                                title="Edit"
                                sx={{ color: '#2196F3' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(driver)}
                                title="Delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {/* Form Modal (Create/Edit) */}
      <DriverFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedDriver(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedDriver}
        loading={submitting}
      />

      {/* View Modal */}
      <DriverViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedDriver(null);
        }}
        data={selectedDriver}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedDriver(null);
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to remove this driver? This action cannot be undone.
          </Typography>
          {selectedDriver && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Name:</strong> {selectedDriver.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>License:</strong> {selectedDriver.licenseNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedDriver.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedDriver(null);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Drivers;
