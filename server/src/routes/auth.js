/*
 * Backend/src/routes/auth.js
 * -------------------------
 * Authentication routes - register and login.
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/register', [
  body('email').isEmail().withMessage('valid email required'),
  body('password').isLength({ min: 8 }).withMessage('password min 8 chars')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return authCtrl.register(req, res);
});

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return authCtrl.login(req, res);
});

module.exports = router;
