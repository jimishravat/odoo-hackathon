/**
 * Drivers Page - Driver Management Module
 */

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../components/MainLayout';

const Drivers = () => {
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Drivers
          </Typography>
          <Typography color="textSecondary">
            Manage driver profiles and assignments
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Driver
        </Button>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Driver list will be displayed here. Implement driver management features.
      </Typography>
    </MainLayout>
  );
};

export default Drivers;
