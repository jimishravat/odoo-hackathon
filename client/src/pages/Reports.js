/**
 * Reports Page
 */

import { Box, Typography } from '@mui/material';
import MainLayout from '../components/MainLayout';

const Reports = () => {
  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Reports & Analytics
        </Typography>
        <Typography color="textSecondary">
          View comprehensive reports and analytics
        </Typography>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Reports and analytics will be displayed here.
      </Typography>
    </MainLayout>
  );
};

export default Reports;
