const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const auth = require('../../middleware/auth');

// @route   GET api/role-phases
// @desc    Get all role-phase relationships
// @access  Private
router.get('/', auth, (req, res) => {
  db.all('SELECT * FROM role_phases', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    res.json({ data: rows });
  });
});

// @route   POST api/role-phases/assign
// @desc    Assign a role to a phase
// @access  Private
router.post('/assign', auth, (req, res) => {
  const { roleId, phaseId } = req.body;

  db.run('INSERT INTO role_phases (role_id, phase_id) VALUES (?, ?)', [roleId, phaseId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    res.json({ msg: 'Role assigned to phase successfully' });
  });
});

// @route   POST api/role-phases/unassign
// @desc    Unassign a role from a phase
// @access  Private
router.post('/unassign', auth, (req, res) => {
    const { roleId, phaseId } = req.body;
  
    db.run('DELETE FROM role_phases WHERE role_id = ? AND phase_id = ?', [roleId, phaseId], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
      }
      res.json({ msg: 'Role unassigned from phase successfully' });
    });
  });

module.exports = router;