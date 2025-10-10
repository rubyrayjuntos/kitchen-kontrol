const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/me
// @desc    Get current user
// @access  Private
router.get('/', auth, (req, res) => {
  db.get('SELECT id, name, email, permissions FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  });
});

module.exports = router;