/**
 * Dashboard Page
 * Shows KPI cards, charts, and recent activity
 * Role-specific content based on user's permissions
 */

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  useTheme,
  Chip,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import PeopleIcon from '@mui/icons-material/People';
import FuelIcon from '@mui/icons-material/LocalGasStation';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';

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
  const { user } = useAuth();
  const { can } = usePermission();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data - Fleet Manager KPIs (default/comprehensive)
  const fleetManagerKPIs = [
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
      title: 'Total Drivers',
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

  // Dispatcher KPIs
  const dispatcherKPIs = [
    {
      title: 'Active Trips',
      value: '18',
      icon: RouteIcon,
      color: theme.palette.success.main,
      subtitle: 'On the road',
    },
    {
      title: 'Available Vehicles',
      value: '233',
      icon: DirectionsCarIcon,
      color: theme.palette.primary.main,
      subtitle: '245 total',
    },
    {
      title: 'Available Drivers',
      value: '145',
      icon: PeopleIcon,
      color: theme.palette.info.main,
      subtitle: '156 total',
    },
  ];

  // Safety Officer KPIs
  const safetyOfficerKPIs = [
    {
      title: 'Compliance Status',
      value: '98%',
      icon: CheckCircleIcon,
      color: theme.palette.success.main,
      subtitle: 'All drivers compliant',
    },
    {
      title: 'License Expiries',
      value: '3',
      icon: WarningIcon,
      color: theme.palette.warning.main,
      subtitle: 'Next 30 days',
    },
    {
      title: 'Vehicles Due for Service',
      value: '12',
      icon: DirectionsCarIcon,
      color: theme.palette.error.main,
      subtitle: 'Pending maintenance',
    },
  ];

  // Financial Analyst KPIs
  const financialAnalystKPIs = [
    {
      title: 'Total Fleet Cost',
      value: '₹24.5L',
      icon: TrendingUpIcon,
      color: theme.palette.primary.main,
      subtitle: 'This month',
    },
    {
      title: 'Fuel Expenses',
      value: '₹8.2L',
      icon: FuelIcon,
      color: theme.palette.warning.main,
      subtitle: 'This month',
    },
    {
      title: 'Maintenance Cost',
      value: '₹5.1L',
      icon: DirectionsCarIcon,
      color: theme.palette.error.main,
      subtitle: 'This month',
    },
  ];

  // Select KPIs based on user role
  let displayedKPIs = fleetManagerKPIs;
  let roleDisplayName = 'Fleet Manager';
  let roleSubtitle = "Here's your fleet overview.";

  if (user?.role === 'dispatcher') {
    displayedKPIs = dispatcherKPIs;
    roleDisplayName = 'Dispatcher';
    roleSubtitle = "Active operations dashboard. Monitor trips and vehicle availability.";
  } else if (user?.role === 'safety_officer') {
    displayedKPIs = safetyOfficerKPIs;
    roleDisplayName = 'Safety Officer';
    roleSubtitle = "Compliance and safety monitoring dashboard.";
  } else if (user?.role === 'financial_analyst') {
    displayedKPIs = financialAnalystKPIs;
    roleDisplayName = 'Financial Analyst';
    roleSubtitle = "Cost analysis and budget tracking dashboard.";
  }

  // Mock data
  const kpiData = displayedKPIs;

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Chip
            label={roleDisplayName}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
        <Typography color="textSecondary">
          {roleSubtitle}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((item, index) => (
          <Grid item xs={12} sm={6} md={can.isAdmin() ? 3 : 4} key={index}>
            <KPICard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Progress Cards - Show based on role */}
      {can.isAdmin() && (
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
      )}

      {can.isDispatcher() && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Daily Trips Completed"
              value={14}
              total={18}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Fleet Availability"
              value={233}
              total={245}
              color={theme.palette.primary.main}
            />
          </Grid>
        </Grid>
      )}

      {can.isSafetyOfficer() && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="License Compliance"
              value={153}
              total={156}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Maintenance Compliance"
              value={233}
              total={245}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>
      )}

      {can.isFinancialAnalyst() && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Budget Utilization"
              value={24.5}
              total={35}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Cost Control"
              value={85}
              total={100}
              color={theme.palette.success.main}
            />
          </Grid>
        </Grid>
      )}

      {/* Recent Activity Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Activity
          </Typography>
          <Box sx={{ minHeight: '200px' }}>
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              {can.isAdmin() && 'Fleet overview and recent trips/maintenance will appear here.'}
              {can.isDispatcher() && 'Active trips and driver assignments will appear here.'}
              {can.isSafetyOfficer() && 'Compliance alerts and license expirations will appear here.'}
              {can.isFinancialAnalyst() && 'Cost trends and expense analytics will appear here.'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
