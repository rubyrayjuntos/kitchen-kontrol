const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const { roleValidation } = require('../../middleware/validation');
const auth = require('../../middleware/auth');
const { ROLE_STATUSES, TASK_STATUSES, PLACEHOLDER_ROLE_ID } = require('../../services/lifecycle/constants');
const { enqueueEvent } = require('../../services/events/outbox');

const isPostgres = Boolean(db._pool);

router.get("/", auth, (req, res) => {
    const sql = isPostgres
        ? "SELECT * FROM roles WHERE deleted_at IS NULL ORDER BY name"
        : "SELECT * FROM roles ORDER BY name";

    db.all(sql, [], (err, rows) => {
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
        `INSERT INTO roles (id, name${isPostgres ? ', status' : ''}) VALUES (${isPostgres ? '$1, $2, $3' : '?, ?'})`,
        isPostgres ? [id, name, ROLE_STATUSES.ACTIVE] : [id, name],
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

router.delete('/:id', auth, async (req, res, next) => {
    const roleId = req.params.id;
    if (!isPostgres) {
        try {
            await db.query('DELETE FROM log_assignments WHERE role_id = $1', [roleId]);
            await db.query('DELETE FROM user_roles WHERE role_id = $1', [roleId]);
            await db.query('DELETE FROM role_phases WHERE role_id = $1', [roleId]);
            await db.query('UPDATE tasks SET role_id = NULL WHERE role_id = $1', [roleId]);

            const result = await db.query('DELETE FROM roles WHERE id = $1 RETURNING id', [roleId]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Role not found' });
            }

            await db.query('INSERT INTO audit_log (user_id, action) VALUES ($1, $2)', [
                req.user.id,
                `Deleted role with ID: ${roleId}`,
            ]);

            res.json({ deleted: result.rows[0].id });
        } catch (err) {
            console.error('Failed to delete role:', err.message);
            next(err);
        }
        return;
    }

    if (roleId === PLACEHOLDER_ROLE_ID) {
        return res.status(400).json({ error: 'System placeholder role cannot be archived.' });
    }

    const client = await db._pool.connect();

    try {
        await client.query('BEGIN');

        const existing = await client.query('SELECT id FROM roles WHERE id = $1 AND deleted_at IS NULL FOR UPDATE', [roleId]);
        if (existing.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Role not found or already archived.' });
        }

        const tasksUpdate = await client.query(
            `UPDATE tasks
             SET role_id = $1,
                 status = CASE
                   WHEN status IN ($2, $3) THEN status
                   ELSE $4
                 END
             WHERE role_id = $5
             RETURNING id`,
            [
                PLACEHOLDER_ROLE_ID,
                TASK_STATUSES.ARCHIVED,
                TASK_STATUSES.RETIRED,
                TASK_STATUSES.UNASSIGNED,
                roleId
            ]
        );

        const userRolesUpdate = await client.query(
            'UPDATE user_roles SET role_id = $1 WHERE role_id = $2 RETURNING user_id',
            [PLACEHOLDER_ROLE_ID, roleId]
        );

        const rolePhasesUpdate = await client.query(
            'UPDATE role_phases SET role_id = $1 WHERE role_id = $2 RETURNING phase_id',
            [PLACEHOLDER_ROLE_ID, roleId]
        );

        const logAssignmentsUpdate = await client.query(
            'UPDATE log_assignments SET role_id = $1 WHERE role_id = $2 RETURNING id',
            [PLACEHOLDER_ROLE_ID, roleId]
        );

        await client.query(
            'UPDATE roles SET status = $1, deleted_at = CURRENT_TIMESTAMP WHERE id = $2',
            [ROLE_STATUSES.ARCHIVED, roleId]
        );

        await client.query(
            'INSERT INTO audit_log (user_id, action) VALUES ($1, $2)',
            [req.user.id, `Archived role with ID: ${roleId}`]
        );

        await enqueueEvent(client, {
            eventType: 'RoleArchived',
            aggregateType: 'role',
            aggregateId: roleId,
            payload: {
                placeholderRoleId: PLACEHOLDER_ROLE_ID,
                initiatedBy: req.user?.id ?? null,
                reassignmentCounts: {
                    tasks: tasksUpdate.rowCount,
                    userRoles: userRolesUpdate.rowCount,
                    rolePhases: rolePhasesUpdate.rowCount,
                    logAssignments: logAssignmentsUpdate.rowCount
                }
            }
        });

        await client.query('COMMIT');

        res.json({
            archived: roleId,
            placeholderRoleId: PLACEHOLDER_ROLE_ID,
            cascade: {
                tasks: tasksUpdate.rowCount,
                userRoles: userRolesUpdate.rowCount,
                rolePhases: rolePhasesUpdate.rowCount,
                logAssignments: logAssignmentsUpdate.rowCount
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to archive role:', err.message);
        next(err);
    } finally {
        client.release();
    }
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