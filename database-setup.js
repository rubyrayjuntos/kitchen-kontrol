const setupDatabase = (db) => {
    db.serialize(() => {
        // Create phases table
        db.run(`CREATE TABLE IF NOT EXISTS phases (
            id TEXT PRIMARY KEY,
            title TEXT,
            time TIME,
            status TEXT
        )`);

        // Create roles table
        db.run(`CREATE TABLE IF NOT EXISTS roles (
            id TEXT PRIMARY KEY,
            name TEXT,
            assignedUser TEXT
        )`);

        // Create tasks table
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT,
            role_id TEXT,
            phase_id TEXT,
            FOREIGN KEY (role_id) REFERENCES roles (id),
            FOREIGN KEY (phase_id) REFERENCES phases (id)
        )`);

        // Create absences table
        db.run(`CREATE TABLE IF NOT EXISTS absences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            date DATE,
            reason TEXT,
            approved BOOLEAN,
            approvalDate DATE
        )`);

        // Create training_modules table
        db.run(`CREATE TABLE IF NOT EXISTS training_modules (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            duration TEXT,
            required BOOLEAN,
            content TEXT
        )`);

        // Create user_progress table
        db.run(`CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            module_id TEXT,
            started BOOLEAN,
            completed BOOLEAN,
            currentSection INTEGER,
            completedDate TEXT,
            FOREIGN KEY (module_id) REFERENCES training_modules (id)
        )`);

        // Create logs table
        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id TEXT PRIMARY KEY,
            name TEXT,
            status TEXT
        )`);

        // Create log_entries table
        db.run(`CREATE TABLE IF NOT EXISTS log_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_id TEXT,
            data TEXT,
            FOREIGN KEY (log_id) REFERENCES logs (id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS log_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_id TEXT,
            date TEXT,
            status TEXT,
            FOREIGN KEY (log_id) REFERENCES logs (id)
        )`);

        // Create planograms table
        db.run(`CREATE TABLE IF NOT EXISTS planograms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            title TEXT,
            shotgun TEXT
        )`);

        // Create planogram_wells table
        db.run(`CREATE TABLE IF NOT EXISTS planogram_wells (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            planogram_id INTEGER,
            temp TEXT,
            pan TEXT,
            food TEXT,
            utensil TEXT,
            FOREIGN KEY (planogram_id) REFERENCES planograms (id)
        )`);

        // Create ingredients table
        db.run(`CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            quantity INTEGER,
            unit TEXT,
            category TEXT,
            minStock INTEGER
        )`);

        console.log("Database tables created or already exist.");
    });
};

module.exports = setupDatabase;