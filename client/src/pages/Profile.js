/**
 * Profile Page - User Profile Management
 * Displays user's personal and professional information
 */

import { Box, Typography, Paper, Grid, Divider, Card, CardContent, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  // Role display mapping
  const roleMapping = {
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  };

  // Role color mapping
  const roleColors = {
    fleet_manager: '#2196F3',
    dispatcher: '#FF9800',
    safety_officer: '#4CAF50',
    financial_analyst: '#9C27B0',
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Get user initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (!user) {
    return (
      <MainLayout>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">Loading profile...</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          My Profile
        </Typography>
        <Typography color="textSecondary">
          View and manage your profile information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Profile Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {/* Header Section with Avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: roleColors[user.role] || '#2196F3',
                  fontSize: '2rem',
                  mr: 3,
                }}
              >
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Chip
                  label={roleMapping[user.role] || user.role}
                  sx={{
                    mt: 1,
                    bgcolor: roleColors[user.role] || '#2196F3',
                    color: '#fff',
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Information Grid */}
            <Grid container spacing={2}>
              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <EmailIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      Email Address
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <PhoneIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      Phone Number
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {user.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <BusinessIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      Department
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {user.department || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <BadgeIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      Role
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {roleMapping[user.role] || user.role}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationOnIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      Address
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }} sx={{ wordBreak: 'break-word' }}>
                      {user.address || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Member Since */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CalendarTodayIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      Member Since
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Side Info Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Account Status
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip label="Active" variant="outlined" color="success" />
                </Box>
              </Box>

              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mt: 2 }}>
                User ID
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                #{user.id}
              </Typography>

              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mt: 2 }}>
                Account Type
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Registered User
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Profile;
