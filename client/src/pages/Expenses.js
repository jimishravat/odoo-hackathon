/**
 * Expenses Page
 */

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../components/MainLayout';

const Expenses = () => {
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Expenses
          </Typography>
          <Typography color="textSecondary">
            Track expenses and billing
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Expense
        </Button>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Expense tracking will be displayed here.
      </Typography>
    </MainLayout>
  );
};

export default Expenses;
