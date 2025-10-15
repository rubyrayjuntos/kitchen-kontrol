require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const phases = [
  { id: 'prep', title: 'Morning Prep', time: '07:00', status: 'completed' },
  { id: 'breakfast', title: 'Breakfast Service', time: '09:00', status: 'active' },
  { id: 'mid-morning', title: 'Mid-Morning Cleaning', time: '10:30', status: 'pending' },
  { id: 'lunch-prep', title: 'Lunch Prep', time: '11:30', status: 'pending' },
  { id: 'lunch', title: 'Lunch Service', time: '12:30', status: 'pending' },
  { id: 'snack', title: 'Afternoon Snack', time: '14:30', status: 'pending' },
  { id: 'shutdown', title: 'End-of-Day Sanitation', time: '16:00', status: 'pending' }
];

const roles = [
  { id: 'kitchen-manager', name: 'Kitchen Manager' },
  { id: 'head-chef', name: 'Head Chef' },
  { id: 'sous-chef', name: 'Sous Chef' },
  { id: 'line-cook-breakfast', name: 'Line Cook - Breakfast' },
  { id: 'line-cook-lunch', name: 'Line Cook - Lunch' },
  { id: 'dishwasher', name: 'Dishwasher' },
  { id: 'runner', name: 'Runner' }
];

const rolePhases = [
  { role_id: 'kitchen-manager', phase_id: 'prep' },
  { role_id: 'kitchen-manager', phase_id: 'shutdown' },
  { role_id: 'head-chef', phase_id: 'prep' },
  { role_id: 'head-chef', phase_id: 'breakfast' },
  { role_id: 'head-chef', phase_id: 'lunch' },
  { role_id: 'sous-chef', phase_id: 'prep' },
  { role_id: 'sous-chef', phase_id: 'lunch-prep' },
  { role_id: 'line-cook-breakfast', phase_id: 'prep' },
  { role_id: 'line-cook-breakfast', phase_id: 'breakfast' },
  { role_id: 'line-cook-lunch', phase_id: 'lunch-prep' },
  { role_id: 'line-cook-lunch', phase_id: 'lunch' },
  { role_id: 'dishwasher', phase_id: 'mid-morning' },
  { role_id: 'dishwasher', phase_id: 'shutdown' },
  { role_id: 'runner', phase_id: 'snack' }
];

const tasks = [
  { name: 'Finalize production sheet', description: 'Review head count and adjust production sheet before prep begins.', role_id: 'kitchen-manager' },
  { name: 'Coach staff on compliance focus', description: 'Share daily USDA and safety reminders during lineup.', role_id: 'kitchen-manager' },
  { name: 'Curtail last-minute menu changes', description: 'Approve substitutions based on inventory and allergies.', role_id: 'head-chef' },
  { name: 'Taste breakfast offerings', description: 'Sample entrées 15 minutes before service to ensure quality.', role_id: 'head-chef' },
  { name: 'Verify morning deliveries', description: 'Receive vendors and log temperatures of perishables.', role_id: 'sous-chef' },
  { name: 'Stage entrees for lunch', description: 'Marinate proteins and prepare sauces for the lunch turn.', role_id: 'sous-chef' },
  { name: 'Execute breakfast cook line', description: 'Cook main breakfast items and maintain holding temps.', role_id: 'line-cook-breakfast' },
  { name: 'Set self-serve stations', description: 'Stock fruit, yogurt, and condiments for breakfast service.', role_id: 'line-cook-breakfast' },
  { name: 'Prep vegetable sides', description: 'Blanch and sauté vegetables for lunch menu items.', role_id: 'line-cook-lunch' },
  { name: 'Assemble deli station', description: 'Build salads and sandwiches to order during lunch rush.', role_id: 'line-cook-lunch' },
  { name: 'Maintain dish pit rotation', description: 'Keep the 3-compartment sink cycling during peak times.', role_id: 'dishwasher' },
  { name: 'Deep clean slicers and mixers', description: 'Detail clean shared equipment during mid-morning break.', role_id: 'dishwasher' },
  { name: 'Deliver meal carts', description: 'Run meal carts to classrooms and satellite sites on schedule.', role_id: 'runner' },
  { name: 'Restock disposables', description: 'Replenish grab-and-go packaging and utensils.', role_id: 'runner' }
];

const trainingModules = [
  {
    id: 'food-safety-101',
    title: 'Food Safety 101',
    description: 'Basic principles of food safety and sanitation.',
    duration: '45 mins',
    required: true,
    content: JSON.stringify({
      sections: [
        {
          title: 'The Danger Zone',
          content: 'Foodborne pathogens grow rapidly between 41°F and 135°F. Keep hot foods hot and cold foods cold to minimize the time ingredients spend in this temperature range.',
          keyPoints: [
            'Hold hot foods at 135°F or above',
            'Hold cold foods at 41°F or below',
            'Log temperatures every service period'
          ]
        },
        {
          title: 'Cross-Contamination Prevention',
          content: 'Prevent pathogens from transferring between foods, surfaces, and equipment by using separate tools and strict cleaning routines.',
          keyPoints: [
            'Use color-coded cutting boards and utensils',
            'Store raw proteins below ready-to-eat foods',
            'Sanitize surfaces between tasks and after spills'
          ]
        },
        {
          title: 'Personal Hygiene Essentials',
          content: 'Proper handwashing, glove use, and health reporting keep our team and guests safe. Managers must reinforce these habits daily.',
          keyPoints: [
            'Wash hands for 20 seconds with warm water and soap',
            'Change gloves between tasks and whenever contaminated',
            'Report symptoms like vomiting, diarrhea, or fever immediately'
          ]
        }
      ],
      quiz: [
        {
          question: 'What temperature range is known as the “danger zone” for rapid bacteria growth?',
          options: ['32°F - 60°F', '41°F - 135°F', '150°F - 212°F', '0°F - 32°F'],
          correct: 1
        },
        {
          question: 'How should raw poultry be stored in relation to ready-to-eat foods?',
          options: ['Above ready-to-eat foods', 'On the same shelf', 'Below ready-to-eat foods', 'It does not matter'],
          correct: 2
        },
        {
          question: 'When must gloves be changed?',
          options: ['Every hour', 'Between tasks or when contaminated', 'Only at the end of the shift', 'After touching hot food only'],
          correct: 1
        }
      ]
    })
  },
  {
    id: 'knife-skills',
    title: 'Knife Skills and Safety',
    description: 'Learn to handle knives safely and efficiently.',
    duration: '30 mins',
    required: true,
    content: JSON.stringify({
      sections: [
        {
          title: 'Knife Anatomy & Selection',
          content: 'Match the knife to the task. Chefs knives are workhorses, while paring knives excel with detail work. Keeping blades sharp reduces fatigue and prevents slips.',
          keyPoints: [
            'Use a chef’s knife for chopping, slicing, and mincing',
            'Select a serrated knife for bread or delicate tomatoes',
            'Maintain a 20° angle when honing on a steel'
          ]
        },
        {
          title: 'Proper Grip & Cutting Motion',
          content: 'Use a pinch grip on the blade and guide the knife with your non-cutting hand to create consistent cuts while protecting your fingers.',
          keyPoints: [
            'Pinch the blade with thumb and index finger; wrap remaining fingers around the handle',
            'Use the claw technique with the guide hand',
            'Rock the knife from tip to heel for control'
          ]
        },
        {
          title: 'Safety & Maintenance',
          content: 'Clean knives immediately after use, never leave them in sinks, and store them on magnetic strips or in protected slots to prevent accidents.',
          keyPoints: [
            'Wash, rinse, and sanitize knives before putting them away',
            'Carry knives pointed down at your side while announcing “knife”',
            'Schedule weekly honing and monthly sharpening'
          ]
        }
      ],
      quiz: [
        {
          question: 'What grip gives you the most control over a chef’s knife?',
          options: ['Handle-only grip', 'Pinch grip on the blade', 'Thumb on top grip', 'Hold it like a pencil'],
          correct: 1
        },
        {
          question: 'Which technique protects your guide hand fingers while cutting?',
          options: ['Flat palm', 'Claw technique', 'Open hand', 'Side-by-side grip'],
          correct: 1
        },
        {
          question: 'Where should knives be stored after cleaning?',
          options: ['Loose in a drawer', 'In the sink to soak', 'On a magnetic strip or knife block', 'On the prep table'],
          correct: 2
        }
      ]
    })
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

const users = [
  {
    name: 'Admin User',
    email: 'admin@kitchen.local',
    phone: '555-0100',
    permissions: 'admin',
    roleIds: ['kitchen-manager']
  },
  {
    name: 'Demo Admin',
    email: 'admin@example.com',
    phone: '555-0105',
    permissions: 'admin',
    roleIds: ['kitchen-manager']
  },
  {
    name: 'Allison Kim',
    email: 'allison.kim@kitchen.local',
    phone: '555-0101',
    permissions: 'admin',
    roleIds: ['head-chef']
  },
  {
    name: 'Marco Rivera',
    email: 'marco.rivera@kitchen.local',
    phone: '555-0102',
    permissions: 'admin',
    roleIds: ['sous-chef']
  },
  {
    name: 'John Doe',
    email: 'john.doe@kitchen.local',
    phone: '555-0110',
    permissions: 'user',
    roleIds: ['line-cook-breakfast']
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@kitchen.local',
    phone: '555-0111',
    permissions: 'user',
    roleIds: ['line-cook-lunch']
  },
  {
    name: 'Samira Patel',
    email: 'samira.patel@kitchen.local',
    phone: '555-0112',
    permissions: 'user',
    roleIds: ['dishwasher']
  },
  {
    name: 'Evan Brooks',
    email: 'evan.brooks@kitchen.local',
    phone: '555-0113',
    permissions: 'user',
    roleIds: ['runner']
  }
];

const absences = [
  {
    userEmail: 'maria.garcia@kitchen.local',
    start_date: '2025-10-18',
    end_date: '2025-10-20',
    reason: 'Family wedding',
    approved: true,
    approvalDate: '2025-10-05'
  },
  {
    userEmail: 'evan.brooks@kitchen.local',
    start_date: '2025-10-21',
    end_date: '2025-10-21',
    reason: 'Missed shift follow-up',
    approved: false,
    approvalDate: '2025-10-12'
  },
  {
    userEmail: 'samira.patel@kitchen.local',
    start_date: '2025-10-25',
    end_date: '2025-10-26',
    reason: 'Medical appointments',
    approved: null,
    approvalDate: null
  }
];

const logTemplates = [
  {
    name: 'Receiving Temperature Log',
    description: 'Document product temperatures when deliveries arrive.',
    category: 'food_safety',
    frequency: 'per_service',
    formSchema: {
      type: 'object',
      title: 'Receiving Temperature Log',
      properties: {
        vendor: { type: 'string', title: 'Vendor' },
        item: { type: 'string', title: 'Item Received' },
        temperature: { type: 'number', title: 'Temperature (°F)' },
        corrective_action: { type: 'string', title: 'Corrective Action', default: '' },
        notes: { type: 'string', title: 'Notes', default: '' }
      },
      required: ['vendor', 'item', 'temperature']
    },
    uiSchema: {
      temperature: { 'ui:widget': 'updown' },
      corrective_action: { 'ui:widget': 'textarea' },
      notes: { 'ui:widget': 'textarea' }
    },
    createdByEmail: 'admin@kitchen.local'
  },
  {
    name: 'Line Check Temperature Log',
    description: 'Verify hot and cold holding temperatures before each service.',
    category: 'food_safety',
    frequency: 'per_service',
    formSchema: {
      type: 'object',
      title: 'Line Check Temperature Log',
      properties: {
        station: { type: 'string', title: 'Station' },
        item: { type: 'string', title: 'Menu Item' },
        temperature: { type: 'number', title: 'Temperature (°F)' },
        status: { type: 'string', enum: ['Pass', 'Corrective Action'], title: 'Status' },
        notes: { type: 'string', title: 'Notes', default: '' }
      },
      required: ['station', 'item', 'temperature', 'status']
    },
    uiSchema: {
      temperature: { 'ui:widget': 'updown' },
      status: { 'ui:widget': 'radio' },
      notes: { 'ui:widget': 'textarea' }
    },
    createdByEmail: 'admin@example.com'
  },
  {
    name: 'Sanitation Checklist',
    description: 'End-of-day sanitation steps for kitchen shutdown.',
    category: 'operations',
    frequency: 'daily',
    formSchema: {
      type: 'object',
      title: 'Sanitation Checklist',
      properties: {
        completed_by: { type: 'string', title: 'Completed By' },
        dish_pit: { type: 'boolean', title: 'Dish pit sanitized' },
        equipment_wiped: { type: 'boolean', title: 'Equipment wiped down' },
        floors_clean: { type: 'boolean', title: 'Floors scrubbed and mopped' },
        waste_removed: { type: 'boolean', title: 'Waste removed from facility' },
        issues: { type: 'string', title: 'Issues / Follow-ups', default: '' }
      },
      required: ['completed_by', 'dish_pit', 'equipment_wiped', 'floors_clean', 'waste_removed']
    },
    uiSchema: {
      dish_pit: { 'ui:widget': 'select' },
      equipment_wiped: { 'ui:widget': 'select' },
      floors_clean: { 'ui:widget': 'select' },
      waste_removed: { 'ui:widget': 'select' },
      issues: { 'ui:widget': 'textarea' }
    },
    createdByEmail: 'admin@kitchen.local'
  },
  {
    name: 'Cold Holding Log',
    description: 'Midday verification of refrigeration temperatures.',
    category: 'food_safety',
    frequency: 'twice_daily',
    formSchema: {
      type: 'object',
      title: 'Cold Holding Log',
      properties: {
        unit: { type: 'string', title: 'Unit / Cooler' },
        reading: { type: 'number', title: 'Temperature (°F)' },
        within_range: { type: 'boolean', title: 'Within safe range (≤ 41°F)' },
        corrective_action: { type: 'string', title: 'Corrective Action', default: '' }
      },
      required: ['unit', 'reading', 'within_range']
    },
    uiSchema: {
      reading: { 'ui:widget': 'updown' },
      within_range: { 'ui:widget': 'select' },
      corrective_action: { 'ui:widget': 'textarea' }
    },
    createdByEmail: 'admin@example.com'
  },
  {
    name: 'Reimbursable Meals Count',
    description: 'Track reimbursable meal components and counts for reimbursement reporting.',
    category: 'compliance',
    frequency: 'daily',
    formSchema: {
      type: 'object',
      title: 'Reimbursable Meals Count',
      properties: {
        meal_period: { type: 'string', title: 'Meal Period', enum: ['Breakfast', 'Lunch', 'Snack'] },
        served_count: { type: 'integer', title: 'Meals Served' },
        planned_count: { type: 'integer', title: 'Meals Planned' },
        has_protein: { type: 'boolean', title: 'Protein Component Present' },
        has_grain: { type: 'boolean', title: 'Grain Component Present' },
        has_fruit: { type: 'boolean', title: 'Fruit Component Present' },
        has_vegetable: { type: 'boolean', title: 'Vegetable Component Present' },
        has_milk: { type: 'boolean', title: 'Milk Component Present' },
        notes: { type: 'string', title: 'Notes', default: '' }
      },
      required: ['meal_period', 'served_count', 'planned_count']
    },
    uiSchema: {
      served_count: { 'ui:widget': 'updown' },
      planned_count: { 'ui:widget': 'updown' },
      has_protein: { 'ui:widget': 'select' },
      has_grain: { 'ui:widget': 'select' },
      has_fruit: { 'ui:widget': 'select' },
      has_vegetable: { 'ui:widget': 'select' },
      has_milk: { 'ui:widget': 'select' },
      notes: { 'ui:widget': 'textarea' }
    },
    createdByEmail: 'admin@kitchen.local'
  }
];

const logAssignments = [
  {
    templateName: 'Receiving Temperature Log',
    targetType: 'user',
    targetEmail: 'marco.rivera@kitchen.local',
    due_time: '07:30',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Record temperatures for every delivery truck.'
  },
  {
    templateName: 'Line Check Temperature Log',
    targetType: 'role',
    roleId: 'line-cook-breakfast',
    due_time: '09:15',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Complete prior to opening breakfast service.'
  },
  {
    templateName: 'Cold Holding Log',
    targetType: 'role',
    roleId: 'kitchen-manager',
    due_time: '11:00',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Verify mid-day refrigeration temperatures.'
  },
  {
    templateName: 'Sanitation Checklist',
    targetType: 'phase',
    phaseId: 'shutdown',
    due_time: '17:00',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Complete during closing procedures.'
  },
  {
    templateName: 'Reimbursable Meals Count',
    targetType: 'role',
    roleId: 'kitchen-manager',
    due_time: '13:45',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Record counts for each reimbursable meal service.'
  }
];

const logSubmissions = [
  {
    templateName: 'Reimbursable Meals Count',
    submittedByEmail: 'admin@kitchen.local',
    submission_date: '2025-10-13',
    formData: {
      meal_period: 'Lunch',
      served_count: 180,
      planned_count: 190,
      has_protein: true,
      has_grain: true,
      has_fruit: true,
      has_vegetable: true,
      has_milk: true,
      notes: 'All components verified on the line.'
    }
  },
  {
    templateName: 'Reimbursable Meals Count',
    submittedByEmail: 'admin@example.com',
    submission_date: '2025-10-14',
    formData: {
      meal_period: 'Lunch',
      served_count: 175,
      planned_count: 185,
      has_protein: true,
      has_grain: true,
      has_fruit: true,
      has_vegetable: false,
      has_milk: true,
      notes: 'Vegetable side ran out during final service.'
    }
  },
  {
    templateName: 'Reimbursable Meals Count',
    submittedByEmail: 'marco.rivera@kitchen.local',
    submission_date: '2025-10-15',
    formData: {
      meal_period: 'Breakfast',
      served_count: 120,
      planned_count: 125,
      has_protein: true,
      has_grain: true,
      has_fruit: true,
      has_vegetable: false,
      has_milk: true,
      notes: 'Breakfast service completed; vegetable component not required.'
    }
  }
];

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
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
      RESTART IDENTITY CASCADE
    `);

    for (const phase of phases) {
      await client.query(
        'INSERT INTO phases (id, title, time, status) VALUES ($1, $2, $3, $4)',
        [phase.id, phase.title, phase.time, phase.status]
      );
    }

    for (const role of roles) {
      await client.query('INSERT INTO roles (id, name) VALUES ($1, $2)', [role.id, role.name]);
    }

    for (const link of rolePhases) {
      await client.query('INSERT INTO role_phases (role_id, phase_id) VALUES ($1, $2)', [link.role_id, link.phase_id]);
    }

    for (const task of tasks) {
      await client.query(
        'INSERT INTO tasks (name, description, role_id) VALUES ($1, $2, $3)',
        [task.name, task.description, task.role_id]
      );
    }

    for (const module of trainingModules) {
      await client.query(
        'INSERT INTO training_modules (id, title, description, duration, required, content) VALUES ($1, $2, $3, $4, $5, $6)',
        [module.id, module.title, module.description, module.duration, module.required, module.content]
      );
    }

    for (const ingredient of ingredients) {
      await client.query(
        'INSERT INTO ingredients (name, quantity, unit, category, minStock) VALUES ($1, $2, $3, $4, $5)',
        [ingredient.name, ingredient.quantity, ingredient.unit, ingredient.category, ingredient.minStock]
      );
    }

    const hashedPassword = bcrypt.hashSync('password', 10);
    const insertedUsers = [];

    for (const user of users) {
      const result = await client.query(
        'INSERT INTO users (name, email, password, phone, permissions) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [user.name, user.email, hashedPassword, user.phone, user.permissions]
      );
      insertedUsers.push({ ...user, id: result.rows[0].id });
    }

    for (const user of insertedUsers) {
      for (const roleId of user.roleIds) {
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.id, roleId]);
      }
    }

    for (const absence of absences) {
      const user = insertedUsers.find((u) => u.email === absence.userEmail);
      if (!user) {
        continue;
      }
      await client.query(
        'INSERT INTO absences (user_id, start_date, end_date, reason, approved, approvalDate) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, absence.start_date, absence.end_date, absence.reason, absence.approved, absence.approvalDate]
      );
    }

  const insertedTemplates = [];
  const insertedAssignments = [];
    const defaultAssigner = insertedUsers.find((u) => u.email === 'admin@kitchen.local') || insertedUsers[0];

    for (const template of logTemplates) {
      const creator = insertedUsers.find((u) => u.email === template.createdByEmail) || defaultAssigner;
      const result = await client.query(
        `INSERT INTO log_templates (name, description, category, frequency, form_schema, ui_schema, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name`
      , [
        template.name,
        template.description,
        template.category,
        template.frequency,
        template.formSchema,
        template.uiSchema,
        creator ? creator.id : null
      ]);
      insertedTemplates.push({ ...template, id: result.rows[0].id });
    }

    for (const assignment of logAssignments) {
      const template = insertedTemplates.find((t) => t.name === assignment.templateName);
      if (!template) {
        continue;
      }

      let userId = null;
      let roleId = null;
      let phaseId = null;

      if (assignment.targetType === 'user') {
        const targetUser = insertedUsers.find((u) => u.email === assignment.targetEmail);
        if (!targetUser) {
          continue;
        }
        userId = targetUser.id;
      } else if (assignment.targetType === 'role') {
        roleId = assignment.roleId;
      } else if (assignment.targetType === 'phase') {
        phaseId = assignment.phaseId;
      }

      const assignmentResult = await client.query(
        `INSERT INTO log_assignments (log_template_id, user_id, role_id, phase_id, due_time, days_of_week, notes, assigned_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`
      , [
        template.id,
        userId,
        roleId,
        phaseId,
        assignment.due_time,
        assignment.days_of_week,
        assignment.notes || null,
        defaultAssigner ? defaultAssigner.id : null
      ]);
      insertedAssignments.push({ id: assignmentResult.rows[0].id, template_id: template.id });
    }

    for (const submission of logSubmissions) {
      const template = insertedTemplates.find((t) => t.name === submission.templateName);
      if (!template) {
        continue;
      }

      const submitter = insertedUsers.find((u) => u.email === submission.submittedByEmail);
      if (!submitter) {
        continue;
      }

      const assignment = insertedAssignments.find((a) => a.template_id === template.id);

      await client.query(
        `INSERT INTO log_submissions (log_template_id, log_assignment_id, submitted_by, submission_date, form_data, status)
         VALUES ($1, $2, $3, $4, $5, $6)`
      , [
        template.id,
        assignment ? assignment.id : null,
        submitter.id,
        submission.submission_date,
        submission.formData,
        submission.status || 'completed'
      ]);
    }

    console.log('Seeded kitchen demo dataset into Postgres');

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
