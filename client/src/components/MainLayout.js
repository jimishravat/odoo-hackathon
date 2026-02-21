/**
 * Main Layout Wrapper Component
 * Combines Header, Sidebar, and content area
 */

import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationSnackbar from './NotificationSnackbar';
import { useApp } from '../hooks/useApp';

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useApp();

  const sidebarWidth = isMobile ? 0 : sidebarOpen ? 250 : 80;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Toolbar /> {/* This spacing accounts for the fixed AppBar height */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Notification Snackbar */}
      <NotificationSnackbar />
    </Box>
  );
};

export default MainLayout;
