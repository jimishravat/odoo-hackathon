/*
 * Backend/src/routes/maintenance_logs.js
 * --------------------------------------
 * Purpose: CRUD endpoints for the `maintenance_logs` table (vehicle health tracking).
 *
 * What I implemented here:
 * - GET /api/maintenance_logs          -> list maintenance logs (limited to 200)
 * - GET /api/maintenance_logs/:id      -> get a log by `maintenance_id`
 * - POST /api/maintenance_logs         -> create a new maintenance log
 * - PUT /api/maintenance_logs/:id      -> update a log by `maintenance_id`
 * - DELETE /api/maintenance_logs/:id   -> delete a log by `maintenance_id`
 *
 * Implementation notes:
 * - This file follows the same CRUD pattern used across resource routers.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

const TABLE = 'maintenance_logs';
const ID = 'maintenance_id';

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
    // Insert maintenance log
    const [result] = await db.query(`INSERT INTO ${TABLE} SET ?`, [req.body]);
    const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [result.insertId]);
    // Business Rule: When a maintenance log is created, set vehicle status to 'In Shop'
    if (req.body.vehicle_id) {
      await db.query('UPDATE vehicles SET status = ? WHERE vehicle_id = ?', ['In Shop', req.body.vehicle_id]);
    }
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

module.exports = router;
