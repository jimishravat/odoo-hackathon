/**
 * Reusable Data Table Component
 * Features: Sorting, Pagination, Row selection, Column customization
 */

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  Checkbox,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useState } from 'react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  selectable = false,
  onSelectionChange,
  pagination = true,
  pageSize = 10,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allRowIds = displayedRows.map((row) => row.id);
      setSelectedRows(allRowIds);
      onSelectionChange?.(allRowIds);
    } else {
      setSelectedRows([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id];
      onSelectionChange?.(updated);
      return updated;
    });
  };

  const displayedRows = pagination
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!displayedRows || displayedRows.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">No records found</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRows.length === displayedRows.length && displayedRows.length > 0}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < displayedRows.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={column.id}
                sx={{
                  fontWeight: 600,
                  color: '#333',
                  width: column.width,
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedRows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => onRowClick?.(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: '#f9f9f9',
                },
                backgroundColor: selectedRows.includes(row.id) ? '#e3f2fd' : 'inherit',
              }}
            >
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={`${row.id}-${column.id}`} sx={{ fontSize: '0.95rem' }}>
                  {column.render ? column.render(row[column.id], row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </TableContainer>
  );
};

export default DataTable;
