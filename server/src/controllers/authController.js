/*
 * Backend/src/controllers/authController.js
 * ----------------------------------------
 * Authentication controller: register and login endpoints.
* - Register will store password as plain text (no hashing) and create a user record.
 * - Login will validate credentials and return a JWT containing `user_id` and `role`.
 */

const db = require('../db');
// Passwords are stored as plain text (no hashing)
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

function formatRoleTitle(roleName) {
  // Convert DB role_name like 'SAFETY_OFFICER' to 'Safety Officer'
  if (!roleName) return '';
  return roleName.toLowerCase().split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
}

async function register(req, res) {
  try {
    const { password, email, name, role } = req.body;
    if (!password || !email) return res.status(400).json({ error: 'email and password required' });
    // normalize email
    const emailNorm = String(email).trim().toLowerCase();
    // Check if user exists to enforce unique emails
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [emailNorm]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });
    // Basic password strength: min 8 characters (you can extend this with regex)
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    // Store password as plain text (no hashing)
    const hash = password;

    // Determine role_id to assign. Prefer explicit `role_id` if provided.
    let role_id = null;
    if (req.body.role_id && Number.isInteger(Number(req.body.role_id))) {
      // verify role_id exists
      const [rcheck] = await db.query('SELECT role_id FROM roles WHERE role_id = ?', [Number(req.body.role_id)]);
      if (rcheck.length) role_id = Number(req.body.role_id);
    }
    if (!role_id) {
      // Resolve role name provided by client (accepts human roles like 'Manager') to DB role_name format
      let roleDbName = 'DISPATCHER';
      if (role && typeof role === 'string') {
        roleDbName = role.toUpperCase().replace(/\s+/g, '_');
      }
      // Find role_id in roles table
      const [roleRows] = await db.query('SELECT role_id, role_name FROM roles WHERE role_name = ?', [roleDbName]);
      if (roleRows.length) {
        role_id = roleRows[0].role_id;
      } else {
        // fallback to DISPATCHER
        const [fallback] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', ['DISPATCHER']);
        role_id = fallback.length ? fallback[0].role_id : 1;
      }
    }

    // Store password in password_hash field as plain text
    const payload = { email: emailNorm, name, role_id, password_hash: hash };
    const [result] = await db.query('INSERT INTO users SET ?', [payload]);
    // Return created user (without password)
    const [rows] = await db.query('SELECT u.user_id, u.email, u.name, r.role_name, u.created_at FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [result.insertId]);
    const created = rows[0];
    // Provide role in Title Case to match middleware expectations
    created.role = created.role_name ? created.role_name.toLowerCase().split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ') : null;
    delete created.role_name;
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const emailNorm = String(email).trim().toLowerCase();
    // Join roles to obtain role_name
    const [rows] = await db.query('SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?', [emailNorm]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    // Compare plain text password
    const ok = password === (user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const roleTitle = formatRoleTitle(user.role_name);
    const token = jwt.sign({ user_id: user.user_id, role: roleTitle, email: user.email }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || JWT_EXPIRES });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login };
