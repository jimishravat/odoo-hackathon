/*
 * Users routes - now delegated to `usersController` and protected by auth
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const usersCtrl = require('../controllers/usersController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, requireRole('Manager','Analyst'), usersCtrl.list);
router.get('/:id', verifyToken, requireRole('Manager','Analyst','Dispatcher','Safety Officer'), usersCtrl.getById);

router.post('/', [
  body('email').isEmail(),
  body('password').optional().isLength({ min: 6 })
], verifyToken, requireRole('Manager'), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return usersCtrl.create(req, res);
});

router.put('/:id', [
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 })
], verifyToken, requireRole('Manager'), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return usersCtrl.update(req, res);
});

router.delete('/:id', verifyToken, requireRole('Manager'), usersCtrl.remove);

module.exports = router;
