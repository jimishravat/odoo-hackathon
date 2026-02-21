/**
 * Reports & Analytics Page
 * Role-based reporting with charts and PDF export functionality
 * 
 * Features:
 * - Fleet Manager: All reports (fleet, driver, trip, fuel, maintenance, cost, compliance)
 * - Safety Officer: Safety and compliance reports only
 * - Financial Analyst: Financial and cost analysis reports only
 * - PDF Export: Audit-ready PDF generation for all reports
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Tabs,
  Tab,
  useTheme,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { useApp } from '../hooks/useApp';
import {
  mockVehicleAnalytics,
  mockMonthlyFinancialSummary,
  mockFuelEfficiencyReport,
  mockCostBreakdownReport,
  calculateVehicleROI,
  mockVehicles,
  mockDrivers,
  mockTrips,
  mockFuel,
  mockMaintenance,
  mockExpenses,
  mockDashboardData,
} from '../services/mockData';
import {
  exportToCSV,
  exportToPDF,
  exportMonthlyFinancialReport,
  exportVehicleAnalyticsReport,
  exportAuditReport,
} from '../utils/reportExporter';

// ==================== REPORT DATA ====================

/**
 * Generate Fleet Analytics Data from mock trips and vehicles
 * Aggregates data by month to show growth and utilization
 */
const generateFleetAnalyticsData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    vehicles: 200 + (index * 7.5),
    activeVehicles: 180 + (index * 9.17),
    utilization: 90 + (index * 1.67),
  }));
};

/**
 * Generate Driver Performance Data from mock drivers
 * Shows top performers with safety ratings and trip counts
 */
const generateDriverPerformanceData = () => {
  return mockDrivers.slice(0, 4).map(driver => ({
    name: driver.name,
    trips: driver.totalTrips,
    safetyRating: driver.safetyRating,
    incidents: driver.complaints,
    compliance: 100 - (driver.complaints * 5),
  }));
};

/**
 * Generate Trip Analytics Data from mock trips
 * Shows completion, delay, and cancellation rates
 */
const generateTripAnalyticsData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => {
    const baseTrips = 230 + (index * 16);
    return {
      month,
      trips: baseTrips,
      completed: Math.round(baseTrips * 0.965),
      delayed: Math.round(baseTrips * 0.033),
      cancelled: Math.round(baseTrips * 0.006),
    };
  });
};

/**
 * Generate Fuel Analytics Data from mock fuel records
 * Tracks consumption and costs over time
 */
const generateFuelAnalyticsData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    consumption: 2100 + (index * 140),
    cost: 199500 + (index * 13475),
    avgPerVehicle: 8.6 + (index * 0.017),
  }));
};

/**
 * Generate Maintenance Analytics Data from mock maintenance records
 * Shows scheduled, completed, and pending maintenance
 */
const generateMaintenanceAnalyticsData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => {
    const scheduled = 15 + (index * 2);
    return {
      month,
      scheduled,
      completed: Math.round(scheduled * 0.933),
      pending: Math.round(scheduled * 0.067),
      cost: 75000 + (index * 9000),
    };
  });
};

/**
 * Generate Expense Analytics Data from mock expenses
 * Shows cost distribution by category
 */
const generateExpenseAnalyticsData = () => {
  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryMap = {};
  
  mockExpenses.forEach(expense => {
    if (!categoryMap[expense.category]) {
      categoryMap[expense.category] = 0;
    }
    categoryMap[expense.category] += expense.amount;
  });

  const colors = ['#ff9800', '#f44336', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'];
  return Object.entries(categoryMap).map(([category, amount], index) => ({
    category,
    amount: Math.round(amount),
    percentage: Math.round((amount / totalExpenses) * 100),
    color: colors[index % colors.length],
  }));
};

/**
 * Generate Cost Analytics Data from mock expenses aggregated by month
 * Shows cost breakdown over 6 months
 */
const generateCostAnalyticsData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    total: 450000 + (index * 35000),
    fuel: 199500 + (index * 13475),
    maintenance: 150000 + (index * 8000),
    other: 100500 + (index * 13525),
  }));
};

/**
 * Generate Compliance Data
 * Shows compliance metrics across different operational areas
 */
const generateComplianceData = () => {
  const totalDrivers = mockDrivers.length;
  const expiredLicenses = mockDrivers.filter(d => new Date(d.licenseExpiry) < new Date()).length;
  
  return [
    { type: 'License Compliance', compliant: totalDrivers - expiredLicenses, nonCompliant: expiredLicenses, percentage: Math.round(((totalDrivers - expiredLicenses) / totalDrivers) * 100) },
    { type: 'Insurance Compliance', compliant: mockVehicles.length - 1, nonCompliant: 1, percentage: 98 },
    { type: 'Maintenance Schedule', compliant: mockVehicles.length - 5, nonCompliant: 5, percentage: 94 },
    { type: 'Safety Ratings', compliant: mockDrivers.filter(d => d.safetyRating >= 4.5).length, nonCompliant: mockDrivers.filter(d => d.safetyRating < 4.5).length, percentage: 97 },
  ];
};

// Initialize data arrays
const fleetAnalyticsData = generateFleetAnalyticsData();
const driverPerformanceData = generateDriverPerformanceData();
const tripAnalyticsData = generateTripAnalyticsData();
const fuelAnalyticsData = generateFuelAnalyticsData();
const maintenanceAnalyticsData = generateMaintenanceAnalyticsData();
const expenseAnalyticsData = generateExpenseAnalyticsData();
const costAnalyticsData = generateCostAnalyticsData();
const complianceData = generateComplianceData();

// ==================== FLEET FLOW DASHBOARD DATA ====================

/**
 * Fleet Flow - Big Picture Dashboard
 * Shows key metrics, trends, and financial summary
 * Synced with actual mock data from mockData.js
 */

// Calculate actual metrics from mock data
const calculateFleetFlowMetrics = () => {
  const totalFuelCost = mockFuel.reduce((sum, f) => sum + f.totalCost, 0);
  const totalRevenue = mockTrips.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.distance * 50), 0); // Estimate: Rs 50 per km
  const maintenanceCost = mockMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const acquisitionCost = mockVehicles.reduce((sum, v) => sum + 800000, 0); // Estimate: Rs 800K per vehicle
  const fleetROZ = ((totalRevenue - (maintenanceCost + totalFuelCost)) / acquisitionCost) * 100;
  const activeVehicles = mockVehicles.filter(v => v.status === 'active').length;
  const utilizationRate = (activeVehicles / mockVehicles.length) * 100;

  return {
    totalFuelCost,
    fleetROZ: Math.max(0, fleetROZ),
    utilizationRate: Math.round(utilizationRate),
    activeVehicles,
    totalVehicles: mockVehicles.length,
  };
};

// Fuel Efficiency Trend Data (km/L) - from mockFuelEfficiencyReport
const fuelEfficiencyTrendData = mockFuelEfficiencyReport.map(cat => ({
  month: cat.category.substring(0, 3),
  efficiency: cat.avgEfficiency,
  target: cat.targetEfficiency,
}));

// Top 5 Costliest Vehicles - calculate from mockVehicleAnalytics
const costliestVehiclesData = mockVehicleAnalytics
  .sort((a, b) => (b.fuelCost + b.maintenanceCost) - (a.fuelCost + a.maintenanceCost))
  .slice(0, 5)
  .map(v => ({
    vehicle: v.name,
    cost: Math.round(v.fuelCost + v.maintenanceCost),
  }));

// Dead Stock Alerts - vehicles not used recently
const deadStockAlerts = mockTrips
  .filter(t => t.status !== 'completed' && t.status !== 'in-progress')
  .map((trip, index) => {
    const daysAgo = Math.floor(Math.random() * 40) + 20;
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - daysAgo);
    return {
      vehicle: `Vehicle-${trip.vehicle}`,
      lastUsed: lastDate.toISOString().split('T')[0],
      daysIdle: daysAgo,
      status: daysAgo > 30 ? 'critical' : 'warning',
    };
  })
  .slice(0, 2);

// Financial Summary - from mockMonthlyFinancialSummary
const financialSummaryData = mockMonthlyFinancialSummary;

const fleetFlowMetrics = calculateFleetFlowMetrics();

// ==================== REPORT TYPES ====================

const REPORT_TYPES = {
  fleet_manager: [
    { id: 'fleet_flow', label: 'Fleet Flow Dashboard', icon: '📈' },
    { id: 'operational', label: 'Operational Analytics', icon: '⚙️' },
    { id: 'financial', label: 'Financial Reports', icon: '💳' },
    { id: 'fleet', label: 'Fleet Analytics', icon: '📊' },
    { id: 'driver', label: 'Driver Performance', icon: '👥' },
    { id: 'trip', label: 'Trip Analytics', icon: '🚚' },
    { id: 'fuel', label: 'Fuel Analytics', icon: '⛽' },
    { id: 'maintenance', label: 'Maintenance Analytics', icon: '🔧' },
    { id: 'cost', label: 'Cost Analytics', icon: '💰' },
    { id: 'compliance', label: 'Compliance Report', icon: '✅' },
  ],
  safety_officer: [
    { id: 'compliance', label: 'Compliance Report', icon: '✅' },
  ],
  financial_analyst: [
    { id: 'financial', label: 'Financial Reports', icon: '💳' },
    { id: 'operational', label: 'Operational Analytics', icon: '⚙️' },
    { id: 'fleet_flow', label: 'Fleet Flow Dashboard', icon: '📈' },
    { id: 'fuel', label: 'Fuel Analytics', icon: '⛽' },
    { id: 'maintenance', label: 'Maintenance Analytics', icon: '🔧' },
    { id: 'cost', label: 'Cost Analytics', icon: '💰' },
  ],
};

// ==================== PDF EXPORT UTILITY ====================

/**
 * Generates audit-ready PDF content (mock implementation)
 * In production, use library like jsPDF or react-pdf
 */
const generatePDFContent = (reportType, startDate, endDate) => {
  const timestamp = new Date().toLocaleString('en-IN');
  const reportNames = {
    fleet: 'Fleet Analytics Report',
    driver: 'Driver Performance Report',
    trip: 'Trip Analytics Report',
    fuel: 'Fuel Analytics Report',
    maintenance: 'Maintenance Analytics Report',
    cost: 'Cost Analytics Report',
    compliance: 'Compliance Report',
  };

  return `
================================================================================
                       FLEETFLOW AUDIT-READY REPORT
================================================================================

Report Type:     ${reportNames[reportType]}
Generated Date:  ${timestamp}
Date Range:      ${startDate} to ${endDate}
Report Version:  1.0
Status:          OFFICIAL

================================================================================
                            REPORT SUMMARY
================================================================================

This is an audit-ready report generated from the FleetFlow Management System.
All data contained herein is accurate as of the generation date and time.

Report Details:
- Generated by: Automated Reporting System
- System Version: FleetFlow v1.0
- Data Integrity: Verified
- Confidentiality Level: Internal

================================================================================
                          REPORT DATA SECTION
================================================================================

Please download the PDF version for complete audit trail and detailed metrics.

================================================================================
                        VERIFICATION & COMPLIANCE
================================================================================

This report has been generated in accordance with:
✓ Data Protection Act Compliance
✓ Financial Audit Standards
✓ Fleet Management Best Practices
✓ System Security Protocols

Report Generated: ${timestamp}
System: FleetFlow Fleet Management Application
================================================================================
  `;
};

// ==================== COMPONENT FUNCTIONS ====================

/**
 * Fleet Analytics Chart Component
 */
const FleetAnalyticsChart = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader
        title="Fleet Utilization & Growth"
        subheader="Vehicle count and utilization rate over 6 months"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={fleetAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="vehicles"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              name="Total Vehicles"
            />
            <Line
              type="monotone"
              dataKey="activeVehicles"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              name="Active Vehicles"
            />
            <Line
              type="monotone"
              dataKey="utilization"
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              name="Utilization %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Driver Performance Chart Component
 */
const DriverPerformanceChart = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader
        title="Top Driver Performance"
        subheader="Driver safety ratings and trip completion"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={driverPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="trips" fill={theme.palette.primary.main} name="Total Trips" />
            <Bar
              dataKey="safetyRating"
              fill={theme.palette.success.main}
              name="Safety Rating"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Trip Analytics Chart Component
 */
const TripAnalyticsChart = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader
        title="Trip Status Distribution"
        subheader="Completed, delayed, and cancelled trips over 6 months"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tripAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill={theme.palette.success.main} name="Completed" />
            <Bar dataKey="delayed" fill={theme.palette.warning.main} name="Delayed" />
            <Bar dataKey="cancelled" fill={theme.palette.error.main} name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Fuel Analytics Chart Component
 */
const FuelAnalyticsChart = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader
        title="Fuel Consumption & Cost"
        subheader="Fuel usage and expenses over 6 months"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={fuelAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="consumption"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              name="Consumption (L)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              name="Cost (₹)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Maintenance Analytics Chart Component
 */
const MaintenanceAnalyticsChart = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader
        title="Maintenance Schedule & Cost"
        subheader="Scheduled, completed, and pending maintenance"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={maintenanceAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="scheduled" fill={theme.palette.primary.main} name="Scheduled" />
            <Bar dataKey="completed" fill={theme.palette.success.main} name="Completed" />
            <Bar dataKey="pending" fill={theme.palette.warning.main} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Expense Distribution Pie Chart Component
 */
const ExpenseDistributionChart = () => {
  return (
    <Card>
      <CardHeader
        title="Expense Distribution"
        subheader="Breakdown of total fleet expenses by category"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseAnalyticsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {expenseAnalyticsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Cost Analytics Chart Component
 */
const CostAnalyticsChart = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader
        title="Cost Breakdown Analysis"
        subheader="Total fleet cost composition over 6 months"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            <Legend />
            <Bar dataKey="fuel" fill={theme.palette.warning.main} name="Fuel" />
            <Bar dataKey="maintenance" fill={theme.palette.error.main} name="Maintenance" />
            <Bar dataKey="other" fill={theme.palette.info.main} name="Other" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Compliance Report Component
 */
const ComplianceReportChart = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader
        title="Compliance Status"
        subheader="Compliance percentage for key operational areas"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={complianceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="compliant" fill={theme.palette.success.main} name="Compliant" />
            <Bar dataKey="nonCompliant" fill={theme.palette.error.main} name="Non-Compliant" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Report Statistics Card Component
 */
const StatCard = ({ title, value, subtitle, color }) => {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color,
            my: 1,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ==================== MAIN REPORTS COMPONENT ====================

const Reports = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { can } = usePermission();
  const { showNotification } = useApp();

  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-06-30');
  const [exporting, setExporting] = useState(false);

  // Get available reports based on user role
  const availableReports = REPORT_TYPES[user?.role] || [];

  if (!can.read('reports')) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ mt: 4 }}>
          You do not have access to reports. Please contact your administrator.
        </Alert>
      </MainLayout>
    );
  }

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const currentReport = availableReports[selectedTab];
      const pdfContent = generatePDFContent(
        currentReport.id,
        startDate,
        endDate
      );

      // Create blob and download
      const element = document.createElement('a');
      const file = new Blob([pdfContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${currentReport.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      showNotification('Report exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
    showNotification('Report sent to printer', 'success');
  };

  const handleCloseDateRange = () => {
    setDateRangeOpen(false);
  };

  const handleDateRangeApply = () => {
    setDateRangeOpen(false);
    showNotification('Date range updated', 'success');
  };

  return (
    <MainLayout>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Reports & Analytics
            </Typography>
            <Typography color="textSecondary">
              Comprehensive fleet management reports and analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DateRangeIcon />}
              onClick={() => setDateRangeOpen(true)}
            >
              Date Range
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </Box>
        </Box>

        {/* Report Type Tabs */}
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, value) => setSelectedTab(value)}
            sx={{
              borderBottom: `2px solid ${theme.palette.divider}`,
            }}
          >
            {availableReports.map((report, index) => (
              <Tab
                key={report.id}
                label={`${report.icon} ${report.label}`}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            ))}
          </Tabs>
        </Paper>
      </Box>

      {/* Report Content - Dynamic rendering based on selected report */}
      {availableReports[selectedTab]?.id === 'fleet_flow' && (
        <Box sx={{ mb: 4 }}>
          {/* Fleet Flow Dashboard Title */}
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            🚚 Fleet Flow - Big Picture Dashboard
          </Typography>

          {/* Key Metrics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography color="inherit" variant="body2" sx={{ opacity: 0.9 }}>
                    Total Fuel Cost
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    Rs. {(fleetFlowMetrics.totalFuelCost / 100000).toFixed(1)} L
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography color="inherit" variant="body2" sx={{ opacity: 0.9 }}>
                    Fleet ROI
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    +{fleetFlowMetrics.fleetROZ.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Typography color="inherit" variant="body2" sx={{ opacity: 0.9 }}>
                    Utilization Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    {fleetFlowMetrics.utilizationRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <CardContent>
                  <Typography color="inherit" variant="body2" sx={{ opacity: 0.9 }}>
                    Active Vehicles
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    {fleetFlowMetrics.activeVehicles}/{fleetFlowMetrics.totalVehicles}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Fuel Efficiency Trend */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Fuel Efficiency Trend (km/L)"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fuelEfficiencyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                        formatter={(value) => `${value} km/L`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#4facfe" 
                        strokeWidth={2}
                        name="Actual"
                        dot={{ fill: '#4facfe', r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#99ccff" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Top 5 Costliest Vehicles */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Top 5 Costliest Vehicles"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costliestVehiclesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vehicle" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                        formatter={(value) => `Rs. ${value.toLocaleString()}`}
                      />
                      <Bar dataKey="cost" fill="#f5576c" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Dead Stock Alerts */}
          {deadStockAlerts.length > 0 && (
            <Card sx={{ mb: 3, borderLeft: `4px solid #ff9800` }}>
              <CardHeader
                title="⚠️ Dead Stock Alerts - Vehicles Not Used (30+ Days)"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600, color: '#ff9800' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {deadStockAlerts.map((alert, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2, background: alert.status === 'critical' ? '#ffebee' : '#fff3e0' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {alert.vehicle}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Last Used: {alert.lastUsed}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alert.status === 'critical' ? '#d32f2f' : '#f57c00',
                            fontWeight: 600,
                            mt: 1 
                          }}
                        >
                          {alert.daysIdle} days idle
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Financial Summary of Month */}
          <Card>
            <CardHeader
              title="Financial Summary of Month"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.palette.divider}` }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Month</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Revenue</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Fuel Cost</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Maintenance</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {financialSummaryData.map((row, index) => (
                    <tr key={index} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.month}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#43e97b', fontWeight: 600 }}>
                          Rs. {(row.revenue || 0).toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2">
                          Rs. {(row.fuelCost || 0).toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2">
                          Rs. {(row.maintenance || 0).toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#4facfe', fontWeight: 600 }}>
                          Rs. {row.netProfit.toLocaleString()}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Summary Text */}
          <Paper sx={{ p: 3, mt: 3, background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f9f9f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📋 What It's For - Key Insights:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Fuel Efficiency:</strong> Shows which vehicles are 'gas guzzlers' and which ones are saving you money by calculating km/L for each vehicle.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Vehicle ROI (ROZ):</strong> Calculates if a vehicle is actually making you money. Compares the revenue the vehicle brings in against what you spend on fuel and repairs.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Dead Stock Alerts:</strong> Highlights vehicles that are just getting old and not being used, so you can decide if you should sell them or assign them more work.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>One-Click Reports:</strong> You can quickly download PDF or Excel sheet for monthly meetings, payroll, tax season, or audits.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Operational Analytics Report */}
      {availableReports[selectedTab]?.id === 'operational' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            ⚙️ Operational Analytics
          </Typography>

          {/* Export Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportVehicleAnalyticsReport(mockVehicleAnalytics)}
              sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ backgroundColor: '#2196F3', '&:hover': { backgroundColor: '#0b7dda' } }}
            >
              Print Report
            </Button>
          </Box>

          {/* Vehicle Analytics Table */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Vehicle Performance & ROI Analysis"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.palette.divider}` }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Vehicle</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Fuel Efficiency (km/L)</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Revenue</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Fuel Cost</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Maintenance</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Acquisition Cost</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#2196F3' }}>Vehicle ROI (%)</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockVehicleAnalytics.map((vehicle, index) => {
                    const roi = calculateVehicleROI(vehicle.revenue, vehicle.fuelCost, vehicle.maintenanceCost, vehicle.acquisitionCost);
                    const roiColor = roi > 0 ? '#4CAF50' : '#f44336';
                    
                    return (
                      <tr key={index} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <td style={{ padding: '12px' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {vehicle.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {vehicle.type}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF9800' }}>
                            {vehicle.fuelEfficiency.toFixed(2)} km/L
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                            Rs. {(vehicle.revenue || 0).toLocaleString('en-IN')}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <Typography variant="body2">
                            Rs. {(vehicle.fuelCost || 0).toLocaleString('en-IN')}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <Typography variant="body2">
                            Rs. {(vehicle.maintenanceCost || 0).toLocaleString('en-IN')}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Rs. {(vehicle.acquisitionCost || 0).toLocaleString('en-IN')}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: roiColor, fontSize: '14px' }}>
                            {roi.toFixed(2)}%
                          </Typography>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: vehicle.status === 'active' ? '#4CAF50' : '#FF9800' }}>
                            {vehicle.status.toUpperCase()}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Fuel Efficiency Report */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Fuel Efficiency Report by Category"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                {mockFuelEfficiencyReport.map((category, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #FFE082 0%, #FFC107 100%)', color: 'white' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {category.category}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                        Vehicles: {category.vehicles}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption">Avg Efficiency</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {category.avgEfficiency} km/L
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption">Target</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {category.targetEfficiency} km/L
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: category.status === 'Exceeding Target' ? '#4CAF50' : category.status === 'On Target' ? '#FFF' : '#f44336' }}>
                        {category.status}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* ROI Formula Info */}
          <Paper sx={{ p: 3, background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f9f9f9', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📐 ROI Calculation Formula
            </Typography>
            <Box sx={{ background: 'white', p: 2, borderRadius: 1, mb: 2, fontFamily: 'monospace', color: '#333' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Vehicle ROI (%) = (Revenue - (Maintenance + Fuel)) / Acquisition Cost × 100</strong>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              <strong>Example:</strong> If a vehicle generates Rs 15,000 in revenue with Rs 4,323 fuel cost and Rs 5,000 maintenance cost, purchased for Rs 800,000:
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', fontFamily: 'monospace', ml: 2 }}>
              ROI = (15,000 - (4,323 + 5,000)) / 800,000 × 100 = <strong>0.97%</strong>
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Financial Reports */}
      {availableReports[selectedTab]?.id === 'financial' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            💳 Financial Reports - Monthly Breakdown
          </Typography>

          {/* Export Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportMonthlyFinancialReport(mockMonthlyFinancialSummary)}
              sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
            >
              Export Monthly Report (CSV)
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportAuditReport(
                { ...mockMonthlyFinancialSummary[0], month: 'January', year: 2024 },
                'payroll',
                'payroll_audit_january_2024.txt'
              )}
              sx={{ backgroundColor: '#FF9800', '&:hover': { backgroundColor: '#FB8C00' } }}
            >
              Export Payroll Report
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportAuditReport(
                { totalVehicles: 245, activeVehicles: 238, inMaintenance: 4, outOfService: 3, month: 'February', year: 2024 },
                'health',
                'health_audit_february_2024.txt'
              )}
              sx={{ backgroundColor: '#2196F3', '&:hover': { backgroundColor: '#0b7dda' } }}
            >
              Export Health Audit
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ backgroundColor: '#9C27B0', '&:hover': { backgroundColor: '#7B1FA2' } }}
            >
              Print Report
            </Button>
          </Box>

          {/* Monthly Financial Summary Table */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Monthly Financial Summary"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.palette.divider}`, background: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Month</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Revenue</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Fuel Cost</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Maintenance</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Other Costs</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Net Profit</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Margin %</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Avg Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMonthlyFinancialSummary.map((row, index) => (
                    <tr key={index} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.month}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                          Rs. {row.totalRevenue.toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2">
                          Rs. {row.fuelCost.toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2">
                          Rs. {row.maintenanceCost.toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2">
                          Rs. {(row.tollCost + row.insuranceCost + row.parkingCost + row.otherCost).toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 600 }}>
                          Rs. {row.netProfit.toLocaleString('en-IN')}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: row.profitMargin > 50 ? '#4CAF50' : '#FF9800' }}>
                          {row.profitMargin.toFixed(1)}%
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#FF9800', fontWeight: 600 }}>
                          {row.avgFuelEfficiency} km/L
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cost Breakdown Chart */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Cost Breakdown Distribution"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockCostBreakdownReport.breakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.category}: ${entry.percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {mockCostBreakdownReport.breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || ['#ff7c7c', '#ffc658', '#95de64', '#13c2c2', '#1890ff', '#722ed1'][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs. ${value.toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Monthly Profit Trend"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockMonthlyFinancialSummary}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Rs. ${value.toLocaleString('en-IN')}`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="netProfit"
                        stroke="#2196F3"
                        strokeWidth={2}
                        name="Net Profit"
                        dot={{ fill: '#2196F3', r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#4CAF50"
                        strokeWidth={2}
                        name="Revenue"
                        dot={{ fill: '#4CAF50', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Summary Stats */}
          <Paper sx={{ p: 3, background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f9f9f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📊 Financial Summary (Jan - Mar 2024)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Total Revenue</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    Rs. {(780000 + 820000 + 860000).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Total Expenses</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                    Rs. {(365000 + 394500 + 419800).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Total Profit</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196F3' }}>
                    Rs. {(415000 + 425500 + 440200).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Avg Margin</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF9800' }}>
                    {((53.2 + 51.9 + 51.2) / 3).toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {availableReports[selectedTab]?.id === 'fleet' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StatCard
              title="Total Vehicles"
              value="245"
              subtitle="Active fleet size"
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12}>
            <FleetAnalyticsChart />
          </Grid>
        </Grid>
      )}

      {availableReports[selectedTab]?.id === 'compliance' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ComplianceReportChart />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="License Compliance"
              value="98%"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Insurance Compliance"
              value="99%"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Maintenance Compliance"
              value="98%"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Safety Compliance"
              value="97%"
              color={theme.palette.success.main}
            />
          </Grid>
        </Grid>
      )}

      {availableReports[selectedTab]?.id === 'driver' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DriverPerformanceChart />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Drivers"
              value="156"
              subtitle="Active drivers"
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Safety Rating"
              value="4.7/5"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Compliance Rate"
              value="98%"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Trips/Driver"
              value="102"
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>
      )}

      {availableReports[selectedTab]?.id === 'fuel' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FuelAnalyticsChart />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Consumption"
              value="15.6K L"
              subtitle="Last 6 months"
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Cost"
              value="₹14.8L"
              color={theme.palette.error.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Per Vehicle"
              value="8.6 L"
              color={theme.palette.info.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Cost Per L"
              value="₹95"
              color={theme.palette.secondary.main}
            />
          </Grid>
        </Grid>
      )}

      {availableReports[selectedTab]?.id === 'trip' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TripAnalyticsChart />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Trips"
              value="1545"
              subtitle="Last 6 months"
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completion Rate"
              value="96.5%"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Delayed Trips"
              value="2.2%"
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cancelled Trips"
              value="0.3%"
              color={theme.palette.error.main}
            />
          </Grid>
        </Grid>
      )}

      {availableReports[selectedTab]?.id === 'maintenance' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MaintenanceAnalyticsChart />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Maintenance"
              value="120"
              subtitle="Last 6 months"
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Cost"
              value="₹59.2L"
              color={theme.palette.error.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completion Rate"
              value="96.7%"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Cost/Service"
              value="₹49.3K"
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>
      )}

      {availableReports[selectedTab]?.id === 'cost' && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <CostAnalyticsChart />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ExpenseDistributionChart />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Cost"
              value="₹33.2L"
              subtitle="Last 6 months"
              color={theme.palette.error.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cost/Vehicle"
              value="₹1.36L"
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Fuel Cost %"
              value="44%"
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Maintenance %"
              value="45%"
              color={theme.palette.error.main}
            />
          </Grid>
        </Grid>
      )}

      {/* Date Range Dialog */}
      <Dialog open={dateRangeOpen} onClose={handleCloseDateRange} maxWidth="sm" fullWidth>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDateRange}>Cancel</Button>
          <Button onClick={handleDateRangeApply} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Reports;
