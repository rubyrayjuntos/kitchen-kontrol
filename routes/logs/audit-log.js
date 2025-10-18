const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const auth = require('../../middleware/auth');

router.get('/', auth, (req, res) => {
    const query = `
        SELECT al.id, u.name as user, al.action, al.timestamp
        FROM audit_log al
        JOIN users u ON al.user_id = u.id
        ORDER BY al.timestamp DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

module.exports = router;