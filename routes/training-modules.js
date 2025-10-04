const express = require('express');
const router = express.Router();
const db = require('../db.js');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res, next) => {
    db.all("SELECT * FROM training_modules", [], (err, rows) => {
        if (err) {
            next(err);
        } else {
            db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                [req.user.id, `Viewed training modules`],
                (err) => { if (err) console.error(err); }
            );
            res.json({ data: rows });
        }
    });
});

module.exports = router;