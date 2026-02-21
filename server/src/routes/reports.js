/*
 * Backend/src/routes/reports.js
 * ----------------------------
 * Reporting routes for Analyst/Manager roles.
 */

const express = require('express');
const router = express.Router();
const reportsCtrl = require('../controllers/reportsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/vehicle-usage', verifyToken, requireRole('Analyst','Manager'), reportsCtrl.vehicleUsage);
router.get('/driver-performance', verifyToken, requireRole('Analyst','Manager'), reportsCtrl.driverPerformance);
router.get('/trips-by-status', verifyToken, requireRole('Analyst','Manager'), reportsCtrl.tripsByStatus);

module.exports = router;
