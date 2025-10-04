const express = require('express');
const router = express.Router();
const db = require('../db.js');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res, next) => {
    db.all("SELECT id, name, email, phone, role FROM users", [], (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.json({ data: rows });
        }
    });
});

router.post("/", auth, 
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    async (req, res, next) => {
    console.log('POST /api/users request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, phone, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
        `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone, role || 'user'],
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

router.put("/:id", auth,
    body('name').notEmpty(),
    body('email').isEmail(),
    body('role').notEmpty(),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, role } = req.body;
    db.run(
        `UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?`,
        [name, email, phone, role, req.params.id],
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

router.get("/:id/tasks", auth, (req, res, next) => {
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