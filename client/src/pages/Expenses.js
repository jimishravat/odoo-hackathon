/**
 * Expenses Page - Expense Tracking and Management Module
 * Features: Track expenses, create records, edit, delete, with full CRUD operations
 * Added: Search, Filters, and Grouping functionality
 * RBAC: Only Fleet Manager can create/edit/delete (Financial Analyst can view only)
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
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LockIcon from '@mui/icons-material/Lock';
import MainLayout from '../components/MainLayout';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ExpenseViewModal from '../components/ExpenseViewModal';
import { useApp } from '../hooks/useApp';
import { usePermission } from '../hooks/usePermission';
import { expensesAPI } from '../services/api';
import { mockVehicles } from '../services/mockData';

const Expenses = () => {
  const { showNotification } = useApp();
  const { can } = usePermission();

  // State Management
  const [expenseRecords, setExpenseRecords] = useState([]);
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
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [groupBy, setGroupBy] = useState('none'); // none, category, status, vehicle

  // Load expense records on component mount
  useEffect(() => {
    loadExpenseRecords();
  }, []);

  const loadExpenseRecords = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.list();
      if (response.success) {
        setExpenseRecords(response.data || []);
      }
    } catch (error) {
      showNotification(error.message || 'Failed to load expense records', 'error');
      setExpenseRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Create
  const handleOpenCreateModal = () => {
    if (!can.create('expenses')) {
      showNotification('You do not have permission to create expenses', 'error');
      return;
    }
    setSelectedRecord(null);
    setFormModalOpen(true);
  };

  // Handle Edit
  const handleOpenEditModal = (record) => {
    if (!can.update('expenses')) {
      showNotification('You do not have permission to edit expenses', 'error');
      return;
    }
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
        if (!can.update('expenses')) {
          showNotification('You do not have permission to edit expenses', 'error');
          return;
        }
        const response = await expensesAPI.update(selectedRecord.id, formData);
        if (response.success) {
          showNotification('Expense record updated successfully', 'success');
          setFormModalOpen(false);
          await loadExpenseRecords();
        }
      } else {
        // Create new record
        if (!can.create('expenses')) {
          showNotification('You do not have permission to create expenses', 'error');
          return;
        }
        const response = await expensesAPI.create(formData);
        if (response.success) {
          showNotification('Expense added successfully', 'success');
          setFormModalOpen(false);
          await loadExpenseRecords();
        }
      }
    } catch (error) {
      showNotification(error.message || 'Failed to save expense record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete - Open Confirmation Dialog
  const handleOpenDeleteDialog = (record) => {
    if (!can.delete('expenses')) {
      showNotification('You do not have permission to delete expenses', 'error');
      return;
    }
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      if (!can.delete('expenses')) {
        showNotification('You do not have permission to delete expenses', 'error');
        return;
      }
      const response = await expensesAPI.delete(selectedRecord.id);
      if (response.success) {
        showNotification('Expense record deleted successfully', 'success');
        setDeleteDialogOpen(false);
        setSelectedRecord(null);
        await loadExpenseRecords();
      }
    } catch (error) {
      showNotification(error.message || 'Failed to delete expense record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getVehicleName = (vehicleId) => {
    if (!vehicleId) return 'No Vehicle';
    const vehicle = mockVehicles.find((v) => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
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

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedRecords = expenseRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Filter and search logic
  const getFilteredRecords = () => {
    let filtered = [...expenseRecords];

    // Search by vehicle name, category, description, or receipt
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          getVehicleName(record.vehicle).toLowerCase().includes(searchLower) ||
          record.category.toLowerCase().includes(searchLower) ||
          record.description.toLowerCase().includes(searchLower) ||
          (record.receipt && record.receipt.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter((record) => record.category === filterCategory);
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((record) => record.status === filterStatus);
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

      if (groupBy === 'category') {
        groupKey = record.category;
      } else if (groupBy === 'status') {
        groupKey = record.status.charAt(0).toUpperCase() + record.status.slice(1);
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
  const totalAmount = getFilteredRecords().reduce((sum, record) => sum + (record.amount || 0), 0);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
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
            Expenses
          </Typography>
          <Typography color="textSecondary">
            Track and manage fleet expenses
          </Typography>
        </Box>
        {can.create('expenses') ? (
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
            Add Expense
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled
            startIcon={<LockIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Read-Only Mode
          </Button>
        )}
      </Box>

      {/* Permission Alert for Non-Creators */}
      {!can.create('expenses') && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have read-only access to expenses. Only Fleet Managers can create, edit, or delete expense records.
        </Alert>
      )}

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
            placeholder="Search by vehicle, category, description, or receipt..."
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
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(0);
                }}
                label="Filter by Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Fuel">Fuel</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Toll">Toll</MenuItem>
                <MenuItem value="Insurance">Insurance</MenuItem>
                <MenuItem value="Parking">Parking</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

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
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
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
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="status">Status</MenuItem>
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
        {(searchTerm || filterCategory || filterStatus || groupBy !== 'none') && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="textSecondary">
              Showing <strong>{totalRecords}</strong> record{totalRecords !== 1 ? 's' : ''} of{' '}
              <strong>{expenseRecords.length}</strong> • Total: <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
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
            No expense records found matching your filters
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
            Add First Expense
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
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Receipt</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.category}
                              size="small"
                              sx={{
                                backgroundColor: getCategoryColor(record.category),
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>{getVehicleName(record.vehicle)}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>{record.receipt || '-'}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2196F3' }}>
                              ₹{parseFloat(record.amount).toLocaleString('en-IN')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              color={getStatusColor(record.status)}
                              size="small"
                              variant="outlined"
                            />
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
                            {can.update('expenses') && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditModal(record)}
                                title="Edit"
                                sx={{ color: '#2196F3' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {can.delete('expenses') && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(record)}
                                title="Delete"
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
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {getFilteredRecords().length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={getFilteredRecords().length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 2 }}
        />
      )}

      {/* Form Modal (Create/Edit) */}
      <ExpenseFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedRecord(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedRecord}
        submitting={submitting}
      />

      {/* View Modal */}
      <ExpenseViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedRecord(null);
        }}
        expense={selectedRecord}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Are you sure you want to delete this expense record?
            </Typography>
            {selectedRecord && (
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Date:</strong> {formatDate(selectedRecord.date)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Category:</strong> {selectedRecord.category}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Vehicle:</strong> {getVehicleName(selectedRecord.vehicle)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Amount:</strong> ₹{parseFloat(selectedRecord.amount).toLocaleString('en-IN')}
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Expenses;
