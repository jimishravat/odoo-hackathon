/**
 * Dashboard Page
 * Shows KPI cards, charts, and recent activity
 */

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import PeopleIcon from '@mui/icons-material/People';
import FuelIcon from '@mui/icons-material/LocalGasStation';
import { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';

// KPI Card Component
const KPICard = ({ title, value, icon: Icon, color, subtitle }) => {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: '2.5rem', color, opacity: 0.3 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Progress Card Component
const ProgressCard = ({ title, value, total, color }) => {
  const percentage = ((value / total) * 100).toFixed(0);

  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: color,
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '45px' }}>
            {percentage}%
          </Typography>
        </Box>
        <Typography variant="caption" color="textSecondary">
          {value} / {total}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const kpiData = [
    {
      title: 'Total Vehicles',
      value: '245',
      icon: DirectionsCarIcon,
      color: theme.palette.primary.main,
      subtitle: '12 in maintenance',
    },
    {
      title: 'Active Trips',
      value: '18',
      icon: RouteIcon,
      color: theme.palette.success.main,
      subtitle: 'On the road',
    },
    {
      title: 'Drivers',
      value: '156',
      icon: PeopleIcon,
      color: theme.palette.info.main,
      subtitle: '145 active',
    },
    {
      title: 'Fuel Consumed',
      value: '2.45K L',
      icon: FuelIcon,
      color: theme.palette.warning.main,
      subtitle: 'This month',
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography color="textSecondary">
          Welcome back! Here's your fleet overview.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Progress Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <ProgressCard
            title="Vehicle Utilization"
            value={180}
            total={245}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProgressCard
            title="Trip Completion Rate"
            value={1200}
            total={1245}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Activity
          </Typography>
          <Box sx={{ minHeight: '200px' }}>
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              Dashboard loading... Recent trips and maintenance records will appear here.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
