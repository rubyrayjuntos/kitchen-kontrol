const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');

router.get("/", (req, res) => {
    db.all("SELECT * FROM roles", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.put("/:id", 
    body('name').notEmpty(),
    body('assignedUser').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, assignedUser } = req.body;
    db.run(
        `UPDATE roles SET name = ?, assignedUser = ? WHERE id = ?`,
        [name, assignedUser, req.params.id],
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