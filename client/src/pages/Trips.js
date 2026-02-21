/**
 * Trips Management Page
 * Track and manage vehicle trips with CRUD operations
 * Features: Create, Read, Update, Delete trips, assign drivers/vehicles
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import TripFormModal from '../components/TripFormModal';
import TripViewModal from '../components/TripViewModal';
import { tripsAPI } from '../services/api';
import { mockVehicles, mockDrivers } from '../services/mockData';
import { useApp } from '../hooks/useApp';
import { usePermission } from '../hooks/usePermission';

const Trips = () => {
  // State management
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [groupBy, setGroupBy] = useState('none');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedGroups, setExpandedGroups] = useState({});

  const { showNotification } = useApp();
  const { can } = usePermission();

  const tripStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  const hasCreatePermission = can.create('trips');
  const hasUpdatePermission = can.update('trips');
  const hasDeletePermission = can.delete('trips');
  const hasReadPermission = can.read('trips');

  // Load trips on mount
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.list();
      setTrips(response.data || []);
    } catch (error) {
      showNotification('Failed to load trips', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getVehicleName = (vehicleId) => {
    const vehicle = mockVehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : 'Unknown Vehicle';
  };

  const getDriverName = (driverId) => {
    const driver = mockDrivers.find(d => d.id === driverId);
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

  // Filter and search logic
  const getFilteredRecords = () => {
    return trips.filter(trip => {
      const matchesSearch =
        trip.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.endLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || trip.status === filterStatus;
      const matchesVehicle = !filterVehicle || trip.vehicle === parseInt(filterVehicle);
      const matchesDriver = !filterDriver || trip.driver === parseInt(filterDriver);

      return matchesSearch && matchesStatus && matchesVehicle && matchesDriver;
    });
  };

  // Grouping logic
  const getGroupedRecords = () => {
    const filtered = getFilteredRecords();

    if (groupBy === 'none') {
      return [{ key: 'all', label: 'All Trips', records: filtered }];
    }

    const grouped = {};

    filtered.forEach(trip => {
      let groupKey = '';
      let groupLabel = '';

      if (groupBy === 'status') {
        groupKey = trip.status;
        groupLabel = getStatusLabel(trip.status);
      } else if (groupBy === 'vehicle') {
        groupKey = trip.vehicle;
        groupLabel = getVehicleName(trip.vehicle);
      } else if (groupBy === 'driver') {
        groupKey = trip.driver;
        groupLabel = getDriverName(trip.driver);
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { label: groupLabel, records: [] };
      }
      grouped[groupKey].records.push(trip);
    });

    return Object.entries(grouped).map(([key, value]) => ({
      key,
      ...value,
    }));
  };

  // CRUD operations
  const handleAddTrip = () => {
    setEditingTrip(null);
    setFormModalOpen(true);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setFormModalOpen(true);
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (trip) => {
    setSelectedTrip(trip);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);

      if (editingTrip) {
        // Update trip
        await tripsAPI.update(editingTrip.id, formData);
        showNotification('Trip updated successfully', 'success');
      } else {
        // Create new trip
        await tripsAPI.create(formData);
        showNotification('Trip created successfully', 'success');
      }

      setFormModalOpen(false);
      setEditingTrip(null);
      await loadTrips();
    } catch (error) {
      showNotification(
        editingTrip ? 'Failed to update trip' : 'Failed to create trip',
        'error'
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await tripsAPI.delete(selectedTrip.id);
      showNotification('Trip deleted successfully', 'success');
      setDeleteModalOpen(false);
      setSelectedTrip(null);
      await loadTrips();
    } catch (error) {
      showNotification('Failed to delete trip', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle group expansion
  const toggleGroupExpanded = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterVehicle('');
    setFilterDriver('');
    setGroupBy('none');
    setPage(0);
  };

  if (!hasReadPermission) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            You do not have permission to access the Trips module.
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  const groupedData = getGroupedRecords();
  const paginatedData = groupedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCarIcon sx={{ fontSize: 32, color: '#2196F3' }} />
            Trip Management
          </Typography>
          {hasCreatePermission && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTrip}
              disabled={loading}
            >
              Add Trip
            </Button>
          )}
        </Box>

        {/* Filters */}
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
              placeholder="Search by trip number or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
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
                        setPage(0);
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
            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {tripStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Vehicle Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Vehicle</InputLabel>
                <Select
                  value={filterVehicle}
                  label="Filter by Vehicle"
                  onChange={(e) => {
                    setFilterVehicle(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Vehicles</MenuItem>
                  {mockVehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Driver Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Driver</InputLabel>
                <Select
                  value={filterDriver}
                  label="Filter by Driver"
                  onChange={(e) => {
                    setFilterDriver(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Drivers</MenuItem>
                  {mockDrivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Group By */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  label="Group By"
                  onChange={(e) => {
                    setGroupBy(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="vehicle">Vehicle</MenuItem>
                  <MenuItem value="driver">Driver</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Clear Button */}
            <Grid item xs={12} sm={6} md={3}>
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
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          {/* Results Info */}
          {(searchTerm || filterStatus || filterVehicle || filterDriver || groupBy !== 'none') && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="textSecondary">
                Showing <strong>{getFilteredRecords().length}</strong> trip
                {getFilteredRecords().length !== 1 ? 's' : ''} of <strong>{trips.length}</strong>
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && trips.length > 0 ? (
          <>
            {paginatedData.map((group) => (
              <Paper key={group.key} sx={{ mb: 2 }}>
                {/* Group Header */}
                {groupBy !== 'none' && (
                  <Box
                    onClick={() => toggleGroupExpanded(group.key)}
                    sx={{
                      p: 2,
                      backgroundColor: '#F5F5F5',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': { backgroundColor: '#EEEEEE' },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {group.label} ({group.records.length})
                    </Typography>
                    {expandedGroups[group.key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                )}

                {/* Records */}
                <Collapse in={groupBy === 'none' || expandedGroups[group.key]}>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 1200 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                          <TableCell 
                            sx={{ 
                              fontWeight: 600, 
                              minWidth: 140,
                              position: 'sticky',
                              left: 0,
                              backgroundColor: '#F5F5F5',
                              zIndex: 3,
                              borderRight: '2px solid #E0E0E0'
                            }}
                          >
                            Trip Number
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Vehicle</TableCell>
                          <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Driver</TableCell>
                          <TableCell sx={{ fontWeight: 600, minWidth: 220 }}>Route</TableCell>
                          <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Distance</TableCell>
                          <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>Start Time</TableCell>
                          <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>End Time</TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 600, 
                              minWidth: 120,
                              position: 'sticky',
                              right: 130,
                              backgroundColor: '#F5F5F5',
                              zIndex: 3,
                              borderLeft: '2px solid #E0E0E0'
                            }}
                          >
                            Status
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 600, 
                              minWidth: 130, 
                              textAlign: 'center',
                              position: 'sticky',
                              right: 0,
                              backgroundColor: '#F5F5F5',
                              zIndex: 3,
                              borderLeft: '2px solid #E0E0E0'
                            }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.records.map((trip) => (
                          <TableRow
                            key={trip.id}
                            sx={{
                              '&:hover': { backgroundColor: '#F9F9F9' },
                              borderBottom: '1px solid #E0E0E0',
                            }}
                          >
                            <TableCell 
                              sx={{ 
                                fontWeight: 500, 
                                minWidth: 140,
                                position: 'sticky',
                                left: 0,
                                backgroundColor: '#FFF',
                                zIndex: 2,
                                borderRight: '2px solid #E0E0E0'
                              }}
                            >
                              {trip.tripNumber}
                            </TableCell>
                            <TableCell sx={{ minWidth: 200 }}>{getVehicleName(trip.vehicle)}</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>{getDriverName(trip.driver)}</TableCell>
                            <TableCell sx={{ minWidth: 220 }}>
                              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                <strong>From:</strong> {trip.startLocation}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block">
                                <strong>To:</strong> {trip.endLocation}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 100 }}>{trip.distance} km</TableCell>
                            <TableCell sx={{ minWidth: 160 }}>
                              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                {formatDate(trip.startTime)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatTime(trip.startTime)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 160 }}>
                              {trip.endTime ? (
                                <>
                                  <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                    {formatDate(trip.endTime)}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {formatTime(trip.endTime)}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="caption" color="textSecondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell 
                              sx={{ 
                                minWidth: 120,
                                position: 'sticky',
                                right: 130,
                                backgroundColor: '#FFF',
                                zIndex: 2,
                                borderLeft: '2px solid #E0E0E0'
                              }}
                            >
                              <Chip
                                label={getStatusLabel(trip.status)}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(trip.status),
                                  color: '#FFF',
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell 
                              sx={{ 
                                minWidth: 130, 
                                textAlign: 'center',
                                position: 'sticky',
                                right: 0,
                                backgroundColor: '#FFF',
                                zIndex: 2,
                                borderLeft: '2px solid #E0E0E0'
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleViewTrip(trip)}
                                title="View"
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              {hasUpdatePermission && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditTrip(trip)}
                                  title="Edit"
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                              {hasDeletePermission && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(trip)}
                                  title="Delete"
                                  sx={{ color: '#F44336' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Paper>
            ))}

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={groupedData.reduce((sum, group) => sum + group.records.length, 0)}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          !loading && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No trips found</Typography>
            </Paper>
          )
        )}
      </Box>

      {/* Modals */}
      {hasCreatePermission || hasUpdatePermission ? (
        <TripFormModal
          open={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setEditingTrip(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingTrip}
          vehicles={mockVehicles}
          drivers={mockDrivers}
          loading={loading}
        />
      ) : null}

      <TripViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedTrip(null);
        }}
        trip={selectedTrip}
        vehicles={mockVehicles}
        drivers={mockDrivers}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete trip <strong>{selectedTrip?.tripNumber}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Trips;
