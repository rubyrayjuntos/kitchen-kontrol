require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const phases = [
  { id: 'prep', title: 'Prep', time: '08:00', status: 'completed' },
  { id: 'breakfast', title: 'Breakfast', time: '09:00', status: 'active' },
  { id: 'lunch-prep', title: 'Lunch Prep', time: '11:00', status: 'pending' },
  { id: 'lunch', title: 'Lunch', time: '12:00', status: 'pending' },
  { id: 'planogram', title: 'Planogram', time: '14:00', status: 'pending' },
  { id: 'deep-clean', title: 'Deep Clean', time: '15:00', status: 'pending' },
  { id: 'final-prep', title: 'Final Prep', time: '16:00', status: 'pending' }
];

const roles = [
  { id: 'head-chef', name: 'Head Chef' },
  { id: 'sous-chef', name: 'Sous Chef' },
  { id: 'line-cook-1', name: 'Line Cook 1' },
  { id: 'line-cook-2', name: 'Line Cook 2' },
  { id: 'dishwasher', name: 'Dishwasher' }
];

const rolePhases = [
  { role_id: 'head-chef', phase_id: 'prep' },
  { role_id: 'sous-chef', phase_id: 'prep' },
  { role_id: 'line-cook-1', phase_id: 'prep' },
  { role_id: 'line-cook-2', phase_id: 'prep' },
  { role_id: 'line-cook-1', phase_id: 'breakfast' },
  { role_id: 'line-cook-2', phase_id: 'breakfast' },
  { role_id: 'dishwasher', phase_id: 'breakfast' },
  { role_id: 'sous-chef', phase_id: 'lunch-prep' },
  { role_id: 'line-cook-1', phase_id: 'lunch-prep' },
  { role_id: 'line-cook-1', phase_id: 'lunch' },
  { role_id: 'line-cook-2', phase_id: 'lunch' },
  { role_id: 'head-chef', phase_id: 'lunch' },
  { role_id: 'dishwasher', phase_id: 'planogram' },
];

const tasks = [
  { name: 'Review daily menu and prep list', description: 'Review daily menu and prep list', role_id: 'head-chef' },
  { name: 'Receive and store deliveries', description: 'Receive and store deliveries', role_id: 'sous-chef' },
  { name: 'Wash and chop vegetables', description: 'Wash and chop vegetables', role_id: 'line-cook-1' },
  { name: 'Prepare sauces and dressings', description: 'Prepare sauces and dressings', role_id: 'line-cook-2' },
  { name: 'Cook breakfast entrees', description: 'Cook breakfast entrees', role_id: 'line-cook-1' },
  { name: 'Set up breakfast service line', description: 'Set up breakfast service line', role_id: 'line-cook-2' },
  { name: 'Brew coffee and tea', description: 'Brew coffee and tea', role_id: 'dishwasher' },
  { name: 'Marinate meats', description: 'Marinate meats', role_id: 'sous-chef' },
  { name: 'Assemble sandwiches and salads', description: 'Assemble sandwiches and salads', role_id: 'line-cook-1' },
  { name: 'Cook lunch entrees', description: 'Cook lunch entrees', role_id: 'line-cook-1' },
  { name: 'Restock service line', description: 'Restock service line', role_id: 'line-cook-2' },
  { name: 'Expedite orders', description: 'Expedite orders', role_id: 'head-chef' },
  { name: 'Clean and sanitize workstations', description: 'Clean and sanitize workstations', role_id: 'dishwasher' },
  { name: 'Wash dishes', description: 'Wash dishes', role_id: 'dishwasher' },
  { name: 'Sweep and mop floors', description: 'Sweep and mop floors', role_id: 'dishwasher' },
];

const trainingModules = [
  {
    id: 'food-safety-101',
    title: 'Food Safety 101',
    description: 'Basic principles of food safety and sanitation.',
    duration: '45 mins',
    required: true,
    content: JSON.stringify({ sections: [], quiz: [] })
  },
  {
    id: 'knife-skills',
    title: 'Knife Skills and Safety',
    description: 'Learn to handle knives safely and efficiently.',
    duration: '30 mins',
    required: true,
    content: JSON.stringify({ sections: [], quiz: [] })
  }
];

const ingredients = [
  { name: 'Ground Beef', quantity: 15, unit: 'lbs', category: 'meat', minStock: 5 },
  { name: 'Burger Buns', quantity: 24, unit: 'pcs', category: 'bread', minStock: 10 },
  { name: 'Lettuce', quantity: 3, unit: 'heads', category: 'produce', minStock: 5 },
  { name: 'Tomatoes', quantity: 8, unit: 'lbs', category: 'produce', minStock: 3 },
  { name: 'Pears', quantity: 12, unit: 'pcs', category: 'fruit', minStock: 5 },
  { name: 'Peaches', quantity: 18, unit: 'pcs', category: 'fruit', minStock: 5 },
];

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT COUNT(*)::int as count FROM phases');
    if (rows[0].count === 0) {
      for (const p of phases) {
        await client.query('INSERT INTO phases (id, title, time, status) VALUES ($1, $2, $3, $4)', [p.id, p.title, p.time, p.status]);
      }

      for (const r of roles) {
        await client.query('INSERT INTO roles (id, name) VALUES ($1, $2)', [r.id, r.name]);
      }

      for (const rp of rolePhases) {
        await client.query('INSERT INTO role_phases (role_id, phase_id) VALUES ($1, $2)', [rp.role_id, rp.phase_id]);
      }

      for (const t of tasks) {
        await client.query('INSERT INTO tasks (name, description, role_id) VALUES ($1, $2, $3)', [t.name, t.description, t.role_id]);
      }

      for (const m of trainingModules) {
        await client.query('INSERT INTO training_modules (id, title, description, duration, required, content) VALUES ($1, $2, $3, $4, $5, $6)', [m.id, m.title, m.description, m.duration, m.required, m.content]);
      }

      for (const ing of ingredients) {
        await client.query('INSERT INTO ingredients (name, quantity, unit, category, minStock) VALUES ($1, $2, $3, $4, $5)', [ing.name, ing.quantity, ing.unit, ing.category, ing.minStock]);
      }

      const hashedPassword = bcrypt.hashSync('password', 10);
      const userRes = await client.query('INSERT INTO users (name, email, password, permissions) VALUES ($1, $2, $3, $4) RETURNING id', ['Admin', 'admin@example.com', hashedPassword, 'admin']);
      const userId = userRes.rows[0].id;
      await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, 'head-chef']);
      await client.query('INSERT INTO absences (user_id, start_date, end_date, reason, approved, approvalDate) VALUES ($1, $2, $3, $4, $5, $6)', [userId, '2025-10-10', '2025-10-12', 'Vacation', true, '2025-10-01']);

      console.log('Seeded full dataset into Postgres');
    } else {
      console.log('Database already seeded');
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }

})();
