/**
 * Vehicles Page - Vehicle Management Module
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
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
import { mockVehicles, simulateDelay } from '../services/mockData';

const getStatusColor = (status) => {
  const colorMap = {
    scheduled: 'info',
    'in-progress': 'warning',
    completed: 'success',
    cancelled: 'error',
    maintenance: 'warning',
    active: 'success',
    retired: 'default',
  };
  return colorMap[(status || '').toLowerCase()] || 'default';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-IN');
  } catch (e) {
    return dateString;
  }
};

const AddVehicleDialog = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({
    licensePlate: '',
    capacity: '',
    initialOdometer: '',
    type: '',
    model: '',
  });

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSave = () => {
    // Basic validation
    if (!form.licensePlate || !form.model) return;
    onSave({
      licensePlate: form.licensePlate,
      capacity: Number(form.capacity) || 0,
      mileage: Number(form.initialOdometer) || 0,
      type: form.type || 'Unknown',
      name: form.model,
      status: 'active',
    });
    setForm({ licensePlate: '', capacity: '', initialOdometer: '', type: '', model: '' });
  };

  const handleCancel = () => {
    setForm({ licensePlate: '', capacity: '', initialOdometer: '', type: '', model: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Add New Vehicle</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField label="License Plate" value={form.licensePlate} onChange={handleChange('licensePlate')} fullWidth />
          <TextField label="Model" value={form.model} onChange={handleChange('model')} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={form.type} label="Type" onChange={handleChange('type')}>
              <MenuItem value="Truck">Truck</MenuItem>
              <MenuItem value="Van">Van</MenuItem>
              <MenuItem value="Car">Car</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Max Payload (kg)" value={form.capacity} onChange={handleChange('capacity')} type="number" fullWidth />
          <TextField label="Initial Odometer (km)" value={form.initialOdometer} onChange={handleChange('initialOdometer')} type="number" fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" onClick={() => { handleSave(); onClose(); }} startIcon={<AddIcon />}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const ViewVehicleDialog = ({ open, onClose, data }) => {
  if (!data) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Vehicle Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Paper sx={{ p: 2, borderRadius: 1, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{data.name}</Typography>
            <Typography color="textSecondary">{data.licensePlate}</Typography>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Type</Typography>
                <Typography>{data.type || '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Max Payload (kg)</Typography>
                <Typography>{data.capacity ?? '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Odometer (km)</Typography>
                <Typography>{data.mileage ?? data.currentLoad ?? '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Last Service</Typography>
                <Typography>{formatDate(data.lastServiceDate)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Status</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip label={String(data.status || '-').charAt(0).toUpperCase() + String(data.status || '-').slice(1)} color={getStatusColor(data.status)} size="small" variant="outlined" />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditVehicleDialog = ({ open, onClose, data, onSave }) => {
  const [form, setForm] = useState({});
  useEffect(() => {
    setForm(data || {});
  }, [data]);

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.licensePlate || !form.name) return;
    await simulateDelay(300);
    onSave(form);
    onClose();
  };

  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Vehicle</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField label="License Plate" value={form.licensePlate || ''} onChange={handleChange('licensePlate')} fullWidth />
          <TextField label="Model" value={form.name || ''} onChange={handleChange('name')} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={form.type || ''} label="Type" onChange={handleChange('type')}>
              <MenuItem value="Truck">Truck</MenuItem>
              <MenuItem value="Van">Van</MenuItem>
              <MenuItem value="Car">Car</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Max Payload (kg)" value={form.capacity || ''} onChange={handleChange('capacity')} type="number" fullWidth />
          <TextField label="Odometer (km)" value={form.mileage || ''} onChange={handleChange('mileage')} type="number" fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteVehicleDialog = ({ open, onClose, data, onConfirm, loading }) => {
  if (!data) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete vehicle <strong>{data.name}</strong> ({data.licensePlate})?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAdd = (newVehicle) => {
    (async () => {
      setLoading(true);
      await simulateDelay(300);
      const nextId = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.id)) + 1 : 1;
      const vehicleObj = { id: nextId, ...newVehicle };
      // keep mock data sync
      mockVehicles.unshift(vehicleObj);
      setVehicles([...mockVehicles]);
      setLoading(false);
    })();
  };

  // Dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const openView = (v) => { setSelectedVehicle(v); setViewOpen(true); };
  const openEdit = (v) => { setSelectedVehicle(v); setEditOpen(true); };
  const openDelete = (v) => { setSelectedVehicle(v); setDeleteOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;
    setActionLoading(true);
    await simulateDelay(250);
    const idx = mockVehicles.findIndex((m) => m.id === selectedVehicle.id);
    if (idx !== -1) mockVehicles.splice(idx, 1);
    setVehicles([...mockVehicles]);
    setActionLoading(false);
    setDeleteOpen(false);
    setSelectedVehicle(null);
  };

  const handleEditSave = async (updated) => {
    setActionLoading(true);
    await simulateDelay(300);
    const idx = mockVehicles.findIndex((m) => m.id === updated.id);
    if (idx !== -1) mockVehicles[idx] = { ...mockVehicles[idx], ...updated };
    setVehicles([...mockVehicles]);
    setActionLoading(false);
    setEditOpen(false);
    setSelectedVehicle(null);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchText.trim().toLowerCase();
    if (q) {
      const match = (v.licensePlate || '').toLowerCase().includes(q) || (v.name || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter) {
      if ((v.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    if (filterVehicle) {
      if (String(v.id) !== String(filterVehicle)) return false;
    }
    return true;
  });

  const columns = [
    { id: 'no', label: 'No', width: 60, render: (val, row, index) => null },
    { id: 'licensePlate', label: 'Plate', width: 160 },
    { id: 'name', label: 'Model', width: 200 },
    { id: 'type', label: 'Type', width: 120 },
    { id: 'capacity', label: 'Capacity', width: 120, render: (val) => val ?? '-' },
    { id: 'mileage', label: 'Odometer', width: 120, render: (val) => val ?? '-' },
    { id: 'status', label: 'Status', width: 120, render: (val) => val ?? '-' },
    { id: 'actions', label: 'Actions', width: 140, render: (val, row) => null },
  ];

  // Since DataTable renders cells from column.id, we'll map rows to include desired display fields and override renders where needed
  const dataRows = filteredVehicles.map((v, idx) => ({
    id: v.id,
    no: idx + 1,
    licensePlate: v.licensePlate || '-',
    name: v.name || '-',
    type: v.type || '-',
    capacity: v.capacity ?? '-',
    mileage: v.mileage ?? v.currentLoad ?? '-',
    status: v.status || '-',
    original: v,
  }));

  // Pagination slice
  const displayedRows = dataRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await simulateDelay(300);
      if (mounted) setVehicles([...mockVehicles]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setFilterVehicle('');
    setGroupBy('none');
    setPage(0);
  };

  const totalRecords = filteredVehicles.length;

  

  // Custom renderers passed via columns' render property need to be accessible inside DataTable; DataTable calls column.render(row[column.id], row)
  const enhancedColumns = columns.map((col) => {
    if (col.id === 'no') {
      return { ...col, render: (val, row) => row.no };
    }
    if (col.id === 'status') {
      return {
        ...col,
        render: (val) => {
          const status = (val || '').toLowerCase();
          const map = {
            active: { color: 'success', label: 'Active' },
            maintenance: { color: 'warning', label: 'In-progress' },
            scheduled: { color: 'info', label: 'Scheduled' },
            retired: { color: 'default', label: 'Retired' },
          };
          const cfg = map[status] || { color: 'default', label: val || '-' };
          return (
            <Chip
              label={cfg.label}
              color={cfg.color}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      };
    }
    if (col.id === 'actions') {
      return {
        ...col,
        render: (_, row) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View">
              <IconButton size="small" sx={{ color: '#2196F3' }} onClick={(e) => { e.stopPropagation(); openView(row.original); }}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" sx={{ color: '#2196F3' }} onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openDelete(row.original); }} sx={{ color: '#d32f2f' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      };
    }
    return col;
  });

  // Grouping logic (similar to Maintenance page)
  const getGroupedRows = () => {
    if (!groupBy || groupBy === 'none') return [{ name: '', rows: dataRows }];

    const grouped = {};
    dataRows.forEach((row) => {
      let key = '';
      if (groupBy === 'status') key = row.status || 'Unknown';
      else if (groupBy === 'type') key = row.type || 'Unknown';
      else if (groupBy === 'vehicle') key = row.name || 'Unknown';
      else key = row[groupBy] || 'Unknown';

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    // Convert grouped object to array and normalize group display names (capitalize status)
    return Object.entries(grouped).map(([key, rows]) => {
      let displayName = key;
      if (groupBy === 'status') {
        displayName = String(key || '').charAt(0).toUpperCase() + String(key || '').slice(1);
      }
      return { name: displayName, rows };
    });
  };

  const groupedRows = getGroupedRows();

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Vehicles
          </Typography>
          <Typography color="textSecondary">Manage your fleet vehicles</Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{
            backgroundColor: '#2196F3',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#1976D2',
            },
          }}
        >
          Add Vehicle
        </Button>
      </Box>

      {/* Advanced Search & Filters (from Maintenance reference) */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by vehicle or plate..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(0); }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#1976d2' }} />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearchText(''); setPage(0); }} sx={{ color: '#1976d2' }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff', '&:hover fieldset': { borderColor: '#1976d2' } } }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                label="Filter by Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Vehicle</InputLabel>
              <Select
                value={filterVehicle}
                onChange={(e) => { setFilterVehicle(e.target.value); setPage(0); }}
                label="Filter by Vehicle"
              >
                <MenuItem value="">All Vehicles</MenuItem>
                {mockVehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select value={groupBy} onChange={(e) => { setGroupBy(e.target.value); setPage(0); }} label="Group By">
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="vehicle">Vehicle</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ color: '#1976d2', borderColor: '#1976d2', '&:hover': { backgroundColor: 'rgba(25,118,210,0.04)', borderColor: '#1565c0', color: '#1565c0' } }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {(searchText || statusFilter || filterVehicle || groupBy !== 'none') && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="textSecondary">
              Showing <strong>{totalRecords}</strong> record{totalRecords !== 1 ? 's' : ''} of <strong>{vehicles.length}</strong>
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Table Card (styled like Maintenance page) */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
            <CircularProgress />
          </Box>
        ) : dataRows.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="textSecondary">No vehicles found</Typography>
          </Paper>
        ) : (
          <Box>
            {groupBy === 'none' ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      {enhancedColumns.map((col) => (
                        <TableCell key={col.id} sx={{ fontWeight: 600, width: col.width }}>
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRows.map((row) => (
                      <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' }, borderBottom: '1px solid #eee' }}>
                        {enhancedColumns.map((col) => (
                          <TableCell key={`${row.id}-${col.id}`} sx={col.id === 'actions' ? { fontSize: '0.95rem', textAlign: 'center' } : { fontSize: '0.95rem' }}>
                            {col.render ? col.render(row[col.id], row) : row[col.id]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={dataRows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
              </TableContainer>
            ) : (
              // Grouped rendering: render each group with header + its own Paper-wrapped table (like Maintenance page)
              groupedRows.map((group, groupIndex) => (
                <Box key={groupIndex} sx={{ mb: 3, }}>
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
                          label={group.rows.length}
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
                            {enhancedColumns.map((col) => (
                              <TableCell key={col.id} sx={{ fontWeight: 600 }}>{col.label}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.rows.map((row) => (
                            <TableRow
                              key={row.id}
                              sx={{ '&:hover': { backgroundColor: '#f9f9f9' }, borderBottom: '1px solid #eee' }}
                            >
                              {enhancedColumns.map((col) => (
                                <TableCell key={`${row.id}-${col.id}`} sx={col.id === 'actions' ? { fontSize: '0.95rem', textAlign: 'center' } : { fontSize: '0.95rem' }}>
                                  {col.render ? col.render(row[col.id], row) : row[col.id]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              ))
            )}
          </Box>
        )}
      </Paper>
      <AddVehicleDialog open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAdd} />
      <ViewVehicleDialog open={viewOpen} onClose={() => { setViewOpen(false); setSelectedVehicle(null); }} data={selectedVehicle} />
      <EditVehicleDialog open={editOpen} onClose={() => { setEditOpen(false); setSelectedVehicle(null); }} data={selectedVehicle} onSave={handleEditSave} />
      <DeleteVehicleDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedVehicle(null); }} data={selectedVehicle} onConfirm={handleDeleteConfirm} loading={actionLoading} />
    </MainLayout>
  );
};

export default Vehicles;
