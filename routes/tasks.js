const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { taskValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.get("/", auth, (req, res) => {
    try {
        if (req.user.permissions === 'admin') {
            db.all("SELECT * FROM tasks", [], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ data: rows });
            });
        } else {
            db.all("SELECT t.* FROM tasks t JOIN user_roles ur ON t.role_id = ur.role_id WHERE ur.user_id = ?", [req.user.id], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ data: rows });
            });
        }
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