const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const { phaseValidation } = require('../../middleware/validation');
const auth = require('../../middleware/auth');

router.get("/", auth, (req, res) => {
    db.all("SELECT * FROM phases", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.post("/", auth, phaseValidation.create, (req, res, next) => {
    const { title, time } = req.body;
    const id = title.toLowerCase().replace(/\s/g, '-');
    db.run(
        `INSERT INTO phases (id, title, time, status) VALUES (?, ?, ?, ?)`,
        [id, title, time, 'pending'],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created phase ${title} (ID: ${id})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: id });
            }
        }
    );
});

router.put("/:id", auth, phaseValidation.update, (req, res, next) => {
    const { title, time } = req.body;
    db.run(
        `UPDATE phases SET title = ?, time = ? WHERE id = ?`,
        [title, time, req.params.id],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Updated phase ${title} (ID: ${req.params.id})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

router.delete("/:id", auth, (req, res, next) => {
    db.run(
        `DELETE FROM phases WHERE id = ?`,
        req.params.id,
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Deleted phase with ID: ${req.params.id}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

module.exports = router;