/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const db = require('../db');

if (!db._pool) {
  console.error('Postgres connection required. Set DATABASE_URL before running this seed.');
  process.exit(1);
}

const pool = db._pool;
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'password';

const slugify = (value) => value.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const toTime = (value) => {
  const [hoursRaw, minutesRaw = '0'] = value.trim().split(':');
  const hours = parseInt(hoursRaw, 10);
  const minutes = parseInt(minutesRaw, 10);
  const hh = Number.isNaN(hours) ? '00' : hours.toString().padStart(2, '0');
  const mm = Number.isNaN(minutes) ? '00' : minutes.toString().padStart(2, '0');
  return `${hh}:${mm}:00`;
};

const users = [
  { name: 'Juanita Council', email: 'j@j.com', phone: '1111111111', permissions: 'user' },
  { name: 'Ray Swan', email: 'raymond.swan@sodexo.com', phone: '409-264-5074', permissions: 'admin' },
  { name: 'Peter Marencelli', email: 'p@p.com', phone: '3333333333', permissions: 'user' },
  { name: 'Monzale', email: 'm@m.com', phone: '4444444444', permissions: 'user' },
  { name: 'Veronica', email: 'v@v.com', phone: '5555555555', permissions: 'user' }
];

const roles = [
  { name: 'Lunch POS 2', assignedTo: 'Juanita Council' },
  { name: 'Lead', assignedTo: 'Ray Swan' },
  { name: 'Lunch POS 1', assignedTo: 'Peter Marencelli' },
  { name: 'Lunch Line 1', assignedTo: 'Monzale' },
  { name: 'Lunch Line 2', assignedTo: 'Veronica' },
  { name: 'Bfst Line & POS', assignedTo: 'Ray Swan' },
  { name: 'Bfst Cart Hall', assignedTo: 'Peter Marencelli' },
  { name: 'Bfst Cart Gym', assignedTo: 'Monzale' }
];

const phases = [
  { name: 'Pre Breakfast', start: '7:00', primaryRole: 'Bfst Line & POS', secondaryRole: 'Lead' },
  { name: 'Breakfast', start: '8:00', primaryRole: 'Bfst Line & POS', secondaryRole: 'Lead' },
  { name: 'Lunch Prep and Food Delivery', start: '8:30', primaryRole: 'All roles' },
  { name: 'Lunch 1', start: '10:15', primaryRole: 'All roles' },
  { name: 'Lunch 2', start: '10:45', primaryRole: 'All roles' },
  { name: 'Mid Lunch Clean', start: '11:15', primaryRole: 'All roles' },
  { name: 'Lunch 3', start: '11:45', primaryRole: 'All roles' },
  { name: 'Lunch 4', start: '12:15', primaryRole: 'All roles' },
  { name: 'End of Day Clean', start: '12:45', primaryRole: 'All roles' }
];

const logs = [
  {
    name: 'Food Temperatures',
    description: 'Record holding temperatures for every menu item served this meal.',
    category: 'food_safety',
    frequency: 'per_meal',
    assignedTo: 'Ray Swan',
    formSchema: {
      type: 'object',
      title: 'Food Temperatures',
      required: ['temperatures'],
      properties: {
        temperatures: {
          type: 'string',
          title: 'Item Temperatures',
          description: 'List each item with its temperature in °F.'
        },
        correctiveActions: {
          type: 'string',
          title: 'Corrective Actions',
          description: 'Document actions taken for any out-of-range readings.'
        }
      }
    },
    uiSchema: {
      temperatures: { 'ui:widget': 'textarea', 'ui:options': { rows: 6 } },
      correctiveActions: { 'ui:widget': 'textarea', 'ui:options': { rows: 4 } }
    }
  },
  {
    name: 'Equipment Temperatures',
    description: 'Verify cooler, freezer, and hot holding equipment temperatures.',
    category: 'operations',
    frequency: 'daily',
    assignedTo: 'Ray Swan',
    formSchema: {
      type: 'object',
      title: 'Equipment Temperatures',
      required: ['equipmentReadings'],
      properties: {
        equipmentReadings: {
          type: 'string',
          title: 'Equipment Readings',
          description: 'Record equipment name and observed temperature in °F.'
        },
        issuesFound: {
          type: 'string',
          title: 'Issues Found',
          description: 'Note any equipment requiring service or follow-up.'
        }
      }
    },
    uiSchema: {
      equipmentReadings: { 'ui:widget': 'textarea', 'ui:options': { rows: 6 } },
      issuesFound: { 'ui:widget': 'textarea', 'ui:options': { rows: 4 } }
    }
  },
  {
    name: 'Sanitation',
    description: 'End-of-day sanitation checklist and notes.',
    category: 'sanitation',
    frequency: 'daily',
    assignedTo: 'Ray Swan',
    formSchema: {
      type: 'object',
      title: 'Sanitation Log',
      required: ['sanitationTasks'],
      properties: {
        sanitationTasks: {
          type: 'string',
          title: 'Sanitation Tasks Completed',
          description: 'Summarize tasks completed and any outstanding issues.'
        },
        followUp: {
          type: 'string',
          title: 'Follow-up Needed',
          description: 'Document any corrective actions or supplies needed.'
        }
      }
    },
    uiSchema: {
      sanitationTasks: { 'ui:widget': 'textarea', 'ui:options': { rows: 6 } },
      followUp: { 'ui:widget': 'textarea', 'ui:options': { rows: 4 } }
    }
  },
  {
    name: 'Reimbursable Meals Count',
    description: 'Capture daily served/planned meal counts and component compliance.',
    category: 'compliance',
    frequency: 'daily',
    assignedTo: 'Ray Swan',
    formSchema: {
      type: 'object',
      title: 'Reimbursable Meals Count',
      required: ['served_count', 'meal_period', 'has_protein', 'has_grain', 'has_fruit', 'has_vegetable', 'has_milk'],
      properties: {
        meal_date: {
          type: 'string',
          format: 'date',
          title: 'Service Date'
        },
        meal_period: {
          type: 'string',
          title: 'Meal Period',
          enum: ['Breakfast', 'Lunch 1', 'Lunch 2', 'Lunch 3', 'Lunch 4', 'Snack']
        },
        served_count: {
          type: 'integer',
          minimum: 0,
          title: 'Served Meals'
        },
        planned_count: {
          type: 'integer',
          minimum: 0,
          title: 'Planned Meals'
        },
        has_protein: { type: 'boolean', title: 'Protein Component Present?' },
        has_grain: { type: 'boolean', title: 'Grain Component Present?' },
        has_fruit: { type: 'boolean', title: 'Fruit Component Present?' },
        has_vegetable: { type: 'boolean', title: 'Vegetable Component Present?' },
        has_milk: { type: 'boolean', title: 'Milk Component Present?' },
        notes: { type: 'string', title: 'Notes / Corrective Actions' }
      }
    },
    uiSchema: {
      meal_date: { 'ui:widget': 'alt-date' },
      meal_period: { 'ui:placeholder': 'Select service window' },
      served_count: { 'ui:widget': 'updown' },
      planned_count: { 'ui:widget': 'updown' },
      notes: { 'ui:widget': 'textarea', 'ui:options': { rows: 3 } }
    }
  }
];

const trainingModules = [
  {
    id: 'food-safety-101',
    title: 'Food Safety 101',
    description: 'Basic principles of food safety and sanitation.',
    duration: '45 mins',
    required: true,
    content: {
      sections: [
        {
          title: 'Introduction to Food Safety',
          content: 'Why food safety is critical in a kitchen environment.',
          keyPoints: ['Preventing foodborne illness', 'Legal requirements', 'Reputation management']
        },
        {
          title: 'Personal Hygiene',
          content: 'Proper hygiene practices for all kitchen staff.',
          keyPoints: ['Handwashing procedures', 'Proper attire', 'When to stay home']
        },
        {
          title: 'Temperature Control',
          content: 'Understanding the temperature danger zone.',
          keyPoints: ['Safe cooking temperatures', 'Proper cooling techniques', 'Calibrating thermometers']
        }
      ],
      quiz: [
        {
          question: 'What is the temperature danger zone?',
          options: ['40°F - 140°F', '32°F - 100°F', '50°F - 150°F'],
          correct: 0
        },
        {
          question: 'How long should you wash your hands?',
          options: ['10 seconds', '20 seconds', '30 seconds'],
          correct: 1
        }
      ]
    }
  },
  {
    id: 'knife-skills',
    title: 'Knife Skills and Safety',
    description: 'Learn to handle knives safely and efficiently.',
    duration: '30 mins',
    required: true,
    content: {
      sections: [
        {
          title: 'Choosing the Right Knife',
          content: 'An overview of different types of kitchen knives.',
          keyPoints: ["Chef's knife", 'Paring knife', 'Serrated knife']
        },
        {
          title: 'Proper Grip and Stance',
          content: 'How to hold a knife for maximum control and safety.',
          keyPoints: ['The "pinch" grip', 'Body positioning', 'Using a stable cutting board']
        },
        {
          title: 'Basic Cuts',
          content: 'Mastering fundamental cuts like dicing, mincing, and julienning.',
          keyPoints: ['Uniformity for even cooking', 'Practice with soft vegetables first', 'Keep your fingers curled']
        }
      ],
      quiz: [
        {
          question: 'What is the safest way to hold a chef\'s knife?',
          options: ['By the handle only', 'With a "pinch" grip', 'With two hands'],
          correct: 1
        }
      ]
    }
  }
];

const tasks = [
  { role: 'Lunch POS 2', description: 'put food in warmers - portioned for each line and for four lunches' },
  { role: 'Lunch POS 2', description: 'sanitize and clean front of line between lunch 2 and 3' },
  { role: 'Lunch POS 2', description: 'bag fruit if necessary' },
  { role: 'Lunch POS 2', description: 'sweep' },
  { role: 'Lunch POS 2', description: 'clean milk coolers' },
  { role: 'Lead', description: 'print out planagram and menu for team' },
  { role: 'Lead', description: 'check email and groupme' },
  { role: 'Lead', description: 'record breakfast numbers' },
  { role: 'Lead', description: 'record lunch numbers' },
  { role: 'Lead', description: 'record milk count' },
  { role: 'Lead', description: 'review cleaning at end of day' },
  { role: 'Lunch POS 1', description: 'receive food from truck and verify count' },
  { role: 'Lunch POS 1', description: 'sanitize and clean front of line between lunch 2 and 3' },
  { role: 'Lunch POS 1', description: 'bag fruit if necessary' },
  { role: 'Lunch POS 1', description: 'mop' },
  { role: 'Lunch POS 1', description: 'clean milk coolers' },
  { role: 'Lunch Line 1', description: 'setup food on line with utensils' },
  { role: 'Lunch Line 1', description: 'setup hot and cold temps for steam table wells' },
  { role: 'Lunch Line 1', description: 'clean wells after lunch' },
  { role: 'Lunch Line 1', description: 'clean fridges inside and out' },
  { role: 'Lunch Line 1', description: 'bag dirty pans' },
  { role: 'Lunch Line 2', description: 'setup food on line with utensils' },
  { role: 'Lunch Line 2', description: 'setup hot and cold temps for steam table wells' },
  { role: 'Lunch Line 2', description: 'clean wells after lunch' },
  { role: 'Lunch Line 2', description: 'clean fridges inside and out' },
  { role: 'Lunch Line 2', description: 'bag dirty pans' },
  { role: 'Bfst Line & POS', description: 'setup line with breakfast' },
  { role: 'Bfst Line & POS', description: 'put hot food in warmer' },
  { role: 'Bfst Line & POS', description: 'bag fruit if necessary' },
  { role: 'Bfst Cart Gym', description: 'load cart with menu items' },
  { role: 'Bfst Cart Gym', description: 'monitor cart and student id entry' },
  { role: 'Bfst Cart Gym', description: 'setup pos laptop' },
  { role: 'Bfst Cart Gym', description: 'unload cart' },
  { role: 'Bfst Cart Gym', description: 'sign out of POS' },
  { role: 'Bfst Cart Hall', description: 'load cart with menu items' },
  { role: 'Bfst Cart Hall', description: 'monitor cart and student id entry' },
  { role: 'Bfst Cart Hall', description: 'setup pos laptop' },
  { role: 'Bfst Cart Hall', description: 'unload cart' },
  { role: 'Bfst Cart Hall', description: 'sign out of POS' },
  { role: 'Bfst Cart Hall', description: 'take equipment temps' },
  { role: 'Bfst Cart Hall', description: 'setup sanitation station and test and log' }
];

const seedLogHistory = async (client, logTemplateIdMap, userIdMap) => {
  const categories = [
    {
      name: 'Food Temperatures',
      generator: (date) => ({
        temperatures: 'Entree: 165°F\nSide: 155°F\nVegetable: 150°F',
        correctiveActions: ''
      })
    },
    {
      name: 'Equipment Temperatures',
      generator: (date) => ({
        equipmentReadings: 'Walk-in Fridge: 38°F\nFreezer: 0°F\nMilk Cooler: 36°F\nWarmers: 148°F',
        issuesFound: ''
      })
    },
    {
      name: 'Sanitation',
      generator: (date) => ({
        sanitationTasks: 'All closing sanitation tasks completed. Floors mopped, surfaces sanitized, waste removed.',
        followUp: ''
      })
    },
    {
      name: 'Reimbursable Meals Count',
      generator: (date) => ({
        meal_date: date,
        meal_period: 'Lunch 1',
        served_count: 120,
        planned_count: 130,
        has_protein: true,
        has_grain: true,
        has_fruit: true,
        has_vegetable: true,
        has_milk: true,
        notes: ''
      })
    }
  ];

  const rayId = userIdMap.get('Ray Swan');
  if (!rayId) {
    throw new Error('Missing user id for Ray Swan to seed log history');
  }

  const start = new Date();
  start.setMonth(start.getMonth() - 36);
  const today = new Date();

  const dailyDates = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    dailyDates.push(new Date(d));
  }

  for (const dateObj of dailyDates) {
    const isoDate = dateObj.toISOString().split('T')[0];
    for (const category of categories) {
      const templateId = logTemplateIdMap.get(category.name);
      if (!templateId) continue;

      const formData = JSON.stringify(category.generator(isoDate));

      await client.query(
        `INSERT INTO log_submissions (
          log_template_id,
          log_assignment_id,
          submitted_by,
          submission_date,
          form_data,
          status,
          submitted_at
        ) VALUES ($1, NULL, $2, $3, $4, 'completed', $5)
        ON CONFLICT (log_template_id, submission_date, submitted_by) DO NOTHING`,
        [
          templateId,
          rayId,
          isoDate,
          formData,
          new Date(dateObj.getTime() + 9 * 60 * 60 * 1000) // submitted at 9am local
        ]
      );
    }
  }
};

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      TRUNCATE TABLE
        log_submissions,
        log_assignments,
        log_templates,
        tasks,
        role_phases,
        user_roles,
        phases,
        roles,
        logs,
        log_entries,
        log_status,
        audit_log,
        absences,
        outbox,
  training_modules,
        user_progress,
        planogram_wells,
        planograms,
        ingredients,
        users
      RESTART IDENTITY CASCADE
    `);

    await client.query(`INSERT INTO roles (id, name, status, deleted_at) VALUES ('tba-role', 'To Be Assigned', 'archived', CURRENT_TIMESTAMP)`);
    await client.query(`INSERT INTO phases (id, title, time, status, retired_at) VALUES ('tba-phase', 'Unassigned Phase', '00:00:00', 'retired', CURRENT_TIMESTAMP)`);

    const userIdMap = new Map();
    for (const user of users) {
      const hashed = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
      const { rows } = await client.query(
        'INSERT INTO users (name, email, password, phone, permissions, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [user.name.trim(), user.email.trim(), hashed, user.phone ? user.phone.trim() : null, user.permissions, 'active']
      );
      userIdMap.set(user.name.trim(), rows[0].id);
      userIdMap.set(user.email.trim(), rows[0].id);
    }

    const roleIdMap = new Map();
    for (const role of roles) {
      const id = slugify(role.name);
      await client.query('INSERT INTO roles (id, name, status) VALUES ($1, $2, $3)', [id, role.name, 'active']);
      roleIdMap.set(role.name, id);
      roleIdMap.set(id, id);
    }

    for (const role of roles) {
      const userId = userIdMap.get(role.assignedTo.trim());
      const roleId = roleIdMap.get(role.name);
      if (!userId || !roleId) {
        throw new Error(`Missing mapping for role assignment: ${role.name} -> ${role.assignedTo}`);
      }
      await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);
    }

    const phaseIdMap = new Map();
    const activeRoleIds = roles.map((role) => roleIdMap.get(role.name));
    for (const phase of phases) {
      const phaseId = slugify(phase.name);
      await client.query('INSERT INTO phases (id, title, time, status) VALUES ($1, $2, $3, $4)', [phaseId, phase.name, toTime(phase.start), 'active']);
      phaseIdMap.set(phase.name, phaseId);

      const targetedRoles = new Set();
      const primary = phase.primaryRole ? phase.primaryRole.trim() : '';
      const secondary = phase.secondaryRole ? phase.secondaryRole.trim() : '';

      if (primary.toLowerCase() === 'all roles') {
        activeRoleIds.forEach((id) => targetedRoles.add(id));
      } else if (primary) {
        const mapped = roleIdMap.get(primary);
        if (mapped) targetedRoles.add(mapped);
      }

      if (secondary.toLowerCase() === 'all roles') {
        activeRoleIds.forEach((id) => targetedRoles.add(id));
      } else if (secondary) {
        const mapped = roleIdMap.get(secondary);
        if (mapped) targetedRoles.add(mapped);
      }

      for (const roleId of targetedRoles) {
        await client.query('INSERT INTO role_phases (role_id, phase_id) VALUES ($1, $2)', [roleId, phaseId]);
      }
    }

    for (const task of tasks) {
      const roleId = roleIdMap.get(task.role);
      if (!roleId) {
        throw new Error(`Missing role for task: ${task.role}`);
      }
      await client.query(
        'INSERT INTO tasks (name, description, role_id, status) VALUES ($1, $2, $3, $4)',
        [task.description, task.description, roleId, 'active']
      );
    }

    for (const module of trainingModules) {
      await client.query(
        'INSERT INTO training_modules (id, title, description, duration, required, content) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          module.id,
          module.title,
          module.description,
          module.duration,
          module.required,
          JSON.stringify(module.content)
        ]
      );
    }

    const logTemplateIdMap = new Map();
    for (const log of logs) {
      const creatorId = userIdMap.get(log.assignedTo.trim());
      if (!creatorId) {
        throw new Error(`Missing user for log assignment: ${log.assignedTo}`);
      }
      const { rows } = await client.query(
        'INSERT INTO log_templates (name, description, category, frequency, form_schema, ui_schema, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [log.name, log.description, log.category, log.frequency, log.formSchema, log.uiSchema, creatorId]
      );
      const templateId = rows[0].id;
      logTemplateIdMap.set(log.name, templateId);

      await client.query(
        'INSERT INTO log_assignments (log_template_id, user_id, days_of_week, assigned_by, notes) VALUES ($1, $2, $3, $4, $5)',
        [templateId, creatorId, 'Mon,Tue,Wed,Thu,Fri', creatorId, 'Seeded live cafeteria assignment']
      );

      await client.query('INSERT INTO logs (id, name, status) VALUES ($1, $2, $3)', [slugify(log.name), log.name, 'active']);
    }

    await seedLogHistory(client, logTemplateIdMap, userIdMap);

    await client.query('COMMIT');
    console.log('✅ Live cafeteria dataset seeded successfully. Default password:', DEFAULT_PASSWORD);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed live dataset:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
})();
