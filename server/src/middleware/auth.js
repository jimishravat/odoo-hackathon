/*
 * Backend/src/middleware/auth.js
 * --------------------------------
 * JWT authentication and RBAC middleware.
 * - `verifyToken` validates the Authorization header and attaches `req.user`.
 * - `requireRole(...roles)` ensures the authenticated user has one of the allowed roles.
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) return res.status(403).json({ error: 'Forbidden' });
    if (allowedRoles.length === 0) return next();
    if (allowedRoles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Insufficient role' });
  };
}

module.exports = { verifyToken, requireRole };
