const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');

router.post("/:id/complete",
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
        [req.params.id, date, status],
        function (err) {
            if (err) {
                next(err);
            } else {
                res.json({ id: this.lastID });
            }
        }
    );
});

module.exports = router;