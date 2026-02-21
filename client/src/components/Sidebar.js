/**
 * Sidebar Navigation Component
 */

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import RouteIcon from '@mui/icons-material/Route';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: DashboardIcon, path: ROUTES.DASHBOARD, roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { label: 'Vehicles', icon: DirectionsCarIcon, path: ROUTES.VEHICLES, roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { label: 'Drivers', icon: PeopleIcon, path: ROUTES.DRIVERS, roles: ['fleet_manager', 'dispatcher', 'safety_officer'] },
  { label: 'Trips', icon: RouteIcon, path: ROUTES.TRIPS, roles: ['fleet_manager', 'dispatcher'] },
  { label: 'Maintenance', icon: BuildIcon, path: ROUTES.MAINTENANCE, roles: ['fleet_manager', 'safety_officer', 'financial_analyst'] },
  { label: 'Fuel Management', icon: LocalGasStationIcon, path: ROUTES.FUEL, roles: ['fleet_manager', 'financial_analyst'] },
  { label: 'Expenses', icon: ReceiptIcon, path: ROUTES.EXPENSES, roles: ['fleet_manager', 'financial_analyst'] },
  { label: 'Reports', icon: AssessmentIcon, path: ROUTES.REPORTS, roles: ['fleet_manager', 'safety_officer', 'financial_analyst'] },
  { label: 'Settings', icon: SettingsIcon, path: ROUTES.SETTINGS, roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, toggleSidebar } = useApp();
  const { logout, user } = useAuth();

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8f9fa',
      }}
    >
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
        >
          F
        </Box>
        {(!isMobile || sidebarOpen) && (
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            FleetFlow
          </Typography>
        )}
      </Box>

      <Divider />

      {/* User Info */}
      {user && (!isMobile || sidebarOpen) && (
        <Box sx={{ p: 2, backgroundColor: '#fff' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {user.role}
          </Typography>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {MENU_ITEMS.filter(item => item.roles.includes(user?.role)).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem
              button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                backgroundColor: isActive ? '#E3F2FD' : 'transparent',
                borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                color: isActive ? theme.palette.primary.main : '#666',
                '&:hover': {
                  backgroundColor: '#E3F2FD',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive ? theme.palette.primary.main : '#666',
                }}
              >
                <Icon />
              </ListItemIcon>
              {(!isMobile || sidebarOpen) && (
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 500,
                    },
                  }}
                />
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout Button */}
      <ListItem
        button
        onClick={handleLogout}
        sx={{
          backgroundColor: 'transparent',
          color: '#F44336',
          '&:hover': {
            backgroundColor: '#FFEBEE',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: '#F44336' }}>
          <LogoutIcon />
        </ListItemIcon>
        {(!isMobile || sidebarOpen) && <ListItemText primary="Logout" />}
      </ListItem>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={toggleSidebar}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarOpen ? 250 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? 250 : 80,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
