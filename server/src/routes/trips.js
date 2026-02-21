/*
 * Trips routes - use controllers and add specialized endpoints (assign/dispatch/complete)
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const tripsCtrl = require('../controllers/tripsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, requireRole('Manager','Dispatcher','Analyst'), tripsCtrl.list);
router.get('/:id', verifyToken, requireRole('Manager','Dispatcher','Analyst','Driver'), tripsCtrl.getById);

router.post('/', [
  body('origin').optional().isString(),
  body('destination').optional().isString()
], verifyToken, requireRole('Manager','Dispatcher'), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return tripsCtrl.create(req, res);
});

router.put('/:id', verifyToken, requireRole('Manager','Dispatcher'), tripsCtrl.update);
router.delete('/:id', verifyToken, requireRole('Manager'), tripsCtrl.remove);

// Assign driver to trip
router.post('/:id/assign', [body('driver_id').isInt()], verifyToken, requireRole('Dispatcher','Manager'), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return tripsCtrl.assignDriver(req, res);
});

// Dispatch trip
router.post('/:id/dispatch', verifyToken, requireRole('Dispatcher','Manager'), tripsCtrl.dispatchTrip);

// Complete trip
router.post('/:id/complete', verifyToken, requireRole('Driver','Manager'), tripsCtrl.completeTrip);

module.exports = router;
