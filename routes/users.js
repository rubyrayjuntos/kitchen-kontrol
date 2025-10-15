const express = require('express');
const router = express.Router();
const db = require('../db.js');
const bcrypt = require('bcryptjs');
const { userValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res, next) => {
    db.all("SELECT id, name, email, phone, permissions FROM users", [], (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: rows });
        }
    });
});

router.post("/", auth, userValidation.create, async (req, res, next) => {
    console.log('POST /api/users request body:', req.body);
    const { name, email, password, phone, permissions } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
        `INSERT INTO users (name, email, password, phone, permissions) VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone, permissions || 'user'],
        function (err) {
            if (err) {
                console.error('Error inserting user:', err);
                next(err);
            } else {
                const newUserId = this.lastID;
                console.log('User inserted with ID:', newUserId);
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created user ${name} (ID: ${newUserId})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: newUserId });
            }
        }
    );
});

router.put("/:id", auth, userValidation.update, (req, res, next) => {
    const { name, email, phone, permissions } = req.body;
    db.run(
        `UPDATE users SET name = ?, email = ?, phone = ?, permissions = ? WHERE id = ?`,
        [name, email, phone, permissions, req.params.id],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Updated user ${name} (ID: ${req.params.id})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

router.delete("/:id", auth, (req, res, next) => {
    db.run(
        `DELETE FROM users WHERE id = ?`,
        req.params.id,
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Deleted user with ID: ${req.params.id}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

router.get("/:id/tasks", auth, userValidation.getById, (req, res, next) => {
    const query = `
        SELECT t.id, t.name, t.description, ls.status
        FROM tasks t
        JOIN user_roles ur ON t.role_id = ur.role_id
    LEFT JOIN log_status ls ON t.id = ls.log_id AND ls.date = CURRENT_DATE
        WHERE ur.user_id = ?
    `;
    db.all(query, [req.params.id], (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: rows });
        }
    });
});

module.exports = router;