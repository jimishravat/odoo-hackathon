/*
 * Backend/src/routes/expenses.js
 * ------------------------------
 * Purpose: CRUD endpoints for the `expenses` table (operational costs tracking).
 *
 * What I implemented here:
 * - GET /api/expenses        -> list expenses (limited to 200)
 * - GET /api/expenses/:id    -> get an expense by `expense_id`
 * - POST /api/expenses       -> create a new expense
 * - PUT /api/expenses/:id    -> update an expense by `expense_id`
 * - DELETE /api/expenses/:id -> delete an expense by `expense_id`
 *
 * Implementation notes:
 * - Matches the standard CRUD pattern used across the project for consistency.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

const TABLE = 'expenses';
const ID = 'expense_id';

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
