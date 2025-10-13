const seedDatabase = async (db) => {
    const phases = [
        { id: 'prep', title: 'Prep', time: '8:00 AM', status: 'completed' },
        { id: 'breakfast', title: 'Breakfast', time: '9:00 AM', status: 'active' },
        { id: 'lunch-prep', title: 'Lunch Prep', time: '11:00 AM', status: 'pending' },
        { id: 'lunch', title: 'Lunch', time: '12:00 PM', status: 'pending' },
        { id: 'planogram', title: 'Planogram', time: '2:00 PM', status: 'pending' },
        { id: 'deep-clean', title: 'Deep Clean', time: '3:00 PM', status: 'pending' },
        { id: 'final-prep', title: 'Final Prep', time: '4:00 PM', status: 'pending' }
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
        // Prep Phase
        { name: 'Review daily menu and prep list', description: 'Review daily menu and prep list', role_id: 'head-chef' },
        { name: 'Receive and store deliveries', description: 'Receive and store deliveries', role_id: 'sous-chef' },
        { name: 'Wash and chop vegetables', description: 'Wash and chop vegetables', role_id: 'line-cook-1' },
        { name: 'Prepare sauces and dressings', description: 'Prepare sauces and dressings', role_id: 'line-cook-2' },

        // Breakfast Phase
        { name: 'Cook breakfast entrees', description: 'Cook breakfast entrees', role_id: 'line-cook-1' },
        { name: 'Set up breakfast service line', description: 'Set up breakfast service line', role_id: 'line-cook-2' },
        { name: 'Brew coffee and tea', description: 'Brew coffee and tea', role_id: 'dishwasher' },

        // Lunch Prep Phase
        { name: 'Marinate meats', description: 'Marinate meats', role_id: 'sous-chef' },
        { name: 'Assemble sandwiches and salads', description: 'Assemble sandwiches and salads', role_id: 'line-cook-1' },

        // Lunch Phase
        { name: 'Cook lunch entrees', description: 'Cook lunch entrees', role_id: 'line-cook-1' },
        { name: 'Restock service line', description: 'Restock service line', role_id: 'line-cook-2' },
        { name: 'Expedite orders', description: 'Expedite orders', role_id: 'head-chef' },

        // Planogram Phase
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
            content: JSON.stringify({
                sections: [
                    { title: 'Introduction to Food Safety', content: 'Why food safety is critical in a kitchen environment.', keyPoints: ['Preventing foodborne illness', 'Legal requirements', 'Reputation management'] },
                    { title: 'Personal Hygiene', content: 'Proper hygiene practices for all kitchen staff.', keyPoints: ['Handwashing procedures', 'Proper attire', 'When to stay home'] },
                    { title: 'Temperature Control', content: 'Understanding the temperature danger zone.', keyPoints: ['Safe cooking temperatures', 'Proper cooling techniques', 'Calibrating thermometers'] }
                ],
                quiz: [
                    { question: 'What is the temperature danger zone?', options: ['40°F - 140°F', '32°F - 100°F', '50°F - 150°F'], correct: 0 },
                    { question: 'How long should you wash your hands?', options: ['10 seconds', '20 seconds', '30 seconds'], correct: 1 }
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
                    { title: 'Choosing the Right Knife', content: 'An overview of different types of kitchen knives.', keyPoints: ["Chef's knife", 'Paring knife', 'Serrated knife'] },
                    { title: 'Proper Grip and Stance', content: 'How to hold a knife for maximum control and safety.', keyPoints: ['The "pinch" grip', 'Body positioning', 'Using a stable cutting board'] },
                    { title: 'Basic Cuts', content: 'Mastering fundamental cuts like dicing, mincing, and julienning.', keyPoints: ['Uniformity for even cooking', 'Practice with soft vegetables first', 'Keep your fingers curled'] }
                ],
                quiz: [
                    { question: 'What is the safest way to hold a chef\'s knife?', options: ['By the handle only', 'With a "pinch" grip', 'With two hands'], correct: 1 }
                ]
            })
        }
    ];
    // determine whether db is a pg pool adapter (has query) or sqlite3 (has serialize/run/get)
    const isPg = !!db.query;

    if (isPg) {
        try {
            const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM phases');
            if (rows[0].count === 0) {
                // Insert phases
                for (const phase of phases) {
                    await db.query('INSERT INTO phases (id, title, time, status) VALUES ($1, $2, $3, $4)', [phase.id, phase.title, phase.time, phase.status]);
                }

                // roles
                for (const role of roles) {
                    await db.query('INSERT INTO roles (id, name) VALUES ($1, $2)', [role.id, role.name]);
                }

                // role_phases
                for (const rp of rolePhases) {
                    await db.query('INSERT INTO role_phases (role_id, phase_id) VALUES ($1, $2)', [rp.role_id, rp.phase_id]);
                }

                // tasks
                for (const task of tasks) {
                    await db.query('INSERT INTO tasks (name, description, role_id) VALUES ($1, $2, $3)', [task.name, task.description, task.role_id]);
                }

                // training modules
                for (const module of trainingModules) {
                    await db.query('INSERT INTO training_modules (id, title, description, duration, required, content) VALUES ($1, $2, $3, $4, $5, $6)', [module.id, module.title, module.description, module.duration, module.required, module.content]);
                }

                const ingredients = [
                    { id: 1, name: 'Ground Beef', quantity: 15, unit: 'lbs', category: 'meat', minStock: 5 },
                    { id: 2, name: 'Burger Buns', quantity: 24, unit: 'pcs', category: 'bread', minStock: 10 },
                    { id: 3, name: 'Lettuce', quantity: 3, unit: 'heads', category: 'produce', minStock: 5 },
                    { id: 4, name: 'Tomatoes', quantity: 8, unit: 'lbs', category: 'produce', minStock: 3 },
                    { id: 5, name: 'Pears', quantity: 12, unit: 'pcs', category: 'fruit', minStock: 5 },
                    { id: 6, name: 'Peaches', quantity: 18, unit: 'pcs', category: 'fruit', minStock: 5 }
                ];
                for (const ing of ingredients) {
                    await db.query('INSERT INTO ingredients (name, quantity, unit, category, minStock) VALUES ($1, $2, $3, $4, $5)', [ing.name, ing.quantity, ing.unit, ing.category, ing.minStock]);
                }

                const bcrypt = require('bcryptjs');
                const hashedPassword = bcrypt.hashSync('password', 10);
                const userRes = await db.query('INSERT INTO users (name, email, password, permissions) VALUES ($1, $2, $3, $4) RETURNING id', ['Admin', 'admin@example.com', hashedPassword, 'admin']);
                const userId = userRes.rows[0].id;
                await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, 'head-chef']);
                await db.query('INSERT INTO absences (user_id, start_date, end_date, reason, approved, approvalDate) VALUES ($1, $2, $3, $4, $5, $6)', [userId, '2025-10-10', '2025-10-12', 'Vacation', true, '2025-10-01']);

                console.log('Database seeded with initial data (Postgres).');
            }
        } catch (err) {
            console.error('Error seeding Postgres database:', err);
            throw err;
        }
    } else {
        // sqlite path (preserve existing behavior)
        db.serialize(() => {
            db.get('SELECT COUNT(*) as count FROM phases', (err, row) => {
                if (err) {
                    console.error('Error checking phases count (SQLite):', err);
                    return;
                }
                if (row.count === 0) {
                    const phaseStmt = db.prepare('INSERT INTO phases (id, title, time, status) VALUES (?, ?, ?, ?)');
                    phases.forEach(phase => phaseStmt.run(phase.id, phase.title, phase.time, phase.status));
                    phaseStmt.finalize();

                    const roleStmt = db.prepare('INSERT INTO roles (id, name) VALUES (?, ?)');
                    roles.forEach(role => roleStmt.run(role.id, role.name));
                    roleStmt.finalize();

                    const rolePhaseStmt = db.prepare('INSERT INTO role_phases (role_id, phase_id) VALUES (?, ?)');
                    rolePhases.forEach(rp => rolePhaseStmt.run(rp.role_id, rp.phase_id));
                    rolePhaseStmt.finalize();

                    const taskStmt = db.prepare('INSERT INTO tasks (name, description, role_id) VALUES (?, ?, ?)');
                    tasks.forEach(task => taskStmt.run(task.name, task.description, task.role_id));
                    taskStmt.finalize();

                    const trainingStmt = db.prepare('INSERT INTO training_modules (id, title, description, duration, required, content) VALUES (?, ?, ?, ?, ?, ?)');
                    trainingModules.forEach(module => trainingStmt.run(module.id, module.title, module.description, module.duration, module.required, module.content));
                    trainingStmt.finalize();

                    const ingredientStmt = db.prepare('INSERT INTO ingredients (name, quantity, unit, category, minStock) VALUES (?, ?, ?, ?, ?)');
                    const ingredients = [
                        { id: 1, name: 'Ground Beef', quantity: 15, unit: 'lbs', category: 'meat', minStock: 5 },
                        { id: 2, name: 'Burger Buns', quantity: 24, unit: 'pcs', category: 'bread', minStock: 10 },
                        { id: 3, name: 'Lettuce', quantity: 3, unit: 'heads', category: 'produce', minStock: 5 },
                        { id: 4, name: 'Tomatoes', quantity: 8, unit: 'lbs', category: 'produce', minStock: 3 },
                        { id: 5, name: 'Pears', quantity: 12, unit: 'pcs', category: 'fruit', minStock: 5 },
                        { id: 6, name: 'Peaches', quantity: 18, unit: 'pcs', category: 'fruit', minStock: 5 }
                    ];
                    ingredients.forEach(ingredient => ingredientStmt.run(ingredient.name, ingredient.quantity, ingredient.unit, ingredient.category, ingredient.minStock));
                    ingredientStmt.finalize();

                    const userStmt = db.prepare('INSERT INTO users (name, email, password, permissions) VALUES (?, ?, ?, ?)');
                    const bcrypt = require('bcryptjs');
                    const hashedPassword = bcrypt.hashSync('password', 10);
                    userStmt.run('Admin', 'admin@example.com', hashedPassword, 'admin', function (err) {
                        if (err) {
                            console.error(err.message);
                            return;
                        }
                        const userId = this.lastID;
                        const userRolesStmt = db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)');
                        userRolesStmt.run(userId, 'head-chef');
                        userRolesStmt.finalize();

                        const absenceStmt = db.prepare('INSERT INTO absences (user_id, start_date, end_date, reason, approved, approvalDate) VALUES (?, ?, ?, ?, ?, ?)');
                        absenceStmt.run(userId, '2025-10-10', '2025-10-12', 'Vacation', true, '2025-10-01');
                        absenceStmt.finalize();
                    });
                    userStmt.finalize();

                    console.log('Database seeded with initial data (SQLite).');
                }
            });
        });
    }
};

module.exports = seedDatabase;
