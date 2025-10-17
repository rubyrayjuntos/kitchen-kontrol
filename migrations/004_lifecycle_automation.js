/* eslint-disable camelcase */

exports.up = (pgm) => {
  // ---------------------------------------------------------------------------
  // Lifecycle columns
  // ---------------------------------------------------------------------------
  pgm.addColumns('roles', {
    status: { type: 'text', notNull: true, default: 'active' },
    deleted_at: { type: 'timestamp' }
  });

  pgm.addConstraint('roles', 'roles_status_valid', {
    check: "status IN ('active', 'deprecated', 'archived')"
  });

  pgm.addColumns('users', {
    status: { type: 'text', notNull: true, default: 'active' },
    deleted_at: { type: 'timestamp' }
  });

  pgm.addConstraint('users', 'users_status_valid', {
    check: "status IN ('active', 'suspended', 'inactive', 'archived')"
  });

  pgm.addColumns('tasks', {
    status: { type: 'text', notNull: true, default: 'active' },
    archived_at: { type: 'timestamp' }
  });

  pgm.addConstraint('tasks', 'tasks_status_valid', {
    check: "status IN ('active', 'paused', 'retired', 'archived', 'unassigned')"
  });

  pgm.addColumns('phases', {
    retired_at: { type: 'timestamp' }
  });

  // Indexes to support active-state lookups
  pgm.createIndex('roles', 'deleted_at');
  pgm.createIndex('users', 'deleted_at');
  pgm.createIndex('tasks', 'archived_at');
  pgm.createIndex('phases', 'retired_at');

  // ---------------------------------------------------------------------------
  // Sentinel records
  // ---------------------------------------------------------------------------
  pgm.sql(`
    INSERT INTO roles (id, name, status, deleted_at)
    VALUES ('tba-role', 'To Be Assigned', 'archived', CURRENT_TIMESTAMP)
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      status = 'archived',
      deleted_at = COALESCE(roles.deleted_at, CURRENT_TIMESTAMP)
  `);

  pgm.sql(`
    INSERT INTO phases (id, title, status, retired_at)
    VALUES ('tba-phase', 'Unassigned Phase', 'retired', CURRENT_TIMESTAMP)
    ON CONFLICT (id)
    DO UPDATE SET
      title = EXCLUDED.title,
      status = 'retired',
      retired_at = COALESCE(phases.retired_at, CURRENT_TIMESTAMP)
  `);

  // ---------------------------------------------------------------------------
  // Transactional outbox
  // ---------------------------------------------------------------------------
  pgm.createTable('outbox', {
    event_id: { type: 'uuid', primaryKey: true },
    aggregate_type: { type: 'text', notNull: true },
    aggregate_id: { type: 'text', notNull: true },
    event_type: { type: 'text', notNull: true },
    payload: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    processed_at: { type: 'timestamp' }
  });

  pgm.createIndex('outbox', ['aggregate_type', 'aggregate_id']);
  pgm.createIndex('outbox', 'created_at');
  pgm.createIndex('outbox', 'processed_at', { where: 'processed_at IS NULL' });
};

exports.down = (pgm) => {
  // Drop transactional outbox
  pgm.dropTable('outbox');

  // Remove sentinel metadata (records remain but columns vanish with drop below)
  pgm.sql(`UPDATE roles SET deleted_at = NULL WHERE id = 'tba-role'`);
  pgm.sql(`UPDATE phases SET retired_at = NULL WHERE id = 'tba-phase'`);

  // Drop indexes
  pgm.dropIndex('phases', 'retired_at');
  pgm.dropIndex('tasks', 'archived_at');
  pgm.dropIndex('users', 'deleted_at');
  pgm.dropIndex('roles', 'deleted_at');

  // Drop constraints before columns
  pgm.dropConstraint('tasks', 'tasks_status_valid');
  pgm.dropConstraint('users', 'users_status_valid');
  pgm.dropConstraint('roles', 'roles_status_valid');

  // Remove columns
  pgm.dropColumns('tasks', ['status', 'archived_at']);
  pgm.dropColumns('users', ['status', 'deleted_at']);
  pgm.dropColumns('roles', ['status', 'deleted_at']);
  pgm.dropColumns('phases', ['retired_at']);
};
