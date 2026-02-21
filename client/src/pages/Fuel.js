/**
 * Fuel Management Page
 * Track fuel consumption and analytics with CRUD operations
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
} from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import FuelFormModal from '../components/FuelFormModal';
import FuelViewModal from '../components/FuelViewModal';
import { fuelAPI } from '../services/api';
import { mockVehicles } from '../services/mockData';
import { useApp } from '../hooks/useApp';
import {
  createExpenseFromFuel,
  validateFuelDataForSync,
} from '../utils/fuelExpenseSync';

const Fuel = () => {
  // State management
  const [fuelRecords, setFuelRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [editingFuel, setEditingFuel] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterFuelType, setFilterFuelType] = useState('');
  const [groupBy, setGroupBy] = useState('none');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedGroups, setExpandedGroups] = useState({});

  const { showNotification } = useApp();

  const fuelTypes = ['diesel', 'petrol', 'cng', 'electric'];

  // Load fuel records on mount
  useEffect(() => {
    loadFuelRecords();
  }, []);

  const loadFuelRecords = async () => {
    try {
      setLoading(true);
      const response = await fuelAPI.list();
      setFuelRecords(response.data || []);
    } catch (error) {
      showNotification('Failed to load fuel records', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getVehicleName = (vehicleId) => {
    const vehicle = mockVehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const getVehicleLicensePlate = (vehicleId) => {
    const vehicle = mockVehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.licensePlate : 'N/A';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
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

  // Filtering logic
  const getFilteredRecords = () => {
    return fuelRecords.filter(record => {
      const vehicleName = getVehicleName(record.vehicle).toLowerCase();
      const location = record.location.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        vehicleName.includes(searchLower) ||
        location.includes(searchLower) ||
        record.fuelType.toLowerCase().includes(searchLower);

      const matchesVehicle = !filterVehicle || record.vehicle === parseInt(filterVehicle);
      const matchesFuelType = !filterFuelType || record.fuelType === filterFuelType;

      return matchesSearch && matchesVehicle && matchesFuelType;
    });
  };

  // Grouping logic
  const getGroupedRecords = () => {
    const filtered = getFilteredRecords();

    if (groupBy === 'none') {
      return [{ key: 'all', label: 'All Records', records: filtered }];
    }

    const grouped = {};

    filtered.forEach(record => {
      let groupKey = '';
      let groupLabel = '';

      if (groupBy === 'vehicle') {
        groupKey = record.vehicle;
        groupLabel = getVehicleName(record.vehicle);
      } else if (groupBy === 'fuelType') {
        groupKey = record.fuelType;
        groupLabel = record.fuelType.charAt(0).toUpperCase() + record.fuelType.slice(1);
      } else if (groupBy === 'date') {
        groupKey = record.date;
        groupLabel = formatDate(record.date);
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { label: groupLabel, records: [] };
      }
      grouped[groupKey].records.push(record);
    });

    return Object.entries(grouped).map(([key, value]) => ({
      key,
      ...value,
    }));
  };

  // CRUD operations
  const handleAddFuel = () => {
    setEditingFuel(null);
    setFormModalOpen(true);
  };

  const handleEditFuel = (fuel) => {
    setEditingFuel(fuel);
    setFormModalOpen(true);
  };

  const handleViewFuel = (fuel) => {
    setSelectedFuel(fuel);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (fuel) => {
    setSelectedFuel(fuel);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      if (editingFuel) {
        // Update fuel record
        await fuelAPI.update(editingFuel.id, formData);
        showNotification('Fuel entry updated successfully', 'success');
      } else {
        // Create new fuel record
        const createResponse = await fuelAPI.create(formData);
        const newFuelRecord = createResponse.data;

        // Validate fuel data for sync
        const validation = validateFuelDataForSync(newFuelRecord);
        if (validation.isValid) {
          // Sync fuel to expenses automatically
          const expenseSync = await createExpenseFromFuel(newFuelRecord);
          if (expenseSync.success) {
            showNotification('Fuel entry created and synced to Expenses', 'success');
          } else {
            showNotification('Fuel entry created but failed to sync to Expenses', 'warning');
          }
        } else {
          showNotification('Fuel entry created but failed to sync to Expenses (missing fields)', 'warning');
        }
      }
      
      setFormModalOpen(false);
      setEditingFuel(null);
      await loadFuelRecords();
    } catch (error) {
      showNotification(
        editingFuel ? 'Failed to update fuel entry' : 'Failed to create fuel entry',
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
      await fuelAPI.delete(selectedFuel.id);
      showNotification('Fuel entry deleted successfully', 'success');
      setDeleteModalOpen(false);
      setSelectedFuel(null);
      await loadFuelRecords();
    } catch (error) {
      showNotification('Failed to delete fuel entry', 'error');
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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterVehicle('');
    setFilterFuelType('');
    setGroupBy('none');
    setPage(0);
  };

  // Get records to display
  const groupedRecords = getGroupedRecords();
  const filteredRecords = getFilteredRecords();

  // Render table rows
  const renderTableRows = () => {
    if (groupBy === 'none') {
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

      return paginatedRecords.map(record => (
        <TableRow key={record.id} hover>
          <TableCell>{getVehicleName(record.vehicle)}</TableCell>
          <TableCell>{getVehicleLicensePlate(record.vehicle)}</TableCell>
          <TableCell>{formatDate(record.date)}</TableCell>
          <TableCell align="right">{record.quantity.toFixed(2)} L</TableCell>
          <TableCell align="right">{formatCurrency(record.price)}</TableCell>
          <TableCell align="right">{formatCurrency(record.totalCost)}</TableCell>
          <TableCell>
            <Chip
              label={record.fuelType.charAt(0).toUpperCase() + record.fuelType.slice(1)}
              size="small"
              sx={{
                backgroundColor: getFuelTypeColor(record.fuelType),
                color: 'white',
                fontWeight: 500,
              }}
            />
          </TableCell>
          <TableCell>{record.location}</TableCell>
          <TableCell>{record.mileage.toLocaleString('en-IN')} km</TableCell>
          <TableCell align="center">
            <IconButton
              size="small"
              onClick={() => handleViewFuel(record)}
              sx={{ color: '#2196F3' }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleEditFuel(record)}
              sx={{ color: '#2196F3' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(record)}
              sx={{ color: '#d32f2f' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      ));
    } else {
      // Grouped view
      const rows = [];
      groupedRecords.forEach((group, groupIndex) => {
        const isExpanded = expandedGroups[group.key] !== false; // Default to expanded
        rows.push(
          <TableRow key={`group-${group.key}`} sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell colSpan={10}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => toggleGroupExpanded(group.key)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {group.label}
                </Typography>
                <Chip
                  label={group.records.length}
                  size="small"
                  sx={{ backgroundColor: '#2196F3', color: 'white', fontWeight: 600 }}
                />
              </Box>
            </TableCell>
          </TableRow>
        );

        if (isExpanded) {
          group.records.forEach(record => {
            rows.push(
              <TableRow key={record.id} hover sx={{ pl: 4 }}>
                <TableCell sx={{ pl: 8 }}>{getVehicleName(record.vehicle)}</TableCell>
                <TableCell>{getVehicleLicensePlate(record.vehicle)}</TableCell>
                <TableCell>{formatDate(record.date)}</TableCell>
                <TableCell align="right">{record.quantity.toFixed(2)} L</TableCell>
                <TableCell align="right">{formatCurrency(record.price)}</TableCell>
                <TableCell align="right">{formatCurrency(record.totalCost)}</TableCell>
                <TableCell>
                  <Chip
                    label={record.fuelType.charAt(0).toUpperCase() + record.fuelType.slice(1)}
                    size="small"
                    sx={{
                      backgroundColor: getFuelTypeColor(record.fuelType),
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>{record.mileage.toLocaleString('en-IN')} km</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleViewFuel(record)}
                    sx={{ color: '#2196F3' }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEditFuel(record)}
                    sx={{ color: '#2196F3' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(record)}
                    sx={{ color: '#d32f2f' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          });
        }
      });

      return rows;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Fuel Management
          </Typography>
          <Typography color="textSecondary">
            Track fuel consumption and analytics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddFuel}
          sx={{
            backgroundColor: '#2196F3',
            '&:hover': {
              backgroundColor: '#1976D2',
            },
          }}
        >
          Add Fuel Entry
        </Button>
      </Box>

      {/* Search and Filters Section */}
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
            placeholder="Search by vehicle, location, or fuel type..."
            value={searchTerm}
            onChange={e => {
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Vehicle</InputLabel>
              <Select
                value={filterVehicle}
                onChange={e => {
                  setFilterVehicle(e.target.value);
                  setPage(0);
                }}
                label="Filter by Vehicle"
              >
                <MenuItem value="">All Vehicles</MenuItem>
                {mockVehicles.map(vehicle => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Fuel Type</InputLabel>
              <Select
                value={filterFuelType}
                onChange={e => {
                  setFilterFuelType(e.target.value);
                  setPage(0);
                }}
                label="Filter by Fuel Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {fuelTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                onChange={e => {
                  setGroupBy(e.target.value);
                  setPage(0);
                }}
                label="Group By"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="vehicle">Vehicle</MenuItem>
                <MenuItem value="fuelType">Fuel Type</MenuItem>
                <MenuItem value="date">Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>

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
        {(searchTerm || filterVehicle || filterFuelType || groupBy !== 'none') && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="textSecondary">
              Showing <strong>{filteredRecords.length}</strong> record
              {filteredRecords.length !== 1 ? 's' : ''} of <strong>{fuelRecords.length}</strong>
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Data Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#2196F3' }} />
        </Box>
      ) : filteredRecords.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No fuel entries found. Try adjusting your filters or add a new entry.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2196F3' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vehicle</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>License Plate</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                  Price/L
                </TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                  Total Cost
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fuel Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Mileage</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderTableRows()}</TableBody>
          </Table>

          {groupBy === 'none' && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </TableContainer>
      )}

      {/* Modals */}
      <FuelFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingFuel(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingFuel}
        vehicles={mockVehicles}
        loading={loading}
      />

      <FuelViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedFuel(null);
        }}
        fuelData={selectedFuel}
        vehicles={mockVehicles}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Fuel Entry?</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: '#fff3e0',
              borderLeft: '4px solid #ff9800',
              mb: 2,
            }}
          >
            <Typography variant="body2">
              <strong>{getVehicleName(selectedFuel?.vehicle)}</strong> - Refilled on{' '}
              <strong>{formatDate(selectedFuel?.date)}</strong> with{' '}
              <strong>{selectedFuel?.quantity.toFixed(2)} liters</strong> of{' '}
              <strong>{selectedFuel?.fuelType}</strong> for a total cost of{' '}
              <strong>{formatCurrency(selectedFuel?.totalCost)}</strong>.
            </Typography>
          </Paper>
          <Typography color="textSecondary">
            This action cannot be undone. Are you sure you want to delete this fuel entry?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Fuel;
