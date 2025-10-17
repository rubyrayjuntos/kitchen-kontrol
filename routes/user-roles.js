const express = require('express');
const router = express.Router();
const db = require('../db.js');
const auth = require('../middleware/auth');

// @route   GET api/user-roles
// @desc    Get all user roles
// @access  Private
router.get('/', auth, (req, res) => {
  db.all('SELECT * FROM user_roles', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    res.json({ data: rows });
  });
});

// @route   POST api/user-roles/assign
// @desc    Assign a role to a user
// @access  Private
router.post('/assign', auth, (req, res) => {
  const { userId, roleId } = req.body;

  db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) RETURNING user_id, role_id', [userId, roleId])
    .then((result) => {
      res.json({ msg: 'Role assigned successfully', data: result.rows[0] });
    })
    .catch((err) => {
      console.error('Failed to assign role:', err.message);
      res.status(500).send('Server error');
    });
});

module.exports = router;