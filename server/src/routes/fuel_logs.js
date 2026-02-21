/*
 * Backend/src/routes/fuel_logs.js
 * ------------------------------
 * Purpose: CRUD endpoints for the `fuel_logs` table (fuel consumption records).
 *
 * What I implemented here:
 * - GET /api/fuel_logs        -> list fuel log entries (limited to 200)
 * - GET /api/fuel_logs/:id    -> get a fuel log by `fuel_id`
 * - POST /api/fuel_logs       -> create a fuel log
 * - PUT /api/fuel_logs/:id    -> update a fuel log by `fuel_id`
 * - DELETE /api/fuel_logs/:id -> delete a fuel log by `fuel_id`
 *
 * Implementation notes:
 * - Follows the same pattern as other resource routers for consistency.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

const TABLE = 'fuel_logs';
const ID = 'fuel_id';

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

module.exports = router;
