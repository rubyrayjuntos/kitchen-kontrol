const express = require('express');
const router = express.Router();
const db = require('../db.js');

router.get("/", (req, res, next) => {
    db.all("SELECT * FROM training_modules", [], (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: rows });
        }
    });
});

module.exports = router;