const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res) => {
    const query = `
        SELECT r.id, r.name, u.name as assignedUser
        FROM roles r
        LEFT JOIN user_roles ur ON r.id = ur.role_id
        LEFT JOIN users u ON ur.user_id = u.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ data: rows });
    });
});

router.post("/", auth,
    body('name').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name } = req.body;
    db.run(
        `INSERT INTO roles (name) VALUES (?)`,
        [name],
        function (err) {
            if (err) {
                next(err);
            } else {
                const newRoleId = this.lastID;
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created role ${name} (ID: ${newRoleId})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: newRoleId });
            }
        }
    );
});

router.put("/:id", auth, 
    body('name').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
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

router.post("/assign", auth,
    body('userId').notEmpty(),
    body('roleId').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
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