const seedDatabase = (db) => {
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
        { id: 'head-chef', name: 'Head Chef', assignedUser: 'John Smith' },
        { id: 'sous-chef', name: 'Sous Chef', assignedUser: 'Maria Garcia' },
        { id: 'line-cook-1', name: 'Line Cook 1', assignedUser: 'Carlos Rodriguez' },
        { id: 'line-cook-2', name: 'Line Cook 2', assignedUser: 'Sarah Johnson' },
        { id: 'dishwasher', name: 'Dishwasher', assignedUser: 'Ana Martinez' }
    ];

    const tasks = [
        // Prep Phase
        { task: 'Review daily menu and prep list', role_id: 'head-chef', phase_id: 'prep' },
        { task: 'Receive and store deliveries', role_id: 'sous-chef', phase_id: 'prep' },
        { task: 'Wash and chop vegetables', role_id: 'line-cook-1', phase_id: 'prep' },
        { task: 'Prepare sauces and dressings', role_id: 'line-cook-2', phase_id: 'prep' },

        // Breakfast Phase
        { task: 'Cook breakfast entrees', role_id: 'line-cook-1', phase_id: 'breakfast' },
        { task: 'Set up breakfast service line', role_id: 'line-cook-2', phase_id: 'breakfast' },
        { task: 'Brew coffee and tea', role_id: 'sous-chef', phase_id: 'breakfast' },

        // Lunch Prep Phase
        { task: 'Marinate meats', role_id: 'line-cook-1', phase_id: 'lunch-prep' },
        { task: 'Assemble sandwiches and salads', role_id: 'line-cook-2', phase_id: 'lunch-prep' },

        // Lunch Phase
        { task: 'Cook lunch entrees', role_id: 'line-cook-1', phase_id: 'lunch' },
        { task: 'Restock service line', role_id: 'line-cook-2', phase_id: 'lunch' },
        { task: 'Expedite orders', role_id: 'head-chef', phase_id: 'lunch' },

        // Planogram Phase
        { task: 'Clean and sanitize workstations', role_id: 'line-cook-1', phase_id: 'planogram' },
        { task: 'Wash dishes', role_id: 'dishwasher', phase_id: 'planogram' },
        { task: 'Sweep and mop floors', role_id: 'sous-chef', phase_id: 'planogram' },
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
                    { title: 'Choosing the Right Knife', content: 'An overview of different types of kitchen knives.', keyPoints: ["Chef\'s knife", 'Paring knife', 'Serrated knife'] },
                    { title: 'Proper Grip and Stance', content: 'How to hold a knife for maximum control and safety.', keyPoints: ['The "pinch" grip', 'Body positioning', 'Using a stable cutting board'] },
                    { title: 'Basic Cuts', content: 'Mastering fundamental cuts like dicing, mincing, and julienning.', keyPoints: ['Uniformity for even cooking', 'Practice with soft vegetables first', 'Keep your fingers curled'] }
                ],
                quiz: [
                    { question: 'What is the safest way to hold a chef\'s knife?', options: ['By the handle only', 'With a "pinch" grip', 'With two hands'], correct: 1 }
                ]
            })
        }
    ];

    db.serialize(() => {
        db.get("SELECT COUNT(*) as count FROM phases", (err, row) => {
            if (row.count === 0) {
                const phaseStmt = db.prepare("INSERT INTO phases (id, title, time, status) VALUES (?, ?, ?, ?)");
                phases.forEach(phase => phaseStmt.run(phase.id, phase.title, phase.time, phase.status));
                phaseStmt.finalize();

                const roleStmt = db.prepare("INSERT INTO roles (id, name, assignedUser) VALUES (?, ?, ?)");
                roles.forEach(role => roleStmt.run(role.id, role.name, role.assignedUser));
                roleStmt.finalize();

                const taskStmt = db.prepare("INSERT INTO tasks (task, role_id, phase_id) VALUES (?, ?, ?)");
                tasks.forEach(task => taskStmt.run(task.task, task.role_id, task.phase_id));
                taskStmt.finalize();

                const trainingStmt = db.prepare("INSERT INTO training_modules (id, title, description, duration, required, content) VALUES (?, ?, ?, ?, ?, ?)");
                trainingModules.forEach(module => trainingStmt.run(module.id, module.title, module.description, module.duration, module.required, module.content));
                trainingStmt.finalize();

                const ingredientStmt = db.prepare("INSERT INTO ingredients (name, quantity, unit, category, minStock) VALUES (?, ?, ?, ?, ?)");
                const ingredients = [
                    { id: 1, name: 'Ground Beef', quantity: 15, unit: 'lbs', category: 'meat', minStock: 5 },
                    { id: 2, name: 'Burger Buns', quantity: 24, unit: 'pcs', category: 'bread', minStock: 10 },
                    { id: 3, name: 'Lettuce', quantity: 3, unit: 'heads', category: 'produce', minStock: 5 },
                    { id: 4, name: 'Tomatoes', quantity: 8, unit: 'lbs', category: 'produce', minStock: 3 },
                    { id: 5, name: 'Pears', quantity: 12, unit: 'pcs', category: 'fruit', minStock: 5 },
                    { id: 6, name: 'Peaches', quantity: 18, unit: 'pcs', category: 'fruit', minStock: 5 },
                ];
                ingredients.forEach(ingredient => ingredientStmt.run(ingredient.name, ingredient.quantity, ingredient.unit, ingredient.category, ingredient.minStock));
                ingredientStmt.finalize();

                console.log("Database seeded with initial data.");
            }
        });
    });
};



module.exports = seedDatabase;