/**
 * Profile Page
 */

import { Box, Typography } from '@mui/material';
import MainLayout from '../components/MainLayout';

const Profile = () => {
  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          My Profile
        </Typography>
        <Typography color="textSecondary">
          Manage your profile information
        </Typography>
      </Box>

      <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
        User profile will be displayed here.
      </Typography>
    </MainLayout>
  );
};

export default Profile;
