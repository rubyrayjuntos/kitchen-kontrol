/**
 * Migration 003: Logs System Foundation
 * 
 * Creates the database schema for a flexible, future-proof logs system.
 * Architecture aligns with Dynamic Form Builder spec (forms as data).
 * 
 * Key Tables:
 * - log_templates: Store form definitions as JSON Schema (like form_versions in spec)
 * - log_assignments: WHO completes WHAT log, WHEN, and HOW OFTEN
 * - log_submissions: Actual submitted log data as JSONB
 * 
 * Design Philosophy:
 * - Forms as Data: Templates stored as JSON Schema, not code
 * - Immutable by Design: Version column supports future versioning
 * - JSONB Power: PostgreSQL native JSON functions for querying
 * - Zero Tech Debt: v2.0 form builder is frontend-only addition
 */

/* eslint-disable camelcase */
exports.up = (pgm) => {
  console.log('🚀 Starting migration 003: Logs System Foundation...');

  // ============================================================================
  // TABLE 1: log_templates
  // Stores form definitions (structure, validation, UI hints) as JSON Schema
  // ============================================================================
  
  pgm.createTable('log_templates', {
    id: 'id',
    name: { type: 'text', notNull: true, unique: true },
    description: { type: 'text' },
    category: { type: 'text' },
    frequency: {
      type: 'text',
      notNull: true,
      check: "frequency IN ('daily', 'twice_daily', 'per_service', 'per_meal', 'weekly', 'as_needed')"
    },
    form_schema: { type: 'jsonb', notNull: true },
    ui_schema: { type: 'jsonb' },
    version: { type: 'integer', notNull: true, default: 1 },
    parent_template_id: { type: 'integer', references: 'log_templates' },
    is_active: { type: 'boolean', notNull: true, default: true },
    is_draft: { type: 'boolean', notNull: true, default: false },
    created_by: { type: 'integer', references: 'users' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // ============================================================================
  // TABLE 2: log_assignments
  // Defines WHO should complete WHAT log, WHEN, and HOW OFTEN
  // ============================================================================
  
  pgm.createTable('log_assignments', {
    id: 'id',
    log_template_id: {
      type: 'integer',
      notNull: true,
      references: 'log_templates',
      onDelete: 'CASCADE'
    },
    user_id: { type: 'integer', references: 'users' },
    role_id: { type: 'text', references: 'roles' },
    phase_id: { type: 'text', references: 'phases' },
    due_time: { type: 'time' },
    days_of_week: { type: 'text', notNull: true, default: 'Mon,Tue,Wed,Thu,Fri' },
    assigned_by: { type: 'integer', references: 'users' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    notes: { type: 'text' }
  });

  // Add constraint: Must assign to user OR role OR phase (XOR logic)
  pgm.addConstraint('log_assignments', 'assignment_target_check', {
    check: `(
      (user_id IS NOT NULL AND role_id IS NULL AND phase_id IS NULL) OR
      (user_id IS NULL AND role_id IS NOT NULL AND phase_id IS NULL) OR
      (user_id IS NULL AND role_id IS NULL AND phase_id IS NOT NULL)
    )`
  });

  // ============================================================================
  // TABLE 3: log_submissions
  // Actual submitted log data (THE DATA, not the structure)
  // ============================================================================
  
  pgm.createTable('log_submissions', {
    id: 'id',
    log_template_id: {
      type: 'integer',
      notNull: true,
      references: 'log_templates',
      onDelete: 'RESTRICT'
    },
    log_assignment_id: {
      type: 'integer',
      references: 'log_assignments',
      onDelete: 'SET NULL'
    },
    submitted_by: {
      type: 'integer',
      notNull: true,
      references: 'users'
    },
    submission_date: { type: 'date', notNull: true, default: pgm.func('current_date') },
    form_data: { type: 'jsonb', notNull: true },
    status: {
      type: 'text',
      notNull: true,
      default: 'completed',
      check: "status IN ('completed', 'flagged', 'corrected', 'overdue')"
    },
    submitted_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    template_version: { type: 'integer', notNull: true, default: 1 }
  });

  // Unique constraint: one submission per template per date per user
  pgm.addConstraint('log_submissions', 'unique_daily_submission', {
    unique: ['log_template_id', 'submission_date', 'submitted_by']
  });

  // ============================================================================
  // INDICES: Performance optimization
  // ============================================================================
  
  // log_templates indices
  pgm.createIndex('log_templates', 'name', { where: 'is_active = true' });
  pgm.createIndex('log_templates', 'category', { where: 'is_active = true' });
  
  // log_assignments indices
  pgm.createIndex('log_assignments', ['user_id', 'log_template_id'], { where: 'is_active = true' });
  pgm.createIndex('log_assignments', ['role_id', 'log_template_id'], { where: 'is_active = true' });
  pgm.createIndex('log_assignments', ['phase_id', 'log_template_id'], { where: 'is_active = true' });
  pgm.createIndex('log_assignments', 'log_template_id', { where: 'is_active = true' });
  
  // log_submissions indices
  pgm.createIndex('log_submissions', 'submission_date', { method: 'btree', order: 'DESC' });
  pgm.createIndex('log_submissions', ['log_template_id', 'submission_date']);
  pgm.createIndex('log_submissions', ['submitted_by', 'submission_date']);
  pgm.createIndex('log_submissions', ['status', 'submission_date'], { where: "status IN ('flagged', 'overdue')" });
  pgm.createIndex('log_submissions', 'form_data', { method: 'gin' });

  // ============================================================================
  // TRIGGERS: Auto-update timestamps
  // ============================================================================
  
  pgm.createFunction(
    'update_updated_at_column',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true
    },
    `
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger('log_templates', 'update_log_templates_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW'
  });

  console.log('✅ Created log_templates table');
  console.log('✅ Created log_assignments table');
  console.log('✅ Created log_submissions table');
  console.log('✅ Created performance indices');
  console.log('✅ Created triggers');
  console.log('🎉 Migration 003 complete! Logs system foundation ready.');
  console.log('📝 Next: Run seed script to populate log_templates');
};

/**
 * Rollback: Drop all tables and indices
 */
exports.down = (pgm) => {
  console.log('⏮️  Rolling back migration 003...');
  
  // Drop tables in reverse dependency order
  pgm.dropTable('log_submissions', { cascade: true });
  pgm.dropTable('log_assignments', { cascade: true });
  pgm.dropTable('log_templates', { cascade: true });
  
  // Drop trigger function
  pgm.dropFunction('update_updated_at_column', [], { cascade: true });
  
  console.log('✅ Rollback complete');
};
