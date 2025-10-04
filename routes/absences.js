const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');

router.get("/", (req, res) => {
    db.all("SELECT * FROM absences", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.delete("/:id", (req, res, next) => {
    db.run(
        `DELETE FROM absences WHERE id = ?`,
        req.params.id,
        function (err) {
            if (err) {
                next(err);
            } else {
                res.json({ changes: this.changes });
            }
        }
    );
});

router.post("/",
    body('name').notEmpty(),
    body('date').notEmpty(),
    body('reason').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, date, reason } = req.body;
    db.run(
        `INSERT INTO absences (name, date, reason, approved, approvalDate) VALUES (?, ?, ?, ?, ?)`,
        [name, date, reason, false, null],
        function (err) {
            if (err) {
                next(err);
            } else {
                res.json({ id: this.lastID });
            }
        }
    );
});

router.put("/:id",
    body('approved').isBoolean(),
    body('approvalDate').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { approved, approvalDate } = req.body;
    db.run(
        `UPDATE absences SET approved = ?, approvalDate = ? WHERE id = ?`,
        [approved, approvalDate, req.params.id],
        function (err) {
            if (err) {
                next(err);
            } else {
                res.json({ changes: this.changes });
            }
        }
    );
});

module.exports = router;