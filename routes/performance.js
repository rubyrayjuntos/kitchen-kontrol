const express = require('express');
const router = express.Router();
const db = require('../db.js');
const auth = require('../middleware/auth');

router.get('/staff', auth, async (req, res, next) => {
    try {
        const users = await new Promise((resolve, reject) => {
            db.all("SELECT id, name FROM users", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const performanceData = await Promise.all(users.map(async (user) => {
            const taskQuery = `
                SELECT t.id, ls.status
                FROM tasks t
                JOIN user_roles ur ON t.role_id = ur.role_id
                LEFT JOIN log_status ls ON t.id = ls.log_id AND ls.date = CURRENT_DATE
                WHERE ur.user_id = ?
            `;
            const tasks = await new Promise((resolve, reject) => {
                db.all(taskQuery, [user.id], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });

            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const totalTasks = tasks.length;
            const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            const lastActivityQuery = `
                SELECT timestamp FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1
            `;
            const lastActivity = await new Promise((resolve, reject) => {
                db.get(lastActivityQuery, [user.id], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            return {
                id: user.id,
                name: user.name,
                tasksComplete: completionRate,
                lastActivity: lastActivity ? lastActivity.timestamp : null
            };
        }));

        res.json({ data: performanceData });

    } catch (err) {
        next(err);
    }
});

module.exports = router;