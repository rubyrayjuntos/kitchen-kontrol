const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res) => {
    db.all("SELECT * FROM absences", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.delete("/:id", auth, (req, res, next) => {
    db.run(
        `DELETE FROM absences WHERE id = ?`,
        req.params.id,
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Deleted absence with ID: ${req.params.id}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

router.post("/", auth,
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
                const newAbsenceId = this.lastID;
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created absence for ${name} (ID: ${newAbsenceId})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: newAbsenceId });
            }
        }
    );
});

router.put("/:id", auth,
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
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Updated absence with ID: ${req.params.id}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

module.exports = router;