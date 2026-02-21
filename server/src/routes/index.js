
/*
 * Backend/src/routes/index.js
 * ---------------------------
 * Purpose: Central router that mounts individual resource routers.
 *
 * What I implemented here:
 * - Creates an Express Router and mounts route handlers for each resource
 *   (users, vehicles, drivers, cargo, trips, maintenance_logs, fuel_logs, expenses).
 * - Exports the router for use in `src/index.js` where it is mounted at `/api`.
 */

const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/vehicles', require('./vehicles'));
router.use('/drivers', require('./drivers'));
router.use('/cargo', require('./cargo'));
router.use('/trips', require('./trips'));
router.use('/maintenance_logs', require('./maintenance_logs'));
router.use('/fuel_logs', require('./fuel_logs'));
router.use('/expenses', require('./expenses'));
router.use('/reports', require('./reports'));

module.exports = router;
