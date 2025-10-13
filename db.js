
require('dotenv').config();
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
    // Use Postgres
    const pool = new Pool({ connectionString: DATABASE_URL });

    // Only log the first successful connection to avoid noisy repeated messages
    let _loggedConnect = false;
    pool.on('connect', () => {
        if (!_loggedConnect) {
            console.log('Connected to Postgres database.');
            _loggedConnect = true;
        }
    });

    // Helper to provide sqlite-like API used across the codebase
        // helper: convert SQL with '?' placeholders to $1, $2, ... for pg
        const convertQuestionMarks = (sql) => {
            let idx = 0;
            return sql.replace(/\?/g, () => {
                idx += 1;
                return `$${idx}`;
            });
        };

        const db = {
                run: (text, params, cb) => {
            // normalize args: run(sql, cb) or run(sql, params, cb) or run(sql, singleParam, cb)
            if (typeof params === 'function') {
                cb = params;
                params = [];
            } else if (!Array.isArray(params)) {
                params = params === undefined ? [] : [params];
            }

            // convert ? placeholders to $n for pg
            let sql = text;
            if (text.includes('?')) sql = convertQuestionMarks(text);

            // If INSERT and no RETURNING present, add RETURNING id so we can emulate lastID
            const upper = sql.trim().toUpperCase();
            if (upper.startsWith('INSERT') && !/RETURNING\s+/i.test(sql)) {
                sql = sql + ' RETURNING id';
            }

            pool.query(sql, params)
                .then((res) => {
                    const meta = {
                        lastID: (res.rows && res.rows[0] && (res.rows[0].id || res.rows[0].id === 0)) ? res.rows[0].id : null,
                        changes: res.rowCount
                    };
                    if (cb) cb.call(meta, null);
                })
                .catch((err) => { 
                    console.error('PG ERROR in run:', err && err.message, 'SQL:', sql, 'PARAMS:', params);
                    if (cb) cb(err); 
                });
        },
        get: (text, params, cb) => {
            if (typeof params === 'function') {
                cb = params;
                params = [];
            } else if (!Array.isArray(params)) {
                params = params === undefined ? [] : [params];
            }
            let sql = text;
            if (text.includes('?')) sql = convertQuestionMarks(text);
            pool.query(sql, params)
                .then((res) => cb && cb(null, res.rows[0]))
                .catch((err) => { console.error('PG ERROR in get:', err && err.message, 'SQL:', sql, 'PARAMS:', params); cb && cb(err); });
        },
        all: (text, params, cb) => {
            if (typeof params === 'function') {
                cb = params;
                params = [];
            } else if (!Array.isArray(params)) {
                params = params === undefined ? [] : [params];
            }
            let sql = text;
            if (text.includes('?')) sql = convertQuestionMarks(text);
            pool.query(sql, params)
                .then((res) => cb && cb(null, res.rows))
                .catch((err) => { console.error('PG ERROR in all:', err && err.message, 'SQL:', sql, 'PARAMS:', params); cb && cb(err); });
        },
        query: (text, params) => {
            let sql = text;
            if (text.includes('?')) sql = convertQuestionMarks(text);
            return pool.query(sql, params);
        },
        _pool: pool
    };

    // When using Postgres we expect migrations (node-pg-migrate) to manage schema and seeding.
    // Do not auto-run setup/seed here. Use npm scripts: `npm run migrate:up` and `npm run seed:pg`.

    module.exports = db;
} else {
    // Fallback to SQLite
    const DBSOURCE = process.env.DB_PATH || path.join(__dirname, 'database.db');
    const db = new sqlite3.Database(DBSOURCE, (err) => {
        if (err) {
            console.error(err.message);
            throw err;
        } else {
            console.log('Connected to the SQLite database.');
            db.run('PRAGMA foreign_keys = ON;');
            const setupDatabase = require('./database-setup.js');
            const seedDatabase = require('./seed.js');
            setupDatabase(db);
            seedDatabase(db);
        }
    });

    module.exports = db;
}
