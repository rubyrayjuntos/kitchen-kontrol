const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res) => {
    db.all("SELECT a.*, u.name as user_name FROM absences a JOIN users u ON a.user_id = u.id", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.post("/", auth,
    body('user_id').notEmpty(),
    body('start_date').notEmpty(),
    body('end_date').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { user_id, start_date, end_date, reason } = req.body;
    db.run(
        `INSERT INTO absences (user_id, start_date, end_date, reason, approved) VALUES (?, ?, ?, ?, ?)`,
        [user_id, start_date, end_date, reason, null],
        function (err) {
            if (err) {
                next(err);
            } else {
                const newAbsenceId = this.lastID;
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created absence for user ${user_id} (ID: ${newAbsenceId})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: newAbsenceId });
            }
        }
    );
});

router.put("/:id", auth, (req, res, next) => {
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

module.exports = router;