
/*
 * Backend/src/db.js
 * -----------------
 * Purpose: Create and export a MySQL connection pool (promise API) for the
 * FleetFlow backend. This file centralizes DB configuration and is used by
 * all route handlers to execute queries.
 *
 * What I implemented here:
 * - Loads environment variables using `dotenv`.
 * - Creates a `mysql2` connection pool with sensible defaults.
 * - Exports the promise-based pool so route files can `await db.query(...)`.
 */

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fleetflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
