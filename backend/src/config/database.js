const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Global variable for Vercel In-Memory storage
global.submissions = global.submissions || [];

const isVercel = process.env.VERCEL === '1';

let db;

if (!isVercel) {
    // --- LOCAL MODE (SQLite) ---
    const dbPath = path.resolve(__dirname, '../../database.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error("Error connecting to database:", err.message);
        else {
            console.log("Connected to SQLite database.");
            initializeDb();
        }
    });
} else {
    // --- VERCEL MODE (In-Memory) ---
    console.log("Running in Vercel Mode (In-Memory Database)");
}

function initializeDb() {
    if (isVercel) return;
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `;
    db.run(createTableSql, (err) => {
        if (err) console.error("Error creating table:", err.message);
    });
}

// --- DB WRAPPERS (Switch between SQLite and Array) ---

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    if (isVercel) {
        // Mock INSERT behavior for Array
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
            const [id, data, createdAt] = params;
            global.submissions.push({ id, data: JSON.parse(data), createdAt });
            return resolve({ lastID: id });
        }
        return resolve({});
    }

    // Normal SQLite behavior
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    if (isVercel) {
        // Mock COUNT behavior
        if (sql.includes('COUNT(*)')) {
            return resolve({ count: global.submissions.length });
        }
        return resolve({});
    }

    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    if (isVercel) {
        // Mock SELECT + PAGINATION
        const limit = params[0] || 10;
        const offset = params[1] || 0;

        // Sort descending by date (simulating ORDER BY createdAt DESC)
        const sorted = [...global.submissions].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        const sliced = sorted.slice(offset, offset + limit);

        // Return in format expected by your controller (stringified data property)
        // We re-stringify 'data' because your controller expects to parse it back
        const result = sliced.map(row => ({
            ...row,
            data: JSON.stringify(row.data)
        }));

        return resolve(result);
    }

    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

module.exports = { dbRun, dbGet, dbAll };