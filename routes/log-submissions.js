/**
 * API Routes: Log Submissions
 * 
 * Handles submission and retrieval of actual form data.
 * Validates against template JSON Schema using Ajv.
 * 
 * Endpoints:
 * - POST /api/logs/submissions        - Submit new log data
 * - GET /api/logs/submissions         - Query submissions (with filters)
 * - GET /api/logs/submissions/:id     - Get specific submission
 * - PUT /api/logs/submissions/:id     - Update submission (corrections)
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize Ajv validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// ============================================================================
// POST /api/logs/submissions
// Submit new log data (staff completing assigned logs)
// ============================================================================
router.post('/', auth, async (req, res) => {
  const { log_template_id, form_data, submission_date, log_assignment_id } = req.body;
  
  // Validation
  if (!log_template_id || !form_data) {
    return res.status(400).json({ 
      error: 'log_template_id and form_data are required' 
    });
  }
  
  const today = submission_date || new Date().toISOString().split('T')[0];
  
  try {
    // Fetch template with schema for validation
    const templateResult = await db.query(`
      SELECT id, name, form_schema, version, frequency
      FROM log_templates
      WHERE id = $1 AND is_active = true
    `, [log_template_id]);
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Log template not found' });
    }
    
    const template = templateResult.rows[0];
    
    // Validate form_data against JSON Schema
    const validate = ajv.compile(template.form_schema);
    const valid = validate(form_data);
    
    if (!valid) {
      return res.status(400).json({
        error: 'Form data validation failed',
        validation_errors: validate.errors
      });
    }
    
    // Check for existing submission (for unique constraint)
    const existingResult = await db.query(`
      SELECT id FROM log_submissions
      WHERE log_template_id = $1 
        AND submission_date = $2 
        AND submitted_by = $3
    `, [log_template_id, today, req.user.id]);
    
    let result;
    let action;
    
    if (existingResult.rows.length > 0) {
      // Update existing submission
      const existingId = existingResult.rows[0].id;
      
      result = await db.query(`
        UPDATE log_submissions
        SET 
          form_data = $1,
          status = 'completed'
        WHERE id = $2
        RETURNING *
      `, [JSON.stringify(form_data), existingId]);
      
      action = 'updated';
    } else {
      // Insert new submission
      result = await db.query(`
        INSERT INTO log_submissions 
          (log_template_id, log_assignment_id, submitted_by, submission_date, form_data, status, template_version)
        VALUES ($1, $2, $3, $4, $5, 'completed', $6)
        RETURNING *
      `, [
        log_template_id,
        log_assignment_id || null,
        req.user.id,
        today,
        JSON.stringify(form_data),
        template.version
      ]);
      
      action = 'created';
    }
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, $2)
    `, [
      req.user.id, 
      `log_submission_${action}: ${action === 'created' ? 'Submitted' : 'Updated'} "${template.name}" for ${today}`
    ]);
    
    res.status(action === 'created' ? 201 : 200).json({
      message: `Log ${action} successfully`,
      submission: result.rows[0]
    });
  } catch (err) {
    console.error('Error submitting log:', err);
    
    if (err.code === '23505') {
      return res.status(409).json({ 
        error: 'A submission for this log already exists today' 
      });
    }
    
    res.status(500).json({ error: 'Failed to submit log' });
  }
});

// ============================================================================
// GET /api/logs/submissions
// Query submissions with filters
// ============================================================================
router.get('/', auth, async (req, res) => {
  const { 
    template_id, 
    user_id, 
    start_date, 
    end_date, 
    status,
    my_submissions 
  } = req.query;
  
  try {
    let query = `
      SELECT 
        ls.id,
        ls.log_template_id,
        lt.name as template_name,
        lt.category,
        ls.submitted_by,
        u.name as submitted_by_name,
        ls.submission_date,
        ls.form_data,
        ls.status,
        ls.template_version,
        ls.created_at,
        ls.submitted_at
      FROM log_submissions ls
      JOIN log_templates lt ON ls.log_template_id = lt.id
      JOIN users u ON ls.submitted_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filter by template
    if (template_id) {
      params.push(template_id);
      query += ` AND ls.log_template_id = $${params.length}`;
    }
    
    // Filter by user (admin can see all, staff see only their own unless authorized)
    if (my_submissions === 'true' || (!user_id && req.user.role !== 'admin')) {
      // TODO: Check if user has permission to view others' submissions
      params.push(req.user.id);
      query += ` AND ls.submitted_by = $${params.length}`;
    } else if (user_id) {
      params.push(user_id);
      query += ` AND ls.submitted_by = $${params.length}`;
    }
    
    // Filter by date range
    if (start_date) {
      params.push(start_date);
      query += ` AND ls.submission_date >= $${params.length}`;
    }
    
    if (end_date) {
      params.push(end_date);
      query += ` AND ls.submission_date <= $${params.length}`;
    }
    
    // Filter by status
    if (status) {
      params.push(status);
      query += ` AND ls.status = $${params.length}`;
    }
    
    query += ` ORDER BY ls.submission_date DESC, ls.created_at DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ============================================================================
// GET /api/logs/submissions/:id
// Get specific submission details
// ============================================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        ls.*,
        lt.name as template_name,
        lt.description as template_description,
        lt.form_schema,
        lt.ui_schema,
        u.name as submitted_by_name
      FROM log_submissions ls
      JOIN log_templates lt ON ls.log_template_id = lt.id
      JOIN users u ON ls.submitted_by = u.id
      WHERE ls.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = result.rows[0];
    
    // Check permissions (users can only view their own submissions unless admin)
    // TODO: Add proper admin permission check
    if (submission.submitted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(submission);
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// ============================================================================
// PUT /api/logs/submissions/:id
// Update submission (for corrections)
// ============================================================================
router.put('/:id', auth, async (req, res) => {
  const { form_data, status } = req.body;
  
  if (!form_data && !status) {
    return res.status(400).json({ error: 'form_data or status is required' });
  }
  
  try {
    // Fetch existing submission with template
    const existingResult = await db.query(`
      SELECT 
        ls.*,
        lt.form_schema,
        lt.name as template_name
      FROM log_submissions ls
      JOIN log_templates lt ON ls.log_template_id = lt.id
      WHERE ls.id = $1
    `, [req.params.id]);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const existing = existingResult.rows[0];
    
    // Check permissions
    // TODO: Add proper admin permission check
    if (existing.submitted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // If updating form_data, validate against schema
    if (form_data) {
      const validate = ajv.compile(existing.form_schema);
      const valid = validate(form_data);
      
      if (!valid) {
        return res.status(400).json({
          error: 'Form data validation failed',
          validation_errors: validate.errors
        });
      }
    }
    
    // Build update query
    const updates = [];
    const params = [req.params.id];
    let paramIndex = 2;
    
    if (form_data) {
      params.push(JSON.stringify(form_data));
      updates.push(`form_data = $${paramIndex++}`);
    }
    
    if (status) {
      params.push(status);
      updates.push(`status = $${paramIndex++}`);
    }
    
    // Note: log_submissions table has submitted_at and created_at, not updated_at
    
    const result = await db.query(`
      UPDATE log_submissions
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `, params);
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, $2)
    `, [
      req.user.id,
      `Updated "${existing.template_name}" submission for ${existing.submission_date}`
    ]);
    
    res.json({
      message: 'Submission updated successfully',
      submission: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating submission:', err);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// ============================================================================
// GET /api/logs/submissions/stats/summary
// Get summary statistics for dashboard/reports
// ============================================================================
router.get('/stats/summary', auth, async (req, res) => {
  const { start_date, end_date, template_id } = req.query;
  
  try {
    let query = `
      SELECT 
        lt.name as template_name,
        lt.category,
        COUNT(ls.id) as total_submissions,
        COUNT(DISTINCT ls.submitted_by) as unique_users,
        COUNT(CASE WHEN ls.status = 'completed' THEN 1 END) as completed_count,
        MIN(ls.submission_date) as first_submission,
        MAX(ls.submission_date) as last_submission
      FROM log_templates lt
      LEFT JOIN log_submissions ls ON lt.id = ls.log_template_id
      WHERE lt.is_active = true
    `;
    
    const params = [];
    
    if (start_date) {
      params.push(start_date);
      query += ` AND ls.submission_date >= $${params.length}`;
    }
    
    if (end_date) {
      params.push(end_date);
      query += ` AND ls.submission_date <= $${params.length}`;
    }
    
    if (template_id) {
      params.push(template_id);
      query += ` AND lt.id = $${params.length}`;
    }
    
    query += ` GROUP BY lt.id, lt.name, lt.category ORDER BY lt.category, lt.name`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching submission stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
