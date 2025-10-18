const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { taskValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res) => {
    try {
        let query;
        let params = [];

        if (req.user.permissions === 'admin') {
            // Admin sees all tasks with phase and time info
            query = `
                SELECT 
                    t.id,
                    t.name,
                    t.description,
                    t.role_id,
                    r.name as role_name,
                    p.id as phase_id,
                    p.title as phase_name,
                    p."time" as phase_time,
                    t.status,
                    t.archived_at,
                    u.name as assigned_user_name
                FROM tasks t
                JOIN roles r ON t.role_id = r.id
                LEFT JOIN role_phases rp ON r.id = rp.role_id
                LEFT JOIN phases p ON rp.phase_id = p.id
                LEFT JOIN user_roles ur ON r.id = ur.role_id
                LEFT JOIN users u ON ur.user_id = u.id
                WHERE t.status = 'active' OR t.status IS NULL
                ORDER BY p."time" ASC NULLS LAST, t.name ASC
            `;
            params = [];
        } else {
            // Non-admin users see only their role's tasks with phase and time info
            query = `
                SELECT 
                    t.id,
                    t.name,
                    t.description,
                    t.role_id,
                    r.name as role_name,
                    p.id as phase_id,
                    p.title as phase_name,
                    p."time" as phase_time,
                    t.status,
                    t.archived_at,
                    u.name as assigned_user_name
                FROM tasks t
                JOIN roles r ON t.role_id = r.id
                JOIN user_roles ur ON r.id = ur.role_id
                LEFT JOIN role_phases rp ON r.id = rp.role_id
                LEFT JOIN phases p ON rp.phase_id = p.id
                LEFT JOIN users u ON ur.user_id = u.id
                WHERE ur.user_id = ? 
                  AND (t.status = 'active' OR t.status IS NULL)
                ORDER BY p."time" ASC NULLS LAST, t.name ASC
            `;
            params = [req.user.id];
        }

        db.all(query, params, (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ data: rows });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", auth, taskValidation.create, (req, res, next) => {
    const { name, description, role_id } = req.body;
    db.run(
        `INSERT INTO tasks (name, description, role_id) VALUES (?, ?, ?)`,
        [name, description, role_id],
        function (err) {
            if (err) {
                next(err);
            } else {
                const newTaskId = this.lastID;
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Created task ${name} (ID: ${newTaskId})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ id: newTaskId });
            }
        }
    );
});

router.put("/:id", auth, taskValidation.update, (req, res, next) => {
    const { name, description, role_id } = req.body;
    db.run(
        `UPDATE tasks SET name = ?, description = ?, role_id = ? WHERE id = ?`,
        [name, description, role_id, req.params.id],
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Updated task ${name} (ID: ${req.params.id})`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

router.delete("/:id", auth, (req, res, next) => {
    db.run(
        `DELETE FROM tasks WHERE id = ?`,
        req.params.id,
        function (err) {
            if (err) {
                next(err);
            } else {
                db.run(`INSERT INTO audit_log (user_id, action) VALUES (?, ?)`,
                    [req.user.id, `Deleted task with ID: ${req.params.id}`],
                    (err) => { if (err) next(err); }
                );
                res.json({ changes: this.changes });
            }
        }
    );
});

module.exports = router;