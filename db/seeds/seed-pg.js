require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const phases = [
  { id: 'pre-breakfast', title: 'Pre Breakfast', time: '07:00', status: 'pending' },
  { id: 'breakfast', title: 'Breakfast', time: '08:00', status: 'pending' },
  { id: 'lunch-prep', title: 'Lunch Prep and Food Delivery', time: '08:30', status: 'pending' },
  { id: 'lunch-1', title: 'lunch 1', time: '10:15', status: 'pending' },
  { id: 'lunch-2', title: 'Lunch 2', time: '10:45', status: 'pending' },
  { id: 'mid-lunch-clean', title: 'Mid Lunch Clean', time: '11:15', status: 'pending' },
  { id: 'lunch-3', title: 'Lunch 3', time: '11:45', status: 'pending' },
  { id: 'lunch-4', title: 'Lunch 4', time: '12:15', status: 'pending' },
  { id: 'end-of-day', title: 'End of Day Clean', time: '12:45', status: 'pending' }
];

const roles = [
  { id: 'lunch-pos-2', name: 'Lunch POS 2' },
  { id: 'lead', name: 'Lead' },
  { id: 'lunch-pos-1', name: 'Lunch POS 1' },
  { id: 'lunch-line-1', name: 'Lunch Line 1' },
  { id: 'lunch-line-2', name: 'Lunch Line 2' },
  { id: 'bfst-line-pos', name: 'Bfst Line & POS' },
  { id: 'bfst-cart-hall', name: 'Bfst Cart Hall' },
  { id: 'bfst-cart-gym', name: 'Bfst Cart Gym' }
];

const rolePhases = [
  { role_id: 'bfst-line-pos', phase_id: 'pre-breakfast' },
  { role_id: 'lead', phase_id: 'pre-breakfast' },
  { role_id: 'bfst-line-pos', phase_id: 'breakfast' },
  { role_id: 'lead', phase_id: 'breakfast' }
];

const tasks = [
  // Lunch POS 2 tasks
  { name: 'Put food in warmers - portioned for each line and for four lunches', description: 'Stock warmers with portioned food for all lunch services', role_id: 'lunch-pos-2' },
  { name: 'Sanitize and clean front of line between lunch 2 and 3', description: 'Deep clean line front surfaces during service', role_id: 'lunch-pos-2' },
  { name: 'Bag fruit if necessary', description: 'Prepare and bag fruit portions as needed', role_id: 'lunch-pos-2' },
  { name: 'Sweep', description: 'Sweep work area', role_id: 'lunch-pos-2' },
  { name: 'Clean milk coolers', description: 'Clean and organize milk coolers', role_id: 'lunch-pos-2' },
  
  // Lead tasks
  { name: 'Print out planagram and menu for team', description: 'Print daily planogram and menu for staff reference', role_id: 'lead' },
  { name: 'Check email and groupme', description: 'Review daily communications', role_id: 'lead' },
  { name: 'Record breakfast numbers', description: 'Log breakfast service counts', role_id: 'lead' },
  { name: 'Record lunch numbers', description: 'Log lunch service counts', role_id: 'lead' },
  { name: 'Record milk count', description: 'Track milk inventory usage', role_id: 'lead' },
  { name: 'Review cleaning at end of day', description: 'Inspect end-of-day sanitation', role_id: 'lead' },
  
  // Lunch POS 1 tasks
  { name: 'Receive food from truck and verify count', description: 'Check and verify delivered items', role_id: 'lunch-pos-1' },
  { name: 'Sanitize and clean front of line between lunch 2 and 3', description: 'Deep clean line front surfaces during service', role_id: 'lunch-pos-1' },
  { name: 'Bag fruit if necessary', description: 'Prepare and bag fruit portions as needed', role_id: 'lunch-pos-1' },
  { name: 'Mop', description: 'Mop work area', role_id: 'lunch-pos-1' },
  { name: 'Clean milk coolers', description: 'Clean and organize milk coolers', role_id: 'lunch-pos-1' },
  
  // Lunch Line 1 tasks
  { name: 'Setup food on line with utensils', description: 'Arrange food and utensils for service', role_id: 'lunch-line-1' },
  { name: 'Setup hot and cold temps for steam table wells', description: 'Configure temperature settings', role_id: 'lunch-line-1' },
  { name: 'Clean wells after lunch', description: 'Post-service cleanup of steam wells', role_id: 'lunch-line-1' },
  { name: 'Clean fridges inside and out', description: 'Clean and organize refrigerators', role_id: 'lunch-line-1' },
  { name: 'Bag dirty pans', description: 'Collect and bag used cookware', role_id: 'lunch-line-1' },
  
  // Lunch Line 2 tasks
  { name: 'Setup food on line with utensils', description: 'Arrange food and utensils for service', role_id: 'lunch-line-2' },
  { name: 'Setup hot and cold temps for steam table wells', description: 'Configure temperature settings', role_id: 'lunch-line-2' },
  { name: 'Clean wells after lunch', description: 'Post-service cleanup of steam wells', role_id: 'lunch-line-2' },
  { name: 'Clean fridges inside and out', description: 'Clean and organize refrigerators', role_id: 'lunch-line-2' },
  { name: 'Bag dirty pans', description: 'Collect and bag used cookware', role_id: 'lunch-line-2' },
  
  // Bfst Line & POS tasks
  { name: 'Setup line with breakfast', description: 'Prepare breakfast line for service', role_id: 'bfst-line-pos' },
  { name: 'Put hot food in warmer', description: 'Keep breakfast items hot in warmers', role_id: 'bfst-line-pos' },
  { name: 'Bag fruit if necessary', description: 'Prepare fruit bags for distribution', role_id: 'bfst-line-pos' },
  
  // Bfst Cart Gym tasks
  { name: 'Load Cart with menu items', description: 'Stock breakfast cart for gym delivery', role_id: 'bfst-cart-gym' },
  { name: 'Monitor cart and student id entry', description: 'Oversee cart transactions', role_id: 'bfst-cart-gym' },
  { name: 'Setup pos laptop', description: 'Configure POS system', role_id: 'bfst-cart-gym' },
  { name: 'Unload cart', description: 'Remove items from cart', role_id: 'bfst-cart-gym' },
  { name: 'Sign out of POS', description: 'Close out POS session', role_id: 'bfst-cart-gym' },
  
  // Bfst Cart Hall tasks
  { name: 'Load Cart with menu items', description: 'Stock breakfast cart for hall delivery', role_id: 'bfst-cart-hall' },
  { name: 'Monitor cart and student id entry', description: 'Oversee cart transactions', role_id: 'bfst-cart-hall' },
  { name: 'Setup pos laptop', description: 'Configure POS system', role_id: 'bfst-cart-hall' },
  { name: 'Unload cart', description: 'Remove items from cart', role_id: 'bfst-cart-hall' },
  { name: 'Sign out of POS', description: 'Close out POS session', role_id: 'bfst-cart-hall' },
  { name: 'Take equipment temps', description: 'Record equipment temperatures', role_id: 'bfst-cart-hall' },
  { name: 'Setup sanitation station and test and log', description: 'Prepare sanitation station and log readings', role_id: 'bfst-cart-hall' }
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

const ingredients = [];

const users = [
  {
    name: 'Ray Swan',
    email: 'raymond.swan@sodexo.com',
    phone: '409-264-5074',
    permissions: 'admin',
    roleIds: ['lead', 'bfst-line-pos']
  },
  {
    name: 'Juanita Council',
    email: 'j@j.com',
    phone: '1111111111',
    permissions: 'user',
    roleIds: ['lunch-pos-2']
  },
  {
    name: 'Peter Marencelli',
    email: 'p@p.com',
    phone: '3333333333',
    permissions: 'user',
    roleIds: ['lunch-pos-1', 'bfst-cart-hall']
  },
  {
    name: 'Monzale',
    email: 'm@m.com',
    phone: '4444444444',
    permissions: 'user',
    roleIds: ['lunch-line-1', 'bfst-cart-gym']
  },
  {
    name: 'Veronica',
    email: 'v@v.com',
    phone: '5555555555',
    permissions: 'user',
    roleIds: ['lunch-line-2']
  }
];

const absences = [
  {
    userEmail: 'raymond.swan@sodexo.com',
    start_date: '2025-10-27',
    end_date: '2025-10-31',
    reason: 'Time off',
    approved: true,
    approvalDate: '2025-10-17'
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
    createdByEmail: 'raymond.swan@sodexo.com'
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
    createdByEmail: 'raymond.swan@sodexo.com'
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
    createdByEmail: 'raymond.swan@sodexo.com'
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
    createdByEmail: 'raymond.swan@sodexo.com'
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
    createdByEmail: 'raymond.swan@sodexo.com'
  }
];

const logAssignments = [
  {
    templateName: 'Receiving Temperature Log',
    targetType: 'user',
    targetEmail: 'raymond.swan@sodexo.com',
    due_time: '07:30',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Record temperatures for every delivery truck.'
  },
  {
    templateName: 'Line Check Temperature Log',
    targetType: 'user',
    targetEmail: 'raymond.swan@sodexo.com',
    due_time: '09:15',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Complete prior to opening breakfast service.'
  },
  {
    templateName: 'Cold Holding Log',
    targetType: 'user',
    targetEmail: 'raymond.swan@sodexo.com',
    due_time: '11:00',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Verify mid-day refrigeration temperatures.'
  },
  {
    templateName: 'Sanitation Checklist',
    targetType: 'user',
    targetEmail: 'raymond.swan@sodexo.com',
    due_time: '17:00',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Complete during closing procedures.'
  },
  {
    templateName: 'Reimbursable Meals Count',
    targetType: 'user',
    targetEmail: 'raymond.swan@sodexo.com',
    due_time: '13:45',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri',
    notes: 'Record counts for each reimbursable meal service.'
  }
];

const logSubmissions = [
  {
    templateName: 'Reimbursable Meals Count',
    submittedByEmail: 'raymond.swan@sodexo.com',
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
    submittedByEmail: 'raymond.swan@sodexo.com',
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
    submittedByEmail: 'raymond.swan@sodexo.com',
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

    console.log('Truncating tables...');
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
    console.log('Tables truncated successfully');

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
        'INSERT INTO ingredients (name, quantity, unit, category, "minStock") VALUES ($1, $2, $3, $4, $5)',
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
        'INSERT INTO absences (user_id, start_date, end_date, reason, approved, "approvalDate") VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, absence.start_date, absence.end_date, absence.reason, absence.approved, absence.approvalDate]
      );
    }

  const insertedTemplates = [];
  const insertedAssignments = [];
    const defaultAssigner = insertedUsers.find((u) => u.email === 'raymond.swan@sodexo.com') || insertedUsers[0];

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
