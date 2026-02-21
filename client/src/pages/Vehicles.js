/**
 * Vehicles Page - Vehicle Management Module
 */

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../components/MainLayout';

const Vehicles = () => {
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Vehicles
          </Typography>
          <Typography color="textSecondary">
            Manage your fleet vehicles
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Vehicle
        </Button>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Vehicle list will be displayed here. Implement vehicle listing and management features.
      </Typography>
    </MainLayout>
  );
};

export default Vehicles;
