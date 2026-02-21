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
import TripExpenseLoggerModal from '../components/TripExpenseLoggerModal';
import { tripsAPI } from '../services/api';
import { mockVehicles, mockDrivers, mockFuel, mockExpenses } from '../services/mockData';
import { useApp } from '../hooks/useApp';
import { usePermission } from '../hooks/usePermission';
import { calculateTripOperationalCost, calculateCostPerKm, getCostEfficiencyStatus, formatCurrency } from '../utils/tripCostCalculator';

const Trips = () => {
  // State management
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseLoggerOpen, setExpenseLoggerOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [sortBy, setSortBy] = useState('none');
  const [costRangeMin, setCostRangeMin] = useState('');
  const [costRangeMax, setCostRangeMax] = useState('');
  const [efficiencyFilter, setEfficiencyFilter] = useState('all');

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
    let filtered = trips.filter(trip => {
      const matchesSearch =
        trip.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.endLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || trip.status === filterStatus;
      const matchesVehicle = !filterVehicle || trip.vehicle === parseInt(filterVehicle);
      const matchesDriver = !filterDriver || trip.driver === parseInt(filterDriver);

      // Cost range filtering
      let matchesCostRange = true;
      if ((costRangeMin !== '' || costRangeMax !== '') && trip.status === 'completed' && trip.fuelLogged) {
        const cost = trip.actualOperationalCost || 0;
        if (costRangeMin !== '' && cost < parseInt(costRangeMin)) matchesCostRange = false;
        if (costRangeMax !== '' && cost > parseInt(costRangeMax)) matchesCostRange = false;
      } else if (costRangeMin !== '' || costRangeMax !== '') {
        matchesCostRange = false; // No cost data for non-completed or non-logged trips
      }

      // Efficiency filtering
      let matchesEfficiency = true;
      if (efficiencyFilter !== 'all' && trip.status === 'completed' && trip.fuelLogged && trip.distance > 0) {
        const costPerKm = calculateCostPerKm(trip.actualOperationalCost || 0, trip.distance);
        const efficiencyStatus = getCostEfficiencyStatus(costPerKm).status;
        if (efficiencyFilter !== efficiencyStatus) matchesEfficiency = false;
      } else if (efficiencyFilter !== 'all') {
        matchesEfficiency = false;
      }

      return matchesSearch && matchesStatus && matchesVehicle && matchesDriver && matchesCostRange && matchesEfficiency;
    });

    // Sorting logic
    if (sortBy === 'cost-asc') {
      filtered = filtered.sort((a, b) => {
        const costA = a.actualOperationalCost || 0;
        const costB = b.actualOperationalCost || 0;
        return costA - costB;
      });
    } else if (sortBy === 'cost-desc') {
      filtered = filtered.sort((a, b) => {
        const costA = a.actualOperationalCost || 0;
        const costB = b.actualOperationalCost || 0;
        return costB - costA;
      });
    } else if (sortBy === 'efficiency-asc') {
      filtered = filtered.sort((a, b) => {
        const costPerKmA = a.distance > 0 ? calculateCostPerKm(a.actualOperationalCost || 0, a.distance) : Infinity;
        const costPerKmB = b.distance > 0 ? calculateCostPerKm(b.actualOperationalCost || 0, b.distance) : Infinity;
        return costPerKmA - costPerKmB;
      });
    } else if (sortBy === 'efficiency-desc') {
      filtered = filtered.sort((a, b) => {
        const costPerKmA = a.distance > 0 ? calculateCostPerKm(a.actualOperationalCost || 0, a.distance) : -Infinity;
        const costPerKmB = b.distance > 0 ? calculateCostPerKm(b.actualOperationalCost || 0, b.distance) : -Infinity;
        return costPerKmB - costPerKmA;
      });
    }

    return filtered;
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

  // Handle expense logging for completed trip
  const handleOpenExpenseLogger = (trip) => {
    if (trip.status !== 'completed') {
      showNotification('Expenses can only be logged for completed trips', 'warning');
      return;
    }
    setSelectedTrip(trip);
    setExpenseLoggerOpen(true);
  };

  const handleExpenseLoggerSubmit = async (expenseData) => {
    try {
      setLoading(true);

      // Generate new IDs
      const newFuelId = Math.max(...mockFuel.map(f => f.id), 0) + 1;
      const newExpenseId = Math.max(...mockExpenses.map(e => e.id), 0) + 1;

      // Create fuel record
      const fuelRecord = {
        id: newFuelId,
        vehicle: expenseData.vehicle,
        tripId: expenseData.tripId,
        date: new Date().toISOString().split('T')[0],
        quantity: expenseData.fuel.quantity,
        price: expenseData.fuel.pricePerLiter,
        totalCost: expenseData.fuel.totalCost,
        fuelType: expenseData.fuel.fuelType,
        mileage: 0,
        location: expenseData.fuel.location,
      };

      // Add fuel record to mock data
      mockFuel.push(fuelRecord);

      // Create expense record from fuel
      const fuelExpenseRecord = {
        id: newExpenseId,
        date: new Date().toISOString().split('T')[0],
        category: 'Fuel',
        amount: expenseData.fuel.totalCost,
        vehicle: expenseData.vehicle,
        tripId: expenseData.tripId,
        description: `Fuel logged for trip ${selectedTrip.tripNumber} - ${expenseData.fuel.quantity}L at ₹${expenseData.fuel.pricePerLiter}/L`,
        receipt: `FUEL-${newFuelId}`,
        status: 'approved',
        sourceType: 'fuel',
        sourceId: newFuelId,
        notes: expenseData.notes,
      };

      mockExpenses.push(fuelExpenseRecord);

      // Create additional expense if provided
      let additionalExpenseIds = [newExpenseId];
      if (expenseData.additionalExpense) {
        const additionalExpenseId = newExpenseId + 1;
        const additionalExpenseRecord = {
          id: additionalExpenseId,
          date: new Date().toISOString().split('T')[0],
          category: expenseData.additionalExpense.category,
          amount: expenseData.additionalExpense.amount,
          vehicle: expenseData.vehicle,
          tripId: expenseData.tripId,
          description: expenseData.additionalExpense.description,
          receipt: `EXP-${additionalExpenseId}`,
          status: 'approved',
          sourceType: 'other',
          notes: expenseData.notes,
        };
        mockExpenses.push(additionalExpenseRecord);
        additionalExpenseIds.push(additionalExpenseId);
      }

      // Update trip with expense logging info
      const updatedTrip = {
        ...selectedTrip,
        fuelLogged: true,
        fuelRecordId: newFuelId,
        expenseIds: additionalExpenseIds,
        actualOperationalCost: expenseData.totalOperationalCost,
      };

      // Update trips list
      setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));

      showNotification(
        `Expenses logged successfully. Total operational cost: ₹${expenseData.totalOperationalCost.toLocaleString('en-IN')}`,
        'success'
      );
      setExpenseLoggerOpen(false);
      setSelectedTrip(null);
    } catch (error) {
      showNotification('Failed to log expenses', 'error');
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
    setSortBy('none');
    setCostRangeMin('');
    setCostRangeMax('');
    setEfficiencyFilter('all');
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
      <Box>
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

            {/* Sort By */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="cost-asc">Cost (Low to High)</MenuItem>
                  <MenuItem value="cost-desc">Cost (High to Low)</MenuItem>
                  <MenuItem value="efficiency-asc">Efficiency (Best to Worst)</MenuItem>
                  <MenuItem value="efficiency-desc">Efficiency (Worst to Best)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Cost Range Min */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Min Cost (₹)"
                type="number"
                value={costRangeMin}
                onChange={(e) => {
                  setCostRangeMin(e.target.value);
                  setPage(0);
                }}
                inputProps={{ step: '100' }}
              />
            </Grid>

            {/* Cost Range Max */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Max Cost (₹)"
                type="number"
                value={costRangeMax}
                onChange={(e) => {
                  setCostRangeMax(e.target.value);
                  setPage(0);
                }}
                inputProps={{ step: '100' }}
              />
            </Grid>

            {/* Efficiency Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Efficiency</InputLabel>
                <Select
                  value={efficiencyFilter}
                  label="Efficiency"
                  onChange={(e) => {
                    setEfficiencyFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="excellent">Excellent ({`<`} 10₹/km)</MenuItem>
                  <MenuItem value="good">Good (10-20₹/km)</MenuItem>
                  <MenuItem value="normal">Normal (20-35₹/km)</MenuItem>
                  <MenuItem value="poor">Poor (35-50₹/km)</MenuItem>
                  <MenuItem value="critical">Critical ({`>`} 50₹/km)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Clear Button */}
            <Grid item xs={12} sm={6} md={2}>
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
          {(searchTerm || filterStatus || filterVehicle || filterDriver || groupBy !== 'none' || sortBy !== 'none' || costRangeMin !== '' || costRangeMax !== '' || efficiencyFilter !== 'all') && (
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
                              right: 280,
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
                              minWidth: 140,
                              textAlign: 'center',
                              position: 'sticky',
                              right: 150,
                              backgroundColor: '#F5F5F5',
                              zIndex: 3,
                              borderLeft: '2px solid #E0E0E0'
                            }}
                          >
                            Op. Cost / Efficiency
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
                                right: 280,
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
                                minWidth: 140, 
                                textAlign: 'center',
                                position: 'sticky',
                                right: 150,
                                backgroundColor: '#FFF',
                                zIndex: 2,
                                borderLeft: '2px solid #E0E0E0'
                              }}
                            >
                              {trip.status === 'completed' && trip.fuelLogged ? (
                                <Box>
                                  <Typography variant="caption" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                                    {formatCurrency(trip.actualOperationalCost || 0)}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Chip
                                      label={`${(calculateCostPerKm(trip.actualOperationalCost || 0, trip.distance)).toFixed(2)}₹/km`}
                                      size="small"
                                      sx={{
                                        backgroundColor: getCostEfficiencyStatus(calculateCostPerKm(trip.actualOperationalCost || 0, trip.distance)).color,
                                        color: '#FFF',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: '20px'
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="textSecondary">
                                  -
                                </Typography>
                              )}
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
                              {trip.status === 'completed' && !trip.fuelLogged && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: '#4CAF50',
                                    borderColor: '#4CAF50',
                                    fontSize: '0.7rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                      backgroundColor: 'rgba(76, 175, 80, 0.04)',
                                      borderColor: '#388E3C',
                                    },
                                  }}
                                  onClick={() => handleOpenExpenseLogger(trip)}
                                >
                                  Log Fuel
                                </Button>
                              )}
                              {trip.status === 'completed' && trip.fuelLogged && (
                                <Chip
                                  label="✓ Logged"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ height: '24px' }}
                                />
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
        onLogExpenses={() => {
          if (selectedTrip?.status === 'completed' && !selectedTrip?.fuelLogged) {
            setViewModalOpen(false);
            handleOpenExpenseLogger(selectedTrip);
          }
        }}
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

      {/* Trip Expense Logger Modal */}
      <TripExpenseLoggerModal
        open={expenseLoggerOpen}
        onClose={() => {
          setExpenseLoggerOpen(false);
          setSelectedTrip(null);
        }}
        onSubmit={handleExpenseLoggerSubmit}
        trip={selectedTrip}
        vehicle={selectedTrip ? mockVehicles.find(v => v.id === selectedTrip.vehicle) : null}
        loading={loading}
      />
    </MainLayout>
  );
};

export default Trips;
