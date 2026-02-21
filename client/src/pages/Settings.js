/**
 * Settings Page - Role-based Settings Management
 * Shows different settings based on user role with profile, preferences, and role-specific options
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Person2Icon from '@mui/icons-material/Person2';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  Cancel,
  Edit as EditIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import NotificationSnackbar from '../components/NotificationSnackbar';

const Settings = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [profileEdit, setProfileEdit] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    tripAlerts: true,
    maintenanceReminders: true,
    fuelAlerts: true,
  });
  const [systemSettings, setSystemSettings] = useState({
    autoCalculateFuelExpense: true,
    enableOfflineMode: false,
    dataAutoSync: true,
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePassword = () => {
    if (!passwords.new || !passwords.confirm) {
      setSnackbar({
        open: true,
        message: 'Please fill all fields',
        severity: 'error',
      });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setSnackbar({
        open: true,
        message: 'Passwords do not match',
        severity: 'error',
      });
      return;
    }
    setChangePasswordOpen(false);
    setPasswords({ current: '', new: '', confirm: '' });
    setSnackbar({
      open: true,
      message: 'Password changed successfully',
      severity: 'success',
    });
  };

  const handleNotificationChange = (field) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSystemSettingChange = (field) => {
    setSystemSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getRoleLabel = (role) => {
    const labels = {
      fleet_manager: 'Fleet Manager',
      dispatcher: 'Dispatcher',
      safety_officer: 'Safety Officer',
      financial_analyst: 'Financial Analyst',
    };
    return labels[role] || role;
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Settings
        </Typography>
        <Typography color="textSecondary">
          Manage your profile, preferences, and system settings
        </Typography>
      </Box>

      {/* Profile Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1}}>
              <Person2Icon/>
              Profile Information
            </Typography>
            <Button
              startIcon={profileEdit?<Cancel/>:<EditIcon/>}
              size="small"
              onClick={() => setProfileEdit(!profileEdit)}
            >
              {profileEdit ? 'Cancel' : 'Edit'}
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Name
              </Typography>
              {profileEdit ? (
                <TextField
                  fullWidth
                  size="small"
                  defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                  variant="outlined"
                />
              ) : (
                <Typography variant="body1">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A'}</Typography>
              )}
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Email
              </Typography>
              <Typography variant="body1">{user?.email || 'N/A'}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Role
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'primary.light',
                  color: 'white',
                  borderRadius: 1,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                {getRoleLabel(user?.role)}
              </Box>
            </Box>

            {profileEdit && (
              <Box sx={{ pt: 2 }}>
                <Button variant="contained" size="small" sx={{ mr: 1 }}>
                  Save Changes
                </Button>
                <Button size="small" onClick={() => setProfileEdit(false)}>
                  Cancel
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <NotificationsIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notification Preferences
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.emailNotifications}
                  onChange={() => handleNotificationChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
            {user?.role !== 'financial_analyst' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.tripAlerts}
                    onChange={() => handleNotificationChange('tripAlerts')}
                  />
                }
                label="Trip Alerts"
              />
            )}
            {(hasPermission('maintenance', 'read') || hasPermission('maintenance', 'create')) && (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.maintenanceReminders}
                    onChange={() => handleNotificationChange('maintenanceReminders')}
                  />
                }
                label="Maintenance Reminders"
              />
            )}
            {(hasPermission('fuel', 'read') || hasPermission('fuel', 'create')) && (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.fuelAlerts}
                    onChange={() => handleNotificationChange('fuelAlerts')}
                  />
                }
                label="Fuel Alerts"
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Fleet Manager System Settings */}
      {user?.role === 'fleet_manager' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SettingsIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Settings
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.autoCalculateFuelExpense}
                    onChange={() => handleSystemSettingChange('autoCalculateFuelExpense')}
                  />
                }
                label="Auto-calculate Fuel Expense"
              />
              <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mt: -1 }}>
                Automatically sync fuel logs with expense calculations
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.enableOfflineMode}
                    onChange={() => handleSystemSettingChange('enableOfflineMode')}
                  />
                }
                label="Enable Offline Mode"
              />
              <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mt: -1 }}>
                Allow data entry when network is unavailable
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.dataAutoSync}
                    onChange={() => handleSystemSettingChange('dataAutoSync')}
                  />
                }
                label="Automatic Data Sync"
              />
              <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mt: -1 }}>
                Automatically sync data changes with the server
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Safety Officer Audit Settings */}
      {user?.role === 'safety_officer' && hasPermission('settings', 'read_audit') && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Audit & Compliance
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Last Audit Log Access
                </Typography>
                <Typography variant="body1">Never</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Audit Data Retention
                </Typography>
                <Typography variant="body1">90 days</Typography>
              </Box>

              <Button variant="outlined" size="small" fullWidth>
                View Audit Logs
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Security Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LockIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Security
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LockIcon />}
              onClick={() => setChangePasswordOpen(true)}
            >
              Change Password
            </Button>

            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Last Password Change
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Never
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              variant="outlined"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              variant="outlined"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              variant="outlined"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
            <Alert severity="info">
              Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </MainLayout>
  );
};

export default Settings;
