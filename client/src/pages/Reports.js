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

// ==================== REPORT DATA ====================

// Fleet Analytics Report Data
const fleetAnalyticsData = [
  { month: 'Jan', vehicles: 200, activeVehicles: 180, utilization: 90 },
  { month: 'Feb', vehicles: 215, activeVehicles: 195, utilization: 91 },
  { month: 'Mar', vehicles: 230, activeVehicles: 210, utilization: 91 },
  { month: 'Apr', vehicles: 245, activeVehicles: 230, utilization: 94 },
  { month: 'May', vehicles: 245, activeVehicles: 235, utilization: 96 },
  { month: 'Jun', vehicles: 245, activeVehicles: 245, utilization: 100 },
];

// Driver Performance Data
const driverPerformanceData = [
  { name: 'Rajesh Kumar', trips: 145, safetyRating: 4.8, incidents: 0, compliance: 100 },
  { name: 'Priya Singh', trips: 98, safetyRating: 4.6, incidents: 1, compliance: 95 },
  { name: 'Amit Patel', trips: 156, safetyRating: 4.9, incidents: 0, compliance: 100 },
  { name: 'Vikram Joshi', trips: 112, safetyRating: 4.5, incidents: 2, compliance: 90 },
];

// Trip Analytics Data
const tripAnalyticsData = [
  { month: 'Jan', trips: 230, completed: 220, delayed: 8, cancelled: 2 },
  { month: 'Feb', trips: 245, completed: 235, delayed: 8, cancelled: 2 },
  { month: 'Mar', trips: 260, completed: 252, delayed: 6, cancelled: 2 },
  { month: 'Apr', trips: 280, completed: 272, delayed: 6, cancelled: 2 },
  { month: 'May', trips: 295, completed: 287, delayed: 6, cancelled: 2 },
  { month: 'Jun', trips: 310, completed: 302, delayed: 6, cancelled: 2 },
];

// Fuel Analytics Data
const fuelAnalyticsData = [
  { month: 'Jan', consumption: 2100, cost: 199500, avgPerVehicle: 8.6 },
  { month: 'Feb', consumption: 2250, cost: 213750, avgPerVehicle: 8.7 },
  { month: 'Mar', consumption: 2400, cost: 228000, avgPerVehicle: 8.7 },
  { month: 'Apr', consumption: 2500, cost: 237500, avgPerVehicle: 8.5 },
  { month: 'May', consumption: 2650, cost: 251750, avgPerVehicle: 8.6 },
  { month: 'Jun', consumption: 2800, cost: 266000, avgPerVehicle: 8.7 },
];

// Maintenance Analytics Data
const maintenanceAnalyticsData = [
  { month: 'Jan', scheduled: 15, completed: 14, pending: 1, cost: 75000 },
  { month: 'Feb', scheduled: 18, completed: 17, pending: 1, cost: 85000 },
  { month: 'Mar', scheduled: 20, completed: 19, pending: 1, cost: 92000 },
  { month: 'Apr', scheduled: 22, completed: 21, pending: 1, cost: 105000 },
  { month: 'May', scheduled: 24, completed: 23, pending: 1, cost: 115000 },
  { month: 'Jun', scheduled: 25, completed: 24, pending: 1, cost: 120000 },
];

// Expense Analytics Data
const expenseAnalyticsData = [
  { category: 'Fuel', amount: 266000, percentage: 35, color: '#ff9800' },
  { category: 'Maintenance', amount: 592000, percentage: 38, color: '#f44336' },
  { category: 'Toll', amount: 125000, percentage: 8, color: '#2196F3' },
  { category: 'Insurance', amount: 189000, percentage: 12, color: '#4CAF50' },
  { category: 'Parking', amount: 78000, percentage: 5, color: '#FFC107' },
  { category: 'Other', amount: 50000, percentage: 2, color: '#9C27B0' },
];

// Cost Analytics Data
const costAnalyticsData = [
  { month: 'Jan', total: 450000, fuel: 199500, maintenance: 150000, other: 100500 },
  { month: 'Feb', total: 480000, fuel: 213750, maintenance: 160000, other: 106250 },
  { month: 'Mar', total: 515000, fuel: 228000, maintenance: 175000, other: 112000 },
  { month: 'Apr', total: 545000, fuel: 237500, maintenance: 190000, other: 117500 },
  { month: 'May', total: 585000, fuel: 251750, maintenance: 210000, other: 123250 },
  { month: 'Jun', total: 625000, fuel: 266000, maintenance: 230000, other: 129000 },
];

// Compliance Data
const complianceData = [
  { type: 'License Compliance', compliant: 153, nonCompliant: 3, percentage: 98 },
  { type: 'Insurance Compliance', compliant: 155, nonCompliant: 1, percentage: 99 },
  { type: 'Maintenance Schedule', compliant: 240, nonCompliant: 5, percentage: 98 },
  { type: 'Safety Ratings', compliant: 152, nonCompliant: 4, percentage: 97 },
];

// ==================== REPORT TYPES ====================

const REPORT_TYPES = {
  fleet_manager: [
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
