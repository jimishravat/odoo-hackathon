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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import PeopleIcon from '@mui/icons-material/People';
import FuelIcon from '@mui/icons-material/LocalGasStation';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import {
  mockVehicles,
  mockDrivers,
  mockTrips,
  mockFuel,
  mockMaintenance,
  mockExpenses,
} from '../services/mockData';

// ==================== KPI CALCULATION FUNCTIONS ====================

/**
 * Calculate Fleet Manager KPIs from mock data
 * Synced with mockData.js as single source of truth
 */
const calculateFleetManagerKPIs = (theme) => {
  const totalVehicles = mockVehicles.length;
  const maintenanceVehicles = mockVehicles.filter(v => v.status === 'out of service').length;
  const activeTrips = mockTrips.filter(t => t.status === 'in-progress').length;
  const totalDrivers = mockDrivers.length;
  const activeDrivers = mockDrivers.filter(d => d.status === 'active').length;
  const totalFuelConsumed = mockFuel.reduce((sum, f) => sum + f.quantity, 0);

  return [
    {
      title: 'Total Vehicles',
      value: totalVehicles.toString(),
      icon: DirectionsCarIcon,
      color: theme.palette.primary.main,
      subtitle: `${maintenanceVehicles} in maintenance`,
    },
    {
      title: 'Active Trips',
      value: activeTrips.toString(),
      icon: RouteIcon,
      color: theme.palette.success.main,
      subtitle: 'On the road',
    },
    {
      title: 'Total Drivers',
      value: totalDrivers.toString(),
      icon: PeopleIcon,
      color: theme.palette.info.main,
      subtitle: `${activeDrivers} active`,
    },
    {
      title: 'Fuel Consumed',
      value: `${(totalFuelConsumed / 1000).toFixed(2)}K L`,
      icon: FuelIcon,
      color: theme.palette.warning.main,
      subtitle: 'This month',
    },
  ];
};

/**
 * Calculate Dispatcher KPIs from mock data
 * Focus on operational metrics
 */
const calculateDispatcherKPIs = (theme) => {
  const totalVehicles = mockVehicles.length;
  const availableVehicles = mockVehicles.filter(v => v.status === 'active').length;
  const activeTrips = mockTrips.filter(t => t.status === 'in-progress').length;
  const totalDrivers = mockDrivers.length;
  const availableDrivers = mockDrivers.filter(d => d.status === 'active').length;

  return [
    {
      title: 'Active Trips',
      value: activeTrips.toString(),
      icon: RouteIcon,
      color: theme.palette.success.main,
      subtitle: 'On the road',
    },
    {
      title: 'Available Vehicles',
      value: availableVehicles.toString(),
      icon: DirectionsCarIcon,
      color: theme.palette.primary.main,
      subtitle: `${totalVehicles} total`,
    },
    {
      title: 'Available Drivers',
      value: availableDrivers.toString(),
      icon: PeopleIcon,
      color: theme.palette.info.main,
      subtitle: `${totalDrivers} total`,
    },
  ];
};

/**
 * Calculate Safety Officer KPIs from mock data
 * Focus on compliance and safety metrics
 */
const calculateSafetyOfficerKPIs = (theme) => {
  const totalDrivers = mockDrivers.length;
  const expiredLicenses = mockDrivers.filter(d => new Date(d.licenseExpiry) < new Date()).length;
  const complianceRate = Math.round(((totalDrivers - expiredLicenses) / totalDrivers) * 100);
  
  // License expiries in next 30 days
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingExpiries = mockDrivers.filter(d => {
    const expiry = new Date(d.licenseExpiry);
    return expiry > today && expiry <= thirtyDaysFromNow;
  }).length;

  const vehiclesDueForService = mockVehicles.filter(v => v.status === 'out of service').length;

  return [
    {
      title: 'Compliance Status',
      value: `${complianceRate}%`,
      icon: CheckCircleIcon,
      color: theme.palette.success.main,
      subtitle: 'All drivers compliant',
    },
    {
      title: 'License Expiries',
      value: upcomingExpiries.toString(),
      icon: WarningIcon,
      color: theme.palette.warning.main,
      subtitle: 'Next 30 days',
    },
    {
      title: 'Vehicles Due for Service',
      value: vehiclesDueForService.toString(),
      icon: DirectionsCarIcon,
      color: theme.palette.error.main,
      subtitle: 'Pending maintenance',
    },
  ];
};

/**
 * Calculate Financial Analyst KPIs from mock data
 * Focus on cost and financial metrics
 */
const calculateFinancialAnalystKPIs = (theme) => {
  const totalFuelCost = mockFuel.reduce((sum, f) => sum + f.totalCost, 0);
  const maintenanceCost = mockMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const fleetCost = totalFuelCost + maintenanceCost + totalExpenses;

  return [
    {
      title: 'Total Fleet Cost',
      value: `₹${(fleetCost / 100000).toFixed(1)}L`,
      icon: TrendingUpIcon,
      color: theme.palette.primary.main,
      subtitle: 'This month',
    },
    {
      title: 'Fuel Expenses',
      value: `₹${(totalFuelCost / 100000).toFixed(1)}L`,
      icon: FuelIcon,
      color: theme.palette.warning.main,
      subtitle: 'This month',
    },
    {
      title: 'Maintenance Cost',
      value: `₹${(maintenanceCost / 100000).toFixed(1)}L`,
      icon: DirectionsCarIcon,
      color: theme.palette.error.main,
      subtitle: 'This month',
    },
  ];
};

// ==================== COMPONENT ====================

// Activity Item Component for Recent Activity
const ActivityItem = ({ icon: Icon, title, description, timestamp, severity = 'info' }) => {
  const colors = {
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#f44336',
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: `${colors[severity]}20`,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: colors[severity], fontSize: 20 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
          {description}
        </Typography>
        <Typography variant="caption" sx={{ color: '#999', mt: 0.5, display: 'block' }}>
          {timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Generate recent activities for Fleet Manager
 * Shows recent trips and maintenance
 */
const generateFleetManagerActivities = () => {
  const activities = [];

  // Recent completed trips
  mockTrips
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.endTime || 0) - new Date(a.endTime || 0))
    .slice(0, 3)
    .forEach(trip => {
      const driver = mockDrivers.find(d => d.id === trip.driver);
      const vehicle = mockVehicles.find(v => v.id === trip.vehicle);
      if (vehicle && driver) {
        activities.push({
          id: `trip-${trip.id}`,
          icon: RouteIcon,
          title: `Trip ${trip.tripNumber} Completed`,
          description: `${vehicle.name || 'Unknown Vehicle'} - ${trip.startLocation || 'N/A'} to ${trip.endLocation || 'N/A'}`,
          timestamp: trip.endTime ? new Date(trip.endTime).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A',
          severity: 'success',
        });
      }
    });

  // Recent maintenance
  mockMaintenance
    .sort((a, b) => {
      const dateA = new Date(a.completedDate || a.scheduledDate || 0);
      const dateB = new Date(b.completedDate || b.scheduledDate || 0);
      return dateB - dateA;
    })
    .slice(0, 2)
    .forEach(maintenance => {
      const vehicle = mockVehicles.find(v => v.id === maintenance.vehicle);
      if (vehicle) {
        activities.push({
          id: `maintenance-${maintenance.id}`,
          icon: WarningIcon,
          title: `Maintenance: ${maintenance.maintenanceType || 'Service'}`,
          description: `${vehicle.name || 'Unknown Vehicle'} - ${maintenance.description || 'N/A'}`,
          timestamp: maintenance.completedDate ? new Date(maintenance.completedDate).toLocaleString('en-IN', { month: 'short', day: 'numeric' }) : 'Pending',
          severity: 'warning',
        });
      }
    });

  return activities.slice(0, 5);
};

/**
 * Generate recent activities for Dispatcher
 * Shows active trips and driver assignments
 */
const generateDispatcherActivities = () => {
  const activities = [];

  // Active trips
  mockTrips
    .filter(t => t.status === 'in-progress')
    .forEach(trip => {
      const driver = mockDrivers.find(d => d.id === trip.driver);
      const vehicle = mockVehicles.find(v => v.id === trip.vehicle);
      if (vehicle && driver) {
        activities.push({
          id: `active-trip-${trip.id}`,
          icon: AccessTimeIcon,
          title: `🚚 ${driver.name || 'Unknown Driver'} - In Transit`,
          description: `${vehicle.name || 'Unknown Vehicle'} | ${trip.startLocation || 'N/A'} → ${trip.endLocation || 'N/A'}`,
          timestamp: `Distance: ${trip.distance || 0} km`,
          severity: 'info',
        });
      }
    });

  // Recent trip completions
  mockTrips
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.endTime || 0) - new Date(a.endTime || 0))
    .slice(0, 3)
    .forEach(trip => {
      const driver = mockDrivers.find(d => d.id === trip.driver);
      if (driver) {
        activities.push({
          id: `completed-trip-${trip.id}`,
          icon: CheckCircleIcon,
          title: `✓ ${driver.name || 'Unknown Driver'} - Trip Complete`,
          description: `Distance: ${trip.distance || 0} km | Rating: ${trip.rating || 'N/A'}`,
          timestamp: trip.endTime ? new Date(trip.endTime).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A',
          severity: 'success',
        });
      }
    });

  return activities.slice(0, 5);
};

/**
 * Generate recent activities for Safety Officer
 * Shows compliance alerts and expiry warnings
 */
const generateSafetyOfficerActivities = () => {
  const activities = [];

  // License expiry warnings
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  mockDrivers
    .filter(d => {
      const expiry = new Date(d.licenseExpiry);
      return expiry > today && expiry <= thirtyDaysFromNow;
    })
    .forEach(driver => {
      activities.push({
        id: `license-${driver.id}`,
        icon: WarningIcon,
        title: `⚠️ License Expiring Soon`,
        description: `${driver.name} - License expires on ${new Date(driver.licenseExpiry).toLocaleDateString('en-IN')}`,
        timestamp: `${Math.ceil((new Date(driver.licenseExpiry) - today) / (1000 * 60 * 60 * 24))} days remaining`,
        severity: 'warning',
      });
    });

  // Expired licenses
  mockDrivers
    .filter(d => new Date(d.licenseExpiry) < today)
    .forEach(driver => {
      activities.push({
        id: `expired-${driver.id}`,
        icon: ErrorIcon,
        title: `❌ License Expired`,
        description: `${driver.name} - License expired on ${new Date(driver.licenseExpiry).toLocaleDateString('en-IN')}`,
        timestamp: 'Action required',
        severity: 'error',
      });
    });

  // Vehicles due for maintenance
  mockVehicles
    .filter(v => v.status === 'out of service')
    .forEach(vehicle => {
      activities.push({
        id: `service-${vehicle.id}`,
        icon: WarningIcon,
        title: `🔧 Vehicle In Service`,
        description: `${vehicle.name} - Currently out of service`,
        timestamp: 'Check status',
        severity: 'warning',
      });
    });

  return activities.slice(0, 5);
};

/**
 * Generate recent activities for Financial Analyst
 * Shows cost updates and expense records
 */
const generateFinancialAnalystActivities = () => {
  const activities = [];

  // Recent fuel expenses
  mockFuel
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 3)
    .forEach(fuel => {
      const vehicle = mockVehicles.find(v => v.id === fuel.vehicle);
      if (vehicle) {
        activities.push({
          id: `fuel-${fuel.id}`,
          icon: FuelIcon,
          title: `⛽ Fuel Expense`,
          description: `${vehicle.name || 'Unknown Vehicle'} - ${fuel.quantity || 0}L @ ₹${fuel.price || 0}/L`,
          timestamp: `Cost: ₹${(fuel.totalCost || 0).toLocaleString('en-IN')}`,
          severity: 'info',
        });
      }
    });

  // Recent maintenance costs
  mockMaintenance
    .sort((a, b) => {
      const dateA = new Date(a.completedDate || a.scheduledDate || 0);
      const dateB = new Date(b.completedDate || b.scheduledDate || 0);
      return dateB - dateA;
    })
    .slice(0, 2)
    .forEach(maintenance => {
      const vehicle = mockVehicles.find(v => v.id === maintenance.vehicle);
      if (vehicle) {
        activities.push({
          id: `maint-cost-${maintenance.id}`,
          icon: WarningIcon,
          title: `🔧 Maintenance Cost`,
          description: `${vehicle.name || 'Unknown Vehicle'} - ${maintenance.maintenanceType || 'Service'}`,
          timestamp: `Cost: ₹${(maintenance.cost || 0).toLocaleString('en-IN')}`,
          severity: 'warning',
        });
      }
    });

  // High expense trips
  mockTrips
    .filter(t => (t.actualOperationalCost || 0) > 5000)
    .sort((a, b) => (b.actualOperationalCost || 0) - (a.actualOperationalCost || 0))
    .slice(0, 2)
    .forEach(trip => {
      const vehicle = mockVehicles.find(v => v.id === trip.vehicle);
      if (vehicle) {
        activities.push({
          id: `expense-trip-${trip.id}`,
          icon: TrendingUpIcon,
          title: `💰 High Cost Trip`,
          description: `${vehicle.name || 'Unknown Vehicle'} - ${trip.startLocation || 'N/A'} to ${trip.endLocation || 'N/A'}`,
          timestamp: `Cost: ₹${(trip.actualOperationalCost || 0).toLocaleString('en-IN')}`,
          severity: 'warning',
        });
      }
    });

  return activities.slice(0, 5);
};

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

  // Calculate KPIs dynamically from mock data
  const fleetManagerKPIs = calculateFleetManagerKPIs(theme);
  const dispatcherKPIs = calculateDispatcherKPIs(theme);
  const safetyOfficerKPIs = calculateSafetyOfficerKPIs(theme);
  const financialAnalystKPIs = calculateFinancialAnalystKPIs(theme);

  // Calculate metrics for progress cards
  const totalVehicles = mockVehicles.length;
  const activeVehicles = mockVehicles.filter(v => v.status === 'active').length;
  const completedTrips = mockTrips.filter(t => t.status === 'completed').length;
  const totalTrips = mockTrips.length;
  const totalDrivers = mockDrivers.length;
  const expiredLicenses = mockDrivers.filter(d => new Date(d.licenseExpiry) < new Date()).length;
  const compliantDrivers = totalDrivers - expiredLicenses;
  const vehiclesInMaintenance = mockVehicles.filter(v => v.status === 'out of service').length;
  const maintenanceCompliantVehicles = totalVehicles - vehiclesInMaintenance;
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const maxBudget = 3500000; // Rs 35L budget
  const budgetUtilization = (totalExpenses / maxBudget) * 100;

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
              value={activeVehicles}
              total={totalVehicles}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Trip Completion Rate"
              value={completedTrips}
              total={totalTrips}
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
              value={Math.floor(completedTrips * 0.7)}
              total={Math.floor(totalTrips * 0.8)}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Fleet Availability"
              value={activeVehicles}
              total={totalVehicles}
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
              value={compliantDrivers}
              total={totalDrivers}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Maintenance Compliance"
              value={maintenanceCompliantVehicles}
              total={totalVehicles}
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
              value={budgetUtilization.toFixed(1)}
              total={100}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressCard
              title="Cost Control"
              value={Math.min(100, 100 - budgetUtilization.toFixed(1))}
              total={100}
              color={theme.palette.success.main}
            />
          </Grid>
        </Grid>
      )}

      {/* Recent Activity Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            📋 Recent Activity
          </Typography>

          {/* Fleet Manager View - Recent Trips & Maintenance */}
          {can.isAdmin() && (
            <Box>
              {generateFleetManagerActivities().length > 0 ? (
                <Stack spacing={0}>
                  {generateFleetManagerActivities().map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                  ))}
                </Stack>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                  No recent activity available
                </Typography>
              )}
            </Box>
          )}

          {/* Dispatcher View - Active Trips & Assignments */}
          {can.isDispatcher() && (
            <Box>
              {generateDispatcherActivities().length > 0 ? (
                <Stack spacing={0}>
                  {generateDispatcherActivities().map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                  ))}
                </Stack>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                  All trips completed. No active trips at the moment.
                </Typography>
              )}
            </Box>
          )}

          {/* Safety Officer View - Compliance Alerts */}
          {can.isSafetyOfficer() && (
            <Box>
              {generateSafetyOfficerActivities().length > 0 ? (
                <Stack spacing={0}>
                  {generateSafetyOfficerActivities().map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                  ))}
                </Stack>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                  All compliance checks passed. No alerts.
                </Typography>
              )}
            </Box>
          )}

          {/* Financial Analyst View - Cost Updates */}
          {can.isFinancialAnalyst() && (
            <Box>
              {generateFinancialAnalystActivities().length > 0 ? (
                <Stack spacing={0}>
                  {generateFinancialAnalystActivities().map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                  ))}
                </Stack>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                  No recent cost updates available.
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
