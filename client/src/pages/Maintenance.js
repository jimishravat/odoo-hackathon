/**
 * Maintenance Page - Vehicle Maintenance Management Module
 * Features: Schedule maintenance, view records, edit, delete, with full CRUD operations
 * Added: Search, Filters, and Grouping functionality
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
  TablePagination,
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
import MainLayout from '../components/MainLayout';
import MaintenanceFormModal from '../components/MaintenanceFormModal';
import MaintenanceViewModal from '../components/MaintenanceViewModal';
import { useApp } from '../hooks/useApp';
import { maintenanceAPI } from '../services/api';
import { mockVehicles } from '../services/mockData';

const Maintenance = () => {
  const { showNotification } = useApp();

  // State Management
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [groupBy, setGroupBy] = useState('none'); // none, status, type, vehicle

  // Load maintenance records on component mount
  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const loadMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const response = await maintenanceAPI.list();
      if (response.success) {
        setMaintenanceRecords(response.data || []);
      }
    } catch (error) {
      showNotification(error.message || 'Failed to load maintenance records', 'error');
      setMaintenanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Create
  const handleOpenCreateModal = () => {
    setSelectedRecord(null);
    setFormModalOpen(true);
  };

  // Handle Edit
  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    setFormModalOpen(true);
  };

  // Handle View
  const handleOpenViewModal = (record) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
  };

  // Handle Form Submission (Create/Update)
  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);

      if (selectedRecord) {
        // Update existing record
        const response = await maintenanceAPI.update(selectedRecord.id, formData);
        if (response.success) {
          showNotification('Maintenance record updated successfully', 'success');
          setFormModalOpen(false);
          await loadMaintenanceRecords();
        }
      } else {
        // Create new record
        const response = await maintenanceAPI.create(formData);
        if (response.success) {
          showNotification('Maintenance scheduled successfully', 'success');
          setFormModalOpen(false);
          await loadMaintenanceRecords();
        }
      }
    } catch (error) {
      showNotification(error.message || 'Failed to save maintenance record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete - Open Confirmation Dialog
  const handleOpenDeleteDialog = (record) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      const response = await maintenanceAPI.delete(selectedRecord.id);
      if (response.success) {
        showNotification('Maintenance record deleted successfully', 'success');
        setDeleteDialogOpen(false);
        setSelectedRecord(null);
        await loadMaintenanceRecords();
      }
    } catch (error) {
      showNotification(error.message || 'Failed to delete maintenance record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getVehicleName = (vehicleId) => {
    const vehicle = mockVehicles.find((v) => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    const colorMap = {
      scheduled: 'info',
      'in-progress': 'warning',
      completed: 'success',
      cancelled: 'error',
    };
    return colorMap[status] || 'default';
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedRecords = maintenanceRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Filter and search logic
  const getFilteredRecords = () => {
    let filtered = [...maintenanceRecords];

    // Search by vehicle name, type, or description
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          getVehicleName(record.vehicle).toLowerCase().includes(searchLower) ||
          record.maintenanceType.toLowerCase().includes(searchLower) ||
          record.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((record) => record.status === filterStatus);
    }

    // Filter by vehicle
    if (filterVehicle) {
      filtered = filtered.filter((record) => record.vehicle === parseInt(filterVehicle));
    }

    return filtered;
  };

  // Grouping logic
  const getGroupedRecords = () => {
    const filtered = getFilteredRecords();

    if (groupBy === 'none') {
      return [{ name: '', records: filtered }];
    }

    const grouped = {};

    filtered.forEach((record) => {
      let groupKey;

      if (groupBy === 'status') {
        groupKey = record.status.charAt(0).toUpperCase() + record.status.slice(1);
      } else if (groupBy === 'type') {
        groupKey = record.maintenanceType;
      } else if (groupBy === 'vehicle') {
        groupKey = getVehicleName(record.vehicle);
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(record);
    });

    return Object.entries(grouped).map(([name, records]) => ({ name, records }));
  };

  const filteredAndGroupedRecords = getGroupedRecords();
  const totalRecords = getFilteredRecords().length;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterVehicle('');
    setGroupBy('none');
    setPage(0);
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
            Maintenance
          </Typography>
          <Typography color="textSecondary">
            Schedule and track vehicle maintenance records
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
          Schedule Maintenance
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
            placeholder="Search by vehicle, maintenance type, or description..."
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                label="Filter by Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in-progress">In-progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Vehicle</InputLabel>
              <Select
                value={filterVehicle}
                onChange={(e) => {
                  setFilterVehicle(e.target.value);
                  setPage(0);
                }}
                label="Filter by Vehicle"
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

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                onChange={(e) => {
                  setGroupBy(e.target.value);
                  setPage(0);
                }}
                label="Group By"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="type">Maintenance Type</MenuItem>
                <MenuItem value="vehicle">Vehicle</MenuItem>
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
        {(searchTerm || filterStatus || filterVehicle || groupBy !== 'none') && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="textSecondary">
              Showing <strong>{totalRecords}</strong> record
              {totalRecords !== 1 ? 's' : ''} of <strong>{maintenanceRecords.length}</strong>
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
            No maintenance records found matching your filters
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
            Schedule First Maintenance
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
                        <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Scheduled Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Completed Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.records.map((record) => (
                        <TableRow
                          key={record.id}
                          sx={{
                            '&:hover': { backgroundColor: '#f9f9f9' },
                            borderBottom: '1px solid #eee',
                          }}
                        >
                          <TableCell>{getVehicleName(record.vehicle)}</TableCell>
                          <TableCell>{record.maintenanceType}</TableCell>
                          <TableCell>{formatDate(record.scheduledDate)}</TableCell>
                          <TableCell>{formatDate(record.completedDate)}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              color={getStatusColor(record.status)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            ₹{parseFloat(record.cost).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenViewModal(record)}
                              title="View Details"
                              sx={{ color: '#2196F3' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditModal(record)}
                              title="Edit"
                              sx={{ color: '#2196F3' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(record)}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {/* Form Modal (Create/Edit) */}
      <MaintenanceFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedRecord(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedRecord}
        loading={submitting}
      />

      {/* View Modal */}
      <MaintenanceViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedRecord(null);
        }}
        data={selectedRecord}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedRecord(null);
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to delete this maintenance record? This action cannot be
            undone.
          </Typography>
          {selectedRecord && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Vehicle:</strong> {getVehicleName(selectedRecord.vehicle)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Type:</strong> {selectedRecord.maintenanceType}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(selectedRecord.scheduledDate)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedRecord(null);
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

export default Maintenance;
