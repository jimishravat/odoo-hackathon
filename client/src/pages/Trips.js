/**
 * Trips Page - Trip Management Module
 */

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../components/MainLayout';

const Trips = () => {
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Trips
          </Typography>
          <Typography color="textSecondary">
            Monitor and manage trips
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create Trip
        </Button>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Trip list will be displayed here. Implement trip management and tracking features.
      </Typography>
    </MainLayout>
  );
};

export default Trips;
