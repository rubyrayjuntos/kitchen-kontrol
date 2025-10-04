
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "database.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } else {
        console.log('Connected to the SQLite database.');
        db.run('PRAGMA foreign_keys = ON;');
        db.serialize(() => {
            const setupDatabase = require('./database-setup.js');
            const seedDatabase = require('./seed.js');
            setupDatabase(db);
            seedDatabase(db);
        });
    }
});

module.exports = db;
