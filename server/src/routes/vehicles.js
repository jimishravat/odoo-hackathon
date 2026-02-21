/*
 * Backend/src/routes/vehicles.js
 * -----------------------------
 * Purpose: CRUD endpoints for the `vehicles` table (fleet asset registry).
 *
 * What I implemented here:
 * - GET /api/vehicles        -> list vehicles (limited to 200)
 * - GET /api/vehicles/:id    -> get a single vehicle by `vehicle_id`
 * - POST /api/vehicles       -> create a new vehicle record
 * - PUT /api/vehicles/:id    -> update vehicle by `vehicle_id`
 * - DELETE /api/vehicles/:id -> delete vehicle by `vehicle_id`
 *
 * Implementation notes:
 * - Uses the shared `db` promise pool for queries.
 * - Uses parameterized queries and `INSERT ... SET ?` pattern to map request
 *   body fields to table columns directly (requires clients to send valid keys).
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

const TABLE = 'vehicles';
const ID = 'vehicle_id';

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const [result] = await db.query(`INSERT INTO ${TABLE} SET ?`, [req.body]);
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await db.query(`UPDATE ${TABLE} SET ? WHERE ${ID} = ?`, [req.body, req.params.id]);
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM ${TABLE} WHERE ${ID} = ?`, [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
