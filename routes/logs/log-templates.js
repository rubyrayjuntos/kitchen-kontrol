/**
 * API Routes: Log Templates
 * 
 * Manages form definitions (JSON Schemas) for all log types.
 * Templates define WHAT data to collect, not WHO collects it or WHEN.
 * 
 * Endpoints:
 * - GET /api/logs/templates          - List all active templates
 * - GET /api/logs/templates/:id      - Get specific template with full schema
 * - POST /api/logs/templates         - Create new template (ADMIN - future form builder)
 * - PUT /api/logs/templates/:id      - Update template (creates new version)
 * - DELETE /api/logs/templates/:id   - Deactivate template
 */

const express = require('express');
const router = express.Router();
const db = require('../../db');
const auth = require('../../middleware/auth');

// ============================================================================
// GET /api/logs/templates
// List all active log templates (for dropdown menus, assignment UI, etc.)
// ============================================================================
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        name,
        description,
        category,
        frequency,
        version,
        created_at
      FROM log_templates
      WHERE is_active = true
      ORDER BY 
        CASE category
          WHEN 'food_safety' THEN 1
          WHEN 'usda_compliance' THEN 2
          WHEN 'operations' THEN 3
          ELSE 4
        END,
        name
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching log templates:', err);
    res.status(500).json({ error: 'Failed to fetch log templates' });
  }
});

// ============================================================================
// GET /api/logs/templates/:id
// Get specific template with FULL schema (for FormRenderer)
// ============================================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        name,
        description,
        category,
        frequency,
        form_schema,
        ui_schema,
        version,
        created_at,
        updated_at
      FROM log_templates
      WHERE id = $1 AND is_active = true
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching template:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// ============================================================================
// POST /api/logs/templates
// Create new log template (ADMIN ONLY - future form builder)
// ============================================================================
router.post('/', auth, async (req, res) => {
  // TODO: Add admin permission check
  // if (req.user.permissions !== 'admin') {
  //   return res.status(403).json({ error: 'Admin access required' });
  // }
  
  const { name, description, category, frequency, form_schema, ui_schema } = req.body;
  
  // Basic validation
  if (!name || !frequency || !form_schema) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, frequency, form_schema' 
    });
  }
  
  // Validate JSON Schema format
  if (typeof form_schema !== 'object' || !form_schema.type || !form_schema.properties) {
    return res.status(400).json({ 
      error: 'Invalid form_schema: must be a valid JSON Schema object with type and properties' 
    });
  }
  
  try {
    const result = await db.query(`
      INSERT INTO log_templates 
        (name, description, category, frequency, form_schema, ui_schema, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, name, description, category, frequency, 
        form_schema, ui_schema, version, created_at
    `, [
      name,
      description,
      category,
      frequency,
      JSON.stringify(form_schema),
      ui_schema ? JSON.stringify(ui_schema) : null,
      req.user.id
    ]);
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, $2)
    `, [req.user.id, `Created log template: ${name}`]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating template:', err);
    
    // Handle unique constraint violation
    if (err.code === '23505') {
      return res.status(409).json({ 
        error: 'A template with this name already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// ============================================================================
// PUT /api/logs/templates/:id
// Update template (creates new version, keeps old for historical data)
// ============================================================================
router.put('/:id', auth, async (req, res) => {
  // TODO: Add admin permission check
  
  const { name, description, category, frequency, form_schema, ui_schema } = req.body;
  
  try {
    // Get current template
    const currentResult = await db.query(`
      SELECT * FROM log_templates WHERE id = $1 AND is_active = true
    `, [req.params.id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const current = currentResult.rows[0];
    
    // Begin transaction for versioning
    await db.query('BEGIN');
    
    // Deactivate current version
    await db.query(`
      UPDATE log_templates 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [req.params.id]);
    
    // Create new version
    const newVersion = await db.query(`
      INSERT INTO log_templates 
        (name, description, category, frequency, form_schema, ui_schema, 
         version, parent_template_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      name || current.name,
      description !== undefined ? description : current.description,
      category || current.category,
      frequency || current.frequency,
      JSON.stringify(form_schema || current.form_schema),
      ui_schema ? JSON.stringify(ui_schema) : current.ui_schema,
      current.version + 1,
      req.params.id,
      req.user.id
    ]);
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, $2)
    `, [req.user.id, `Updated ${current.name} to version ${current.version + 1}`]);
    
    await db.query('COMMIT');
    
    res.json(newVersion.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error updating template:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// ============================================================================
// DELETE /api/logs/templates/:id
// Deactivate template (soft delete - preserves historical data)
// ============================================================================
router.delete('/:id', auth, async (req, res) => {
  // TODO: Add admin permission check
  
  try {
    // Check if template has any submissions
    const submissionsResult = await db.query(`
      SELECT COUNT(*) as count FROM log_submissions WHERE log_template_id = $1
    `, [req.params.id]);
    
    const hasSubmissions = parseInt(submissionsResult.rows[0].count) > 0;
    
    // Get template name for audit
    const templateResult = await db.query(`
      SELECT name FROM log_templates WHERE id = $1
    `, [req.params.id]);
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const templateName = templateResult.rows[0].name;
    
    // Deactivate (never actually delete - preserve historical data)
    await db.query(`
      UPDATE log_templates 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [req.params.id]);
    
    // Also deactivate all assignments
    await db.query(`
      UPDATE log_assignments 
      SET is_active = false
      WHERE log_template_id = $1
    `, [req.params.id]);
    
    // Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action)
      VALUES ($1, 'log_template_deactivated', $2)
    `, [req.user.id, `Deactivated template: ${templateName}`]);
    
    res.json({ 
      message: 'Template deactivated successfully',
      warning: hasSubmissions ? 'Template has historical submissions that are preserved' : null
    });
  } catch (err) {
    console.error('Error deactivating template:', err);
    res.status(500).json({ error: 'Failed to deactivate template' });
  }
});

module.exports = router;
