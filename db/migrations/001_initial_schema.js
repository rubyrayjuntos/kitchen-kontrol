/* eslint-disable camelcase */
exports.up = (pgm) => {
  // phases
  pgm.createTable('phases', {
    id: { type: 'text', primaryKey: true },
    title: { type: 'text' },
    time: { type: 'time' },
    status: { type: 'text' }
  });

  // roles
  pgm.createTable('roles', {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text' }
  });

  // users
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    phone: { type: 'text' },
    permissions: { type: 'text', notNull: true, default: 'user' }
  });

  pgm.createTable('user_roles', {
    user_id: { type: 'integer' },
    role_id: { type: 'text' }
  });

  pgm.createTable('role_phases', {
    role_id: { type: 'text' },
    phase_id: { type: 'text' }
  });

  pgm.createTable('tasks', {
    id: 'id',
    name: { type: 'text' },
    description: { type: 'text' },
    role_id: { type: 'text' }
  });

  pgm.createTable('absences', {
    id: 'id',
    user_id: { type: 'integer' },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    reason: { type: 'text' },
    approved: { type: 'boolean' },
    approvalDate: { type: 'date' }
  });

  pgm.createTable('training_modules', {
    id: { type: 'text', primaryKey: true },
    title: { type: 'text' },
    description: { type: 'text' },
    duration: { type: 'text' },
    required: { type: 'boolean' },
    content: { type: 'text' }
  });

  pgm.createTable('user_progress', {
    id: 'id',
    user_id: { type: 'text' },
    module_id: { type: 'text' },
    started: { type: 'boolean' },
    completed: { type: 'boolean' },
    currentSection: { type: 'integer' },
    completedDate: { type: 'text' }
  });

  pgm.createTable('logs', {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text' },
    status: { type: 'text' }
  });

  pgm.createTable('log_entries', {
    id: 'id',
    log_id: { type: 'text' },
    data: { type: 'text' }
  });

  pgm.createTable('log_status', {
    id: 'id',
    // normalize: store the referenced task id as integer and date as a proper date
    log_id: { type: 'integer' },
    date: { type: 'date' },
    status: { type: 'text' }
  });
  // Add foreign key to tasks.id (log_status tracks task statuses per date)
  pgm.addConstraint('log_status', 'log_status_log_id_fkey', {
    foreignKeys: {
      columns: 'log_id',
      references: 'tasks(id)',
      onDelete: 'CASCADE'
    }
  });

  pgm.createTable('planograms', {
    id: 'id',
    date: { type: 'date' },
    title: { type: 'text' },
    notes: { type: 'text' },
    compactPDF: { type: 'boolean' }
  });

  pgm.createTable('planogram_wells', {
    id: 'id',
    planogram_id: { type: 'integer' },
    data: { type: 'text' }
  });

  pgm.createTable('ingredients', {
    id: 'id',
    name: { type: 'text' },
    quantity: { type: 'integer' },
    unit: { type: 'text' },
    category: { type: 'text' },
    minStock: { type: 'integer' }
  });

  pgm.createTable('audit_log', {
    id: 'id',
    user_id: { type: 'integer' },
    action: { type: 'text' },
    timestamp: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('audit_log');
  pgm.dropTable('ingredients');
  pgm.dropTable('planogram_wells');
  pgm.dropTable('planograms');
  pgm.dropTable('log_status');
  pgm.dropTable('log_entries');
  pgm.dropTable('logs');
  pgm.dropTable('user_progress');
  pgm.dropTable('training_modules');
  pgm.dropTable('absences');
  pgm.dropTable('tasks');
  pgm.dropTable('role_phases');
  pgm.dropTable('user_roles');
  pgm.dropTable('users');
  pgm.dropTable('roles');
  pgm.dropTable('phases');
};
