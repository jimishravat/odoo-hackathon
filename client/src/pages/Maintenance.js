/**
 * Maintenance Page
 */

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../components/MainLayout';

const Maintenance = () => {
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Maintenance
          </Typography>
          <Typography color="textSecondary">
            Schedule and track maintenance records
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Schedule Maintenance
        </Button>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Maintenance schedule will be displayed here.
      </Typography>
    </MainLayout>
  );
};

export default Maintenance;
