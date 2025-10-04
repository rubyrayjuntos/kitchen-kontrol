const express = require('express');
const router = express.Router();
const db = require('../db.js');

router.get("/", (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

module.exports = router;