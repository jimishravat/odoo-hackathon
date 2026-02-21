/**
 * Header/AppBar Component
 */

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { toggleSidebar } = useApp();
  const { logout, user } = useAuth();
  
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileClick = (e) => {
    setProfileAnchor(e.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleNotificationClick = (e) => {
    setNotificationAnchor(e.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    logout();
    navigate(ROUTES.LOGIN);
  };

  const handleProfile = () => {
    handleProfileClose();
    navigate(ROUTES.PROFILE);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#fff',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={toggleSidebar}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#333',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            FleetFlow Dashboard
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search Icon */}
          {/* <IconButton
            color="inherit"
            aria-label="search"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <SearchIcon sx={{ color: '#666' }} />
          </IconButton>

         
          <IconButton
            color="inherit"
            aria-label="notifications"
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon sx={{ color: '#666' }} />
            </Badge>
          </IconButton> */}

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleNotificationClose}>
              Maintenance due for Vehicle V-245
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              Trip #T001 completed successfully
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              Low fuel level alert for Vehicle V-246
            </MenuItem>
          </Menu>

          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileClick}
            color="inherit"
            aria-label="profile"
          >
            <AccountCircleIcon sx={{ color: '#666', fontSize: '1.8rem' }} />
          </IconButton>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleProfile}>My Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
