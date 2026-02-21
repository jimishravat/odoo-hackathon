/*
 * Backend/src/routes/drivers.js
 * -----------------------------
 * Purpose: CRUD endpoints for the `drivers` table (performance & compliance).
 *
 * What I implemented here:
 * - GET /api/drivers         -> list drivers (limited to 200)
 * - GET /api/drivers/:id     -> get a single driver by `driver_id`
 * - POST /api/drivers        -> create a new driver
 * - PUT /api/drivers/:id     -> update driver by `driver_id`
 * - DELETE /api/drivers/:id  -> delete driver by `driver_id`
 *
 * Implementation notes:
 * - Uses the shared DB pool and parameterized queries.
 * - Returns 404 when a requested record is not found.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

const TABLE = 'drivers';
const ID = 'driver_id';

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC LIMIT 200`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  // Business Rule: Only Manager can create driver records
  if (!req.user || req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Only Manager can create drivers' });
  }
  try {
    const [result] = await db.query(`INSERT INTO ${TABLE} SET ?`, [req.body]);
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  // Business Rule: Only Manager can update driver records
  if (!req.user || req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Only Manager can update drivers' });
  }
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

module.exports = router;
