
/*
 * Backend/src/routes/cargo.js
 * ---------------------------
 * Purpose: CRUD endpoints for the `cargo` table (pending shipments and KPI tracking).
 *
 * What I implemented here:
 * - GET /api/cargo           -> list cargo items (limited to 200)
 * - GET /api/cargo/:id       -> get a cargo item by `cargo_id`
 * - POST /api/cargo          -> create a new cargo record
 * - PUT /api/cargo/:id       -> update cargo record by `cargo_id`
 * - DELETE /api/cargo/:id    -> delete cargo record by `cargo_id`
 *
 * Implementation notes:
 * - Uses the shared `db` pool and parameterized queries to safely execute SQL.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

const TABLE = 'cargo';
const ID = 'cargo_id';

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC LIMIT 200`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    // Business Rule: If user_id is provided, it must reference a Dispatcher (role_id = 2)
    if (req.body.user_id) {
      const [users] = await db.query('SELECT role_id FROM users WHERE user_id = ?', [req.body.user_id]);
      if (!users.length || users[0].role_id !== 2) {
        return res.status(400).json({ error: 'user_id must reference a Dispatcher (role_id = 2)' });
      }
    }
    // Optionally, you can also validate driver_id here if needed
    const [result] = await db.query(`INSERT INTO ${TABLE} SET ?`, [req.body]);
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    await db.query(`UPDATE ${TABLE} SET ? WHERE ${ID} = ?`, [req.body, req.params.id]);
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM ${TABLE} WHERE ${ID} = ?`, [req.params.id]);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// Assign cargo to dispatcher (Manager only)
router.post('/:id/assign-dispatcher', async (req, res) => {
  // Business Rule: Only Manager can assign cargo to dispatcher
  if (!req.user || req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Only Manager can assign cargo to dispatcher' });
  }
  const { user_id } = req.body; // Dispatcher user_id
  if (!user_id) return res.status(400).json({ error: 'user_id (dispatcher) required' });
  try {
    await db.query('UPDATE cargo SET user_id = ?, status = ? WHERE cargo_id = ?', [user_id, 'ASSIGNED', req.params.id]);
    const [rows] = await db.query('SELECT * FROM cargo WHERE cargo_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Assign driver to cargo (Dispatcher only)
router.post('/:id/assign-driver', async (req, res) => {
  // Business Rule: Only Dispatcher can assign driver to cargo
  if (!req.user || req.user.role !== 'Dispatcher') {
    return res.status(403).json({ error: 'Only Dispatcher can assign driver to cargo' });
  }
  const { driver_id } = req.body;
  if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
  try {
    await db.query('UPDATE cargo SET driver_id = ? WHERE cargo_id = ?', [driver_id, req.params.id]);
    const [rows] = await db.query('SELECT * FROM cargo WHERE cargo_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
