/*
 * Backend/src/controllers/tripsController.js
 * -----------------------------------------
 * CRUD for trips plus specialized endpoints:
 * - assignDriver: assign a driver to a trip
 * - dispatchTrip: change status to 'Dispatched'
 * - completeTrip: change status to 'Completed'
 */

const db = require('../db');

async function list(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM trips ORDER BY trip_id DESC LIMIT 200');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getById(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM trips WHERE trip_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  try {
    const [result] = await db.query('INSERT INTO trips SET ?', [req.body]);
    const [rows] = await db.query('SELECT * FROM trips WHERE trip_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  try {
    await db.query('UPDATE trips SET ? WHERE trip_id = ?', [req.body, req.params.id]);
    const [rows] = await db.query('SELECT * FROM trips WHERE trip_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    await db.query('DELETE FROM trips WHERE trip_id = ?', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Specialized: assign driver to trip (only Dispatcher/Manager)
async function assignDriver(req, res) {
  try {
    const { driver_id } = req.body;
    if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
    await db.query('UPDATE trips SET driver_id = ?, trip_status = ? WHERE trip_id = ?', [driver_id, 'Assigned', req.params.id]);
    const [rows] = await db.query('SELECT * FROM trips WHERE trip_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Specialized: dispatch trip (Dispatcher/Manager)
async function dispatchTrip(req, res) {
  try {
    await db.query('UPDATE trips SET trip_status = ? WHERE trip_id = ?', ['Dispatched', req.params.id]);
    const [rows] = await db.query('SELECT * FROM trips WHERE trip_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Specialized: mark trip completed (Driver or Manager)
async function completeTrip(req, res) {
  try {
    await db.query('UPDATE trips SET trip_status = ? WHERE trip_id = ?', ['Completed', req.params.id]);
    const [rows] = await db.query('SELECT * FROM trips WHERE trip_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { list, getById, create, update, remove, assignDriver, dispatchTrip, completeTrip };
