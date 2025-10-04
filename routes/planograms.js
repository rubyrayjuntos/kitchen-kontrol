const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');

router.get("/", (req, res, next) => {
    db.all("SELECT * FROM planograms", [], (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: rows });
        }
    });
});

router.get("/:date", (req, res, next) => {
    db.get("SELECT * FROM planograms WHERE date = ?", [req.params.date], (err, row) => {
        if (err) {
            next(err);
        } else {
            if (row) {
                db.all("SELECT * FROM planogram_wells WHERE planogram_id = ?", [row.id], (err, wells) => {
                    if (err) {
                        next(err);
                    } else {
                        row.wells = wells;
                        res.json({ data: row });
                    }
                });
            } else {
                res.json({ data: null });
            }
        }
    });
});

router.post("/",
    body('date').notEmpty(),
    body('title').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { date, title, shotgun, wells } = req.body;
    db.run(
        `INSERT INTO planograms (date, title, shotgun) VALUES (?, ?, ?)`,
        [date, title, shotgun],
        function (err) {
            if (err) {
                next(err);
            } else {
                const planogramId = this.lastID;
                const wellStmt = db.prepare("INSERT INTO planogram_wells (planogram_id, temp, pan, food, utensil) VALUES (?, ?, ?, ?, ?)");
                wells.forEach(well => wellStmt.run(planogramId, well.temp, well.pan, well.food, well.utensil));
                wellStmt.finalize();
                res.json({ id: planogramId });
            }
        }
    );
});

router.put("/:id",
    body('title').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, shotgun, wells } = req.body;
    db.run(
        `UPDATE planograms SET title = ?, shotgun = ? WHERE id = ?`,
        [title, shotgun, req.params.id],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run("DELETE FROM planogram_wells WHERE planogram_id = ?", [req.params.id], (err) => {
                    if (err) {
                        next(err);
                    } else {
                        const wellStmt = db.prepare("INSERT INTO planogram_wells (planogram_id, temp, pan, food, utensil) VALUES (?, ?, ?, ?, ?)");
                        wells.forEach(well => wellStmt.run(req.params.id, well.temp, well.pan, well.food, well.utensil));
                        wellStmt.finalize();
                        res.json({ changes: this.changes });
                    }
                });
            }
        }
    );
});

module.exports = router;