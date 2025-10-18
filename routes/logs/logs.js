const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const { body, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

router.post("/:id/complete", auth,
    body('date').notEmpty(),
    body('status').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { date, status } = req.body;
    db.run(
        `INSERT INTO log_status (log_id, date, status) VALUES (?, ?, ?)`,
        [parseInt(req.params.id, 10) || null, date, status],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Completed log with ID: ${req.params.id}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: this.lastID });
            }
        }
    );
});

module.exports = router;