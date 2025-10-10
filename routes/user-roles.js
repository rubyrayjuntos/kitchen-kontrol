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

  db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    res.json({ msg: 'Role assigned successfully' });
  });
});

module.exports = router;