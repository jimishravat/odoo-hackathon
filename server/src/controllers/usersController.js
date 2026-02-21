/*
 * Backend/src/controllers/usersController.js
 * -----------------------------------------
 * Controllers for user CRUD operations. Passwords are hashed on create/update
 * when provided. Sensitive fields such as `password` are not returned.
 */

const db = require('../db');
const bcrypt = require('bcryptjs');

function formatRoleTitle(roleName) {
  if (!roleName) return null;
  return roleName.toLowerCase().split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
}

async function list(req, res) {
  try {
    const [rows] = await db.query('SELECT u.user_id, u.email, u.name, r.role_name, u.created_at FROM users u JOIN roles r ON u.role_id = r.role_id ORDER BY u.user_id DESC LIMIT 200');
    const mapped = rows.map(r => ({ user_id: r.user_id, email: r.email, name: r.name, role: formatRoleTitle(r.role_name), created_at: r.created_at }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getById(req, res) {
  try {
    const [rows] = await db.query('SELECT u.user_id, u.email, u.name, r.role_name, u.created_at FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    res.json({ user_id: r.user_id, email: r.email, name: r.name, role: formatRoleTitle(r.role_name), created_at: r.created_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  try {
    const payload = { ...req.body };
    // Determine role_id. Prefer explicit `role_id` if provided by client.
    let role_id = null;
    if (payload.role_id && Number.isInteger(Number(payload.role_id))) {
      const [chk] = await db.query('SELECT role_id FROM roles WHERE role_id = ?', [Number(payload.role_id)]);
      if (chk.length) role_id = Number(payload.role_id);
    }
    if (!role_id && payload.role) {
      const roleDbName = String(payload.role).toUpperCase().replace(/\s+/g, '_');
      const [rrows] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', [roleDbName]);
      if (rrows.length) role_id = rrows[0].role_id;
    }
    if (!role_id) {
      const [fallback] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', ['DISPATCHER']);
      role_id = fallback.length ? fallback[0].role_id : 1;
    }

    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      payload.password_hash = await bcrypt.hash(payload.password, salt);
      delete payload.password;
    }
    // ensure only allowed columns are set
    const insertObj = { name: payload.name, email: payload.email, password_hash: payload.password_hash, role_id };
    const [result] = await db.query('INSERT INTO users SET ?', [insertObj]);
    const [rows] = await db.query('SELECT u.user_id, u.email, u.name, r.role_name, u.created_at FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [result.insertId]);
    const r = rows[0];
    res.status(201).json({ user_id: r.user_id, email: r.email, name: r.name, role: formatRoleTitle(r.role_name), created_at: r.created_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  try {
    const payload = { ...req.body };
    const updateObj = {};
    if (payload.name) updateObj.name = payload.name;
    if (payload.email) updateObj.email = payload.email;
    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      updateObj.password_hash = await bcrypt.hash(payload.password, salt);
    }
    if (payload.role_id && Number.isInteger(Number(payload.role_id))) {
      const [chk] = await db.query('SELECT role_id FROM roles WHERE role_id = ?', [Number(payload.role_id)]);
      if (chk.length) updateObj.role_id = Number(payload.role_id);
    } else if (payload.role) {
      const roleDbName = String(payload.role).toUpperCase().replace(/\s+/g, '_');
      const [rrows] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', [roleDbName]);
      if (rrows.length) updateObj.role_id = rrows[0].role_id;
    }
    await db.query('UPDATE users SET ? WHERE user_id = ?', [updateObj, req.params.id]);
    const [rows] = await db.query('SELECT u.user_id, u.email, u.name, r.role_name, u.created_at FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [req.params.id]);
    const r = rows[0];
    res.json({ user_id: r.user_id, email: r.email, name: r.name, role: formatRoleTitle(r.role_name), created_at: r.created_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { list, getById, create, update, remove };
