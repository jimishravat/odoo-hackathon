/**
 * Report Exporter Utility
 * Handles CSV and PDF export for operational and financial reports
 */

/**
 * Export data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file
 * @param {Array} columns - Column headers (optional)
 */
export const exportToCSV = (data, filename = 'report.csv', columns = null) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Get headers from first object if not provided
    const headers = columns || Object.keys(data[0]);
    
    // Create CSV header row
    const csvHeader = headers.join(',');
    
    // Create CSV data rows
    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      }).join(',')
    );
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, message: `File exported as ${filename}` };
  } catch (error) {
    console.error('CSV Export Error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Export data as PDF file (mock implementation)
 * For production, integrate jsPDF library
 * 
 * @param {Object} reportData - Report data object
 * @param {string} reportTitle - Title of the report
 * @param {string} filename - Name of the PDF file
 */
export const exportToPDF = (reportData, reportTitle = 'Report', filename = 'report.pdf') => {
  try {
    // Create HTML content for PDF
    const htmlContent = generatePDFHTML(reportData, reportTitle);
    
    // Create blob with HTML
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename.replace('.pdf', '.html')); // For now, export as HTML
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, message: `PDF exported as ${filename}` };
  } catch (error) {
    console.error('PDF Export Error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Generate HTML content for PDF report
 * @param {Object} reportData - Report data
 * @param {string} title - Report title
 * @returns {string} HTML content
 */
const generatePDFHTML = (reportData, title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background-color: #f5f5f5;
        }
        .header {
          background-color: #333;
          color: white;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 5px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th {
          background-color: #2196F3;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #ddd;
        }
        tr:hover {
          background-color: #f9f9f9;
        }
        .summary {
          background-color: white;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary h2 {
          color: #333;
          margin: 0 0 10px 0;
        }
        .metric {
          display: inline-block;
          margin-right: 30px;
          margin-bottom: 10px;
        }
        .metric-label {
          font-size: 12px;
          color: #666;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #2196F3;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
      
      ${typeof reportData === 'string' ? reportData : `<pre>${JSON.stringify(reportData, null, 2)}</pre>`}
      
      <div class="footer">
        <p>© 2024 FleetFlow - Operational Analytics & Financial Reports</p>
        <p>This is an auto-generated report for audit and payroll purposes.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export Monthly Financial Report
 * @param {Array} monthlyData - Array of monthly financial data
 * @param {string} filename - Name of export file
 */
export const exportMonthlyFinancialReport = (monthlyData, filename = 'monthly_financial_report.csv') => {
  const columns = [
    'month',
    'year',
    'totalRevenue',
    'fuelCost',
    'maintenanceCost',
    'tollCost',
    'insuranceCost',
    'parkingCost',
    'otherCost',
    'totalExpenses',
    'netProfit',
    'profitMargin',
    'vehiclesOperating',
    'tripsCompleted',
    'avgFuelEfficiency',
  ];
  
  return exportToCSV(monthlyData, filename, columns);
};

/**
 * Export Vehicle Analytics Report
 * @param {Array} analyticsData - Array of vehicle analytics
 * @param {string} filename - Name of export file
 */
export const exportVehicleAnalyticsReport = (analyticsData, filename = 'vehicle_analytics_report.csv') => {
  const columns = [
    'name',
    'type',
    'acquisitionCost',
    'totalDistance',
    'fuelConsumed',
    'fuelEfficiency',
    'fuelCost',
    'maintenanceCost',
    'revenue',
    'totalTrips',
    'status',
  ];
  
  return exportToCSV(analyticsData, filename, columns);
};

/**
 * Generate Payroll Report (for employee expenses)
 * @param {Array} payrollData - Driver payroll data
 * @param {string} month - Month (e.g., 'January')
 * @param {number} year - Year (e.g., 2024)
 */
export const generatePayrollReport = (payrollData, month, year) => {
  const reportContent = `
    PAYROLL REPORT
    Month: ${month} ${year}
    Generated: ${new Date().toLocaleDateString('en-IN')}
    
    ===================================
    SUMMARY
    ===================================
    Total Drivers: ${payrollData.length}
    Total Payroll: Rs. ${payrollData.reduce((sum, emp) => sum + emp.salary, 0).toLocaleString('en-IN')}
    Total Allowances: Rs. ${payrollData.reduce((sum, emp) => sum + (emp.allowance || 0), 0).toLocaleString('en-IN')}
    Total Deductions: Rs. ${payrollData.reduce((sum, emp) => sum + (emp.deduction || 0), 0).toLocaleString('en-IN')}
    
    ===================================
    DETAILED BREAKDOWN
    ===================================
  `;
  
  return reportContent;
};

/**
 * Generate Health Audit Report
 * @param {Object} auditData - Vehicle health and maintenance data
 * @param {string} month - Month of audit
 * @param {number} year - Year of audit
 */
export const generateHealthAuditReport = (auditData, month, year) => {
  const reportContent = `
    VEHICLE HEALTH AUDIT REPORT
    Month: ${month} ${year}
    Generated: ${new Date().toLocaleDateString('en-IN')}
    
    ===================================
    VEHICLE STATUS SUMMARY
    ===================================
    Total Vehicles: ${auditData.totalVehicles}
    Active: ${auditData.activeVehicles}
    Maintenance: ${auditData.inMaintenance}
    Out of Service: ${auditData.outOfService}
    
    ===================================
    CRITICAL ALERTS
    ===================================
    • Vehicles overdue for service: ${auditData.overdueService || 0}
    • Vehicles with warranty issues: ${auditData.warrantyIssues || 0}
    • Vehicles exceeding mileage limits: ${auditData.mileageExceeded || 0}
    
    ===================================
    MAINTENANCE SCHEDULE
    ===================================
    Scheduled this month: ${auditData.scheduledMaintenance || 0}
    Completed: ${auditData.completedMaintenance || 0}
    Pending: ${auditData.pendingMaintenance || 0}
  `;
  
  return reportContent;
};

/**
 * Export comprehensive audit report
 * @param {Object} reportData - Complete audit data
 * @param {string} reportType - Type of report ('payroll' or 'health')
 * @param {string} filename - Export filename
 */
export const exportAuditReport = (reportData, reportType = 'payroll', filename = 'audit_report.csv') => {
  try {
    let content;
    
    if (reportType === 'payroll') {
      content = generatePayrollReport(reportData, reportData.month, reportData.year);
    } else if (reportType === 'health') {
      content = generateHealthAuditReport(reportData, reportData.month, reportData.year);
    } else {
      throw new Error('Invalid report type');
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, message: `${reportType} audit report exported` };
  } catch (error) {
    console.error('Audit Report Export Error:', error);
    return { success: false, message: error.message };
  }
};
