/**
 * API Routes: Log Assignments
 * 
 * Manages WHO should complete WHAT log, WHEN, and HOW OFTEN.
 * Supports assignment to specific users, roles, or phases.
 * 
 * Endpoints:
 * - GET /api/logs/assignments/me       - Get logs assigned to current user (for data entry)
 * - GET /api/logs/assignments          - Get all assignments (ADMIN - for management)
 * - POST /api/logs/assignments         - Create new assignment (ADMIN)
 * - PUT /api/logs/assignments/:id      - Update assignment (ADMIN)
 * - DELETE /api/logs/assignments/:id   - Deactivate assignment (ADMIN)
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// ============================================================================
// GET /api/logs/assignments/me
// Get logs assigned to current user for TODAY
// This is the PRIMARY endpoint for staff completing daily logs
// ============================================================================
router.get('/me', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const now = new Date();
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  const dayOfWeekUpper = dayOfWeek.toUpperCase();
  
  try {
    const result = await db.query(`
      WITH current_user_roles AS (
        SELECT role_id FROM user_roles WHERE user_id = $2
      )
      SELECT 
        lt.id as template_id,
        lt.name as template_name,
        lt.description,
        lt.category,
        lt.frequency,
        lt.form_schema,
        lt.ui_schema,
        la.id as assignment_id,
        la.due_time,
        la.notes as assignment_notes,
        la.user_id,
        la.role_id,
        la.phase_id,
        ph.title as phase_name,
        ls.id as submission_id,
        ls.status as submission_status,
        ls.submitted_at,
        ls.form_data
      FROM log_templates lt
      JOIN log_assignments la ON lt.id = la.log_template_id
      LEFT JOIN phases ph ON la.phase_id = ph.id
      LEFT JOIN log_submissions ls ON (
        ls.log_template_id = lt.id 
        AND ls.submission_date = $1
        AND ls.submitted_by = $2
        AND (ls.log_assignment_id IS NULL OR ls.log_assignment_id = la.id)
      )
      WHERE la.is_active = true
        AND lt.is_active = true
        AND (
          la.user_id = $2
          OR (
            la.role_id IS NOT NULL 
            AND la.role_id IN (SELECT role_id FROM current_user_roles)
          )
          OR (
            la.phase_id IS NOT NULL
            AND ph.time IS NOT NULL
            AND $3::time BETWEEN ph.time AND (ph.time + INTERVAL '3 hours')
            AND EXISTS (
              SELECT 1
              FROM role_phases rp
              JOIN user_roles ur_table ON ur_table.role_id = rp.role_id
              WHERE rp.phase_id = la.phase_id
                AND ur_table.user_id = $2
            )
          )
        )
        AND (
          LOWER(TRIM(la.days_of_week)) = 'all'
          OR EXISTS (
            SELECT 1
            FROM regexp_split_to_table(la.days_of_week, ',') AS day(value)
            WHERE UPPER(TRIM(value)) = $4
          )
        )
      ORDER BY 
        CASE 
          WHEN la.due_time IS NULL THEN '23:59:59'::time
          ELSE la.due_time
        END,
        CASE WHEN ls.id IS NULL THEN 0 ELSE 1 END,
        lt.name
    `, [today, req.user.id, currentTime, dayOfWeekUpper]);
    
    // Transform results to include completion status
    const assignments = result.rows.map(row => ({
      template_id: row.template_id,
      template_name: row.template_name,
      description: row.description,
      category: row.category,
      frequency: row.frequency,
      form_schema: row.form_schema,
      ui_schema: row.ui_schema,
      assignment_id: row.assignment_id,
      due_time: row.due_time,
      assignment_notes: row.assignment_notes,
      assignment_target: {
        user_id: row.user_id,
        role_id: row.role_id,
        phase_id: row.phase_id,
        phase_name: row.phase_name
      },
      is_completed: !!row.submission_id,
      submission: row.submission_id ? {
        id: row.submission_id,
        status: row.submission_status,
        submitted_at: row.submitted_at,
        form_data: row.form_data
      } : null
    }));
    
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching user assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ============================================================================
// GET /api/logs/assignments
// Get all assignments (ADMIN view for managing who does what)
// ============================================================================
router.get('/', auth, async (req, res) => {
  // TODO: Add admin permission check
  
  const { template_id, user_id, active_only } = req.query;
  
  try {
    let query = `
      SELECT 
        la.id,
        la.log_template_id,
        lt.name as template_name,
        lt.frequency,
        la.user_id,
        u.name as user_name,
        la.role_id,
        r.name as role_name,
        la.phase_id,
        p.title as phase_name,
        la.due_time,
        la.days_of_week,
        la.is_active,
        la.notes,
        la.created_at,
        la.assigned_by,
        assigner.name as assigned_by_name
      FROM log_assignments la
      JOIN log_templates lt ON la.log_template_id = lt.id
      LEFT JOIN users u ON la.user_id = u.id
      LEFT JOIN roles r ON la.role_id = r.id
      LEFT JOIN phases p ON la.phase_id = p.id
      LEFT JOIN users assigner ON la.assigned_by = assigner.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (template_id) {
      params.push(template_id);
      query += ` AND la.log_template_id = $${params.length}`;
    }
    
    if (user_id) {
      params.push(user_id);
      query += ` AND la.user_id = $${params.length}`;
    }
    
    if (active_only === 'true') {
      query += ` AND la.is_active = true`;
    }
    
    query += ` ORDER BY lt.name, la.due_time NULLS LAST, u.name, r.name, p.title`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ============================================================================
// POST /api/logs/assignments
// Create new assignment (ADMIN ONLY)
// ============================================================================
router.post('/', auth, async (req, res) => {
  // TODO: Add admin permission check
  
  const { 
    log_template_id, 
    user_id, 
    role_id, 
    phase_id, 
    due_time, 
    days_of_week,
    notes 
  } = req.body;
  
  // Validation: Must have exactly one of user_id, role_id, or phase_id
  const targetCount = [user_id, role_id, phase_id].filter(x => x).length;
  if (targetCount !== 1) {
    return res.status(400).json({ 
      error: 'Must specify exactly one of: user_id, role_id, or phase_id' 
    });
  }
  
  // Validation: log_template_id is required
  if (!log_template_id) {
    return res.status(400).json({ error: 'log_template_id is required' });
  }
  
  try {
    // Verify template exists
    const templateResult = await db.query(`
      SELECT name FROM log_templates WHERE id = $1 AND is_active = true
    `, [log_template_id]);
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Log template not found' });
    }
    
    const templateName = templateResult.rows[0].name;
    
    // Create assignment
    const result = await db.query(`
      INSERT INTO log_assignments 
        (log_template_id, user_id, role_id, phase_id, due_time, days_of_week, notes, assigned_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      log_template_id,
      user_id || null,
      role_id || null,
      phase_id || null,
      due_time || null,
      days_of_week || 'Mon,Tue,Wed,Thu,Fri',
      notes || null,
      req.user.id
    ]);
    
    // Build audit message
    let assignedTo = 'Unknown';
    if (user_id) {
      const userResult = await db.query('SELECT name FROM users WHERE id = $1', [user_id]);
      assignedTo = `user: ${userResult.rows[0]?.name || user_id}`;
    } else if (role_id) {
      const roleResult = await db.query('SELECT name FROM roles WHERE id = $1', [role_id]);
      assignedTo = `role: ${roleResult.rows[0]?.name || role_id}`;
    } else if (phase_id) {
      const phaseResult = await db.query('SELECT title FROM phases WHERE id = $1', [phase_id]);
      assignedTo = `phase: ${phaseResult.rows[0]?.title || phase_id}`;
    }
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, $2)
    `, [req.user.id, `log_assignment_created: Assigned "${templateName}" to ${assignedTo}`]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating assignment:', err);
    
    // Handle constraint violations
    if (err.code === '23505') {
      return res.status(409).json({ 
        error: 'This assignment already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// ============================================================================
// PUT /api/logs/assignments/:id
// Update assignment (ADMIN ONLY)
// ============================================================================
router.put('/:id', auth, async (req, res) => {
  // TODO: Add admin permission check
  
  const { due_time, days_of_week, notes, is_active } = req.body;
  
  try {
    // Build dynamic update query
    const updates = [];
    const params = [req.params.id];
    let paramIndex = 2;
    
    if (due_time !== undefined) {
      params.push(due_time);
      updates.push(`due_time = $${paramIndex++}`);
    }
    
    if (days_of_week !== undefined) {
      params.push(days_of_week);
      updates.push(`days_of_week = $${paramIndex++}`);
    }
    
    if (notes !== undefined) {
      params.push(notes);
      updates.push(`notes = $${paramIndex++}`);
    }
    
    if (is_active !== undefined) {
      params.push(is_active);
      updates.push(`is_active = $${paramIndex++}`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const result = await db.query(`
      UPDATE log_assignments
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, $2)
    `, [req.user.id, `Updated assignment ID ${req.params.id}`]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// ============================================================================
// DELETE /api/logs/assignments/:id
// Deactivate assignment (soft delete)
// ============================================================================
router.delete('/:id', auth, async (req, res) => {
  // TODO: Add admin permission check
  
  try {
    const result = await db.query(`
      UPDATE log_assignments
      SET is_active = false
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, $2)
    `, [req.user.id, `Deactivated assignment ID ${req.params.id}`]);
    
    res.json({ 
      message: 'Assignment deactivated successfully',
      assignment: result.rows[0]
    });
  } catch (err) {
    console.error('Error deactivating assignment:', err);
    res.status(500).json({ error: 'Failed to deactivate assignment' });
  }
});

module.exports = router;
