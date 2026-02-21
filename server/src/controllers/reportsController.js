/*
 * Backend/src/controllers/reportsController.js
 * -------------------------------------------
 * Reporting endpoints used by Analysts / Managers. Example queries:
 * - vehicle usage (trips per vehicle)
 * - driver performance (trips completed per driver)
 * - trips by status
 */

const db = require('../db');

async function vehicleUsage(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT v.vehicle_id, v.registration, COUNT(t.trip_id) AS trips_count
      FROM vehicles v
      LEFT JOIN trips t ON t.vehicle_id = v.vehicle_id
      GROUP BY v.vehicle_id, v.registration
      ORDER BY trips_count DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function driverPerformance(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT d.driver_id, d.name, COUNT(t.trip_id) AS completed_trips
      FROM drivers d
      LEFT JOIN trips t ON t.driver_id = d.driver_id AND t.trip_status = 'Completed'
      GROUP BY d.driver_id, d.name
      ORDER BY completed_trips DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function tripsByStatus(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT trip_status, COUNT(*) AS count
      FROM trips
      GROUP BY trip_status
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { vehicleUsage, driverPerformance, tripsByStatus };
