const isPg = (db) => !!db.query;

const runSql = async (db, sql) => {
    if (isPg(db)) {
        await db.query(sql);
    } else {
        return new Promise((resolve, reject) => {
            db.run(sql, (err) => err ? reject(err) : resolve());
        });
    }
};

const setupDatabase = async (db) => {
    try {
        if (isPg(db)) {
            // Postgres-compatible DDL
            await runSql(db, `CREATE TABLE IF NOT EXISTS phases (
                id TEXT PRIMARY KEY,
                title TEXT,
                time TIME,
                status TEXT
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                name TEXT
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                phone TEXT,
                permissions TEXT NOT NULL DEFAULT 'user'
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS user_roles (
                user_id INTEGER,
                role_id TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (role_id) REFERENCES roles (id)
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS role_phases (
                role_id TEXT,
                phase_id TEXT,
                FOREIGN KEY (role_id) REFERENCES roles (id),
                FOREIGN KEY (phase_id) REFERENCES phases (id)
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                name TEXT,
                description TEXT,
                role_id TEXT,
                FOREIGN KEY (role_id) REFERENCES roles (id)
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS absences (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                start_date DATE,
                end_date DATE,
                reason TEXT,
                approved BOOLEAN,
                approvalDate DATE,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS training_modules (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                duration TEXT,
                required BOOLEAN,
                content TEXT
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS user_progress (
                id SERIAL PRIMARY KEY,
                user_id TEXT,
                module_id TEXT,
                started BOOLEAN,
                completed BOOLEAN,
                currentSection INTEGER,
                completedDate TEXT,
                FOREIGN KEY (module_id) REFERENCES training_modules (id)
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS logs (
                id TEXT PRIMARY KEY,
                name TEXT,
                status TEXT
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS log_entries (
                id SERIAL PRIMARY KEY,
                log_id TEXT,
                data TEXT,
                FOREIGN KEY (log_id) REFERENCES logs (id)
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS log_status (
                id SERIAL PRIMARY KEY,
                log_id INTEGER,
                date DATE,
                status TEXT,
                FOREIGN KEY (log_id) REFERENCES tasks (id) ON DELETE CASCADE
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS planograms (
                id SERIAL PRIMARY KEY,
                date DATE,
                title TEXT,
                notes TEXT,
                compactPDF BOOLEAN
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS planogram_wells (
                id SERIAL PRIMARY KEY,
                planogram_id INTEGER,
                data TEXT,
                FOREIGN KEY (planogram_id) REFERENCES planograms (id)
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS ingredients (
                id SERIAL PRIMARY KEY,
                name TEXT,
                quantity INTEGER,
                unit TEXT,
                category TEXT,
                minStock INTEGER
            )`);

            await runSql(db, `CREATE TABLE IF NOT EXISTS audit_log (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                action TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);

        } else {
            // sqlite (existing schema)
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
                        name TEXT
                )`);

                // Create user_roles table
                db.run(`CREATE TABLE IF NOT EXISTS user_roles (
                        user_id INTEGER,
                        role_id TEXT,
                        FOREIGN KEY (user_id) REFERENCES users (id),
                        FOREIGN KEY (role_id) REFERENCES roles (id)
                )`);

                // Create role_phases table
                db.run(`CREATE TABLE IF NOT EXISTS role_phases (
                        role_id TEXT,
                        phase_id TEXT,
                        FOREIGN KEY (role_id) REFERENCES roles (id),
                        FOREIGN KEY (phase_id) REFERENCES phases (id)
                )`);

                // Create tasks table
                db.run(`CREATE TABLE IF NOT EXISTS tasks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        description TEXT,
                        role_id TEXT,
                        FOREIGN KEY (role_id) REFERENCES roles (id)
                )`);

                // Create absences table
                db.run(`CREATE TABLE IF NOT EXISTS absences (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        start_date DATE,
                        end_date DATE,
                        reason TEXT,
                        approved BOOLEAN,
                        approvalDate DATE,
                        FOREIGN KEY (user_id) REFERENCES users (id)
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
            log_id INTEGER,
            date DATE,
            status TEXT,
            FOREIGN KEY (log_id) REFERENCES tasks (id) ON DELETE CASCADE
        )`);

                // Create planograms table
                db.run(`CREATE TABLE IF NOT EXISTS planograms (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date DATE,
                        title TEXT,
                        notes TEXT,
                        compactPDF BOOLEAN
                )`);

                // Create planogram_wells table
                db.run(`CREATE TABLE IF NOT EXISTS planogram_wells (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        planogram_id INTEGER,
                        data TEXT,
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

                // Create users table
                db.run(`CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        phone TEXT,
                        permissions TEXT NOT NULL DEFAULT 'user'
                )`);

                // Create audit_log table
                db.run(`CREATE TABLE IF NOT EXISTS audit_log (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        action TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                )`);

                console.log("Database tables created or already exist.");
            });
        }
    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
};

module.exports = setupDatabase;