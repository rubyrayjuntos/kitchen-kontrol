-- Clear all data
TRUNCATE TABLE
  log_submissions,
  log_assignments,
  log_templates,
  audit_log,
  user_roles,
  role_phases,
  tasks,
  absences,
  users,
  roles,
  phases,
  training_modules,
  ingredients
RESTART IDENTITY CASCADE;

-- Insert test user
INSERT INTO users (name, email, password, phone, permissions)
VALUES ('Ray Swan', 'raymond.swan@sodexo.com', '$2a$10$8YMqyEJJ6SqBPokB0yWKFOjT4x.0n2W/rNIq2V1BVwcSp4nZjnGN6', '409-264-5074', 'admin');

-- Verify
SELECT * FROM users;
