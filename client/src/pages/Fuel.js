/**
 * Fuel Management Page
 */

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../components/MainLayout';

const Fuel = () => {
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Fuel Management
          </Typography>
          <Typography color="textSecondary">
            Track fuel consumption and analytics
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Fuel Entry
        </Button>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Fuel logs and analytics will be displayed here.
      </Typography>
    </MainLayout>
  );
};

export default Fuel;
