/**
 * Settings Page
 */

import { Box, Typography } from '@mui/material';
import MainLayout from '../components/MainLayout';

const Settings = () => {
  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Settings
        </Typography>
        <Typography color="textSecondary">
          Manage system and user settings
        </Typography>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        Settings will be displayed here.
      </Typography>
    </MainLayout>
  );
};

export default Settings;
