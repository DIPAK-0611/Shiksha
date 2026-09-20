const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'shikshasetu.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeTables();
    }
});

function initializeTables() {
    db.serialize(() => {
        // Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Students Table
        db.run(`
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                class_name TEXT NOT NULL,
                course TEXT NOT NULL,
                semester INTEGER NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Student Metrics Table
        db.run(`
            CREATE TABLE IF NOT EXISTS student_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                attendance_percent REAL NOT NULL,
                assignment_percent REAL NOT NULL,
                internal_marks REAL NOT NULL,
                learning_activity REAL NOT NULL,
                previous_marks REAL NOT NULL,
                quiz_score REAL NOT NULL,
                missed_assessments INTEGER NOT NULL,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students (id)
            )
        `);

        // Risk Predictions Table
        db.run(`
            CREATE TABLE IF NOT EXISTS risk_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                risk_level TEXT NOT NULL,
                risk_probability REAL NOT NULL,
                model_version TEXT NOT NULL,
                predicted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students (id)
            )
        `);

        // Risk Factors Table
        db.run(`
            CREATE TABLE IF NOT EXISTS risk_factors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prediction_id INTEGER NOT NULL,
                feature_name TEXT NOT NULL,
                feature_value REAL NOT NULL,
                impact_value REAL NOT NULL,
                impact_direction TEXT NOT NULL,
                FOREIGN KEY (prediction_id) REFERENCES risk_predictions (id)
            )
        `);

        // Interventions Dictionary
        db.run(`
            CREATE TABLE IF NOT EXISTS interventions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                trigger_type TEXT NOT NULL,
                priority TEXT NOT NULL
            )
        `);

        // Student Interventions (Assigned)
        db.run(`
            CREATE TABLE IF NOT EXISTS student_interventions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                intervention_id INTEGER NOT NULL,
                mentor_id INTEGER NOT NULL,
                assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'Pending',
                mentor_feedback TEXT,
                completed_date DATETIME,
                FOREIGN KEY (student_id) REFERENCES students (id),
                FOREIGN KEY (intervention_id) REFERENCES interventions (id),
                FOREIGN KEY (mentor_id) REFERENCES users (id)
            )
        `);

        // Risk History
        db.run(`
            CREATE TABLE IF NOT EXISTS risk_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                risk_level TEXT NOT NULL,
                risk_score REAL NOT NULL,
                recorded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students (id)
            )
        `);
    });
}

module.exports = db;
