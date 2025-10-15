const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { roleValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res) => {
    db.all("SELECT * FROM roles", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.post("/", auth, roleValidation.create, (req, res, next) => {
    const { name } = req.body;
    const id = name.toLowerCase().replace(/\s/g, '-');
    db.run(
        `INSERT INTO roles (id, name) VALUES (?, ?)`,
        [id, name],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created role ${name} (ID: ${id})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: id });
            }
        }
    );
});

router.put("/:id", auth, roleValidation.update, (req, res, next) => {
    const { name } = req.body;
    db.run(
        `UPDATE roles SET name = ? WHERE id = ?`,
        [name, req.params.id],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Updated role ${name} (ID: ${req.params.id})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

router.delete("/:id", auth, (req, res, next) => {
    db.run(
        `DELETE FROM roles WHERE id = ?`,
        req.params.id,
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Deleted role with ID: ${req.params.id}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

router.post("/assign", auth, roleValidation.assign, (req, res, next) => {
    const { userId, roleId } = req.body;
    db.run(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [userId, roleId],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Assigned role ${roleId} to user ${userId}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: this.lastID });
            }
        }
    );
});

module.exports = router;