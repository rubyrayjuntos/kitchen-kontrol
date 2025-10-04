const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

router.get("/", (req, res) => {
    db.all("SELECT * FROM phases", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.put("/:id", auth,
    body('title').notEmpty(),
    body('time').notEmpty(),
    body('status').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, time, status } = req.body;
    db.run(
        `UPDATE phases SET title = ?, time = ?, status = ? WHERE id = ?`,
        [title, time, status, req.params.id],
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