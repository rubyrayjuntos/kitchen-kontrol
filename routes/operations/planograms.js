const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const { body, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

router.get("/", auth, (req, res, next) => {
    db.all("SELECT * FROM planograms", [], (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: rows });
        }
    });
});

router.get("/:date", auth, (req, res, next) => {
    db.get("SELECT * FROM planograms WHERE date = ?", [req.params.date], (err, row) => {
        if (err) {
            next(err);
        } else {
            if (row) {
                db.all("SELECT * FROM planogram_wells WHERE planogram_id = ?", [row.id], (err, wells) => {
                    if (err) {
                        next(err);
                    } else {
                        row.wells = wells.map(w => JSON.parse(w.data));
                        res.json({ data: row });
                    }
                });
            } else {
                res.json({ data: null });
            }
        }
    });
});

router.post("/", auth,
    body('date').notEmpty(),
    body('title').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { date, title, notes, compactPDF, wells } = req.body;
    db.run(
        `INSERT INTO planograms (date, title, notes, compactPDF) VALUES (?, ?, ?, ?)`,
        [date, title, notes, compactPDF],
        function (err) {
            if (err) {
                next(err);
            } else {
                const planogramId = this.lastID;
                const wellStmt = db.prepare("INSERT INTO planogram_wells (planogram_id, data) VALUES (?, ?)");
                wells.forEach(well => wellStmt.run(planogramId, JSON.stringify(well)));
                wellStmt.finalize();
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created planogram ${title} (ID: ${planogramId})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: planogramId });
            }
        }
    );
});

router.put("/:id", auth,
    body('title').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, notes, compactPDF, wells } = req.body;
    db.run(
        `UPDATE planograms SET title = ?, notes = ?, compactPDF = ? WHERE id = ?`,
        [title, notes, compactPDF, req.params.id],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run("DELETE FROM planogram_wells WHERE planogram_id = ?", [req.params.id], (err) => {
                    if (err) {
                        next(err);
                    } else {
                        const wellStmt = db.prepare("INSERT INTO planogram_wells (planogram_id, data) VALUES (?, ?)");
                        wells.forEach(well => wellStmt.run(req.params.id, JSON.stringify(well)));
                        wellStmt.finalize();
                        db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                            [req.user.id, `Updated planogram ${title} (ID: ${req.params.id})`],
                            (err) => { if (err) next(err); }
                        );
                        res.json({ changes: this.changes });
                    }
                });
            }
        }
    );
});

module.exports = router;