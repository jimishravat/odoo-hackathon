
/*
 * Backend/src/index.js
 * --------------------
 * Purpose: Express application entrypoint for FleetFlow backend.
 *
 * What I implemented here:
 * - Loads environment variables with `dotenv`.
 * - Creates an Express app, enables `cors` and JSON body parsing.
 * - Mounts the API router at `/api` (all resource routes live under `src/routes`).
 * - Provides a simple root health-check endpoint and starts the server.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const apiRouter = require('./routes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Apply a basic rate limiter to authentication endpoints to reduce brute-force risk
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // limit each IP to 20 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
});

// Mount auth limiter only on /api/auth routes by mounting the API router after applying a middleware that only affects auth
app.use('/api/auth', authLimiter);
app.use('/api', apiRouter);

app.get('/', (req, res) => res.send({ status: 'FleetFlow backend running' }));

const PORT = process.env.PORT || 4000;

async function startServer() {
	// Test DB connection before starting server
	try {
		// simple query to validate connection
		await db.query('SELECT 1');
		console.log('Connected to MySQL ✅');
	} catch (err) {
		console.error('Unable to connect to MySQL ❌:', err.message || err);
		// Exit process if DB is not available — prevents running in degraded mode.
		process.exit(1);
	}

	app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

startServer().catch(err => {
	console.error('Failed to start server:', err);
	process.exit(1);
});
