const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const auth = require('../../middleware/auth');

router.get("/", auth, (req, res) => {
    db.all("SELECT * FROM ingredients", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
            [req.user.id, `Viewed ingredients`],
            (err) => { if (err) console.error(err); }
        );
        res.json({ data: rows });
    });
});

module.exports = router;