const express = require('express');
const cors = require('cors');
const db = require('./db/database');
const { generateRecommendations } = require('./interventions/engine');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Utility to run queries with promises
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
const querySingle = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};
const execute = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /api/login
app.post('/api/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await querySingle(`SELECT id, name, email, role FROM users WHERE email = ? AND password_hash = ?`, [email, password]);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ token: 'mock-jwt-token', user });
}));

// GET /api/dashboard/summary
app.get('/api/dashboard/summary', asyncHandler(async (req, res) => {
    const totalStudents = (await querySingle(`SELECT COUNT(*) as count FROM students`)).count;
    const riskCounts = await query(`SELECT risk_level, COUNT(*) as count FROM risk_predictions GROUP BY risk_level`);
    
    let summary = {
        totalStudents,
        lowRisk: 0,
        mediumRisk: 0,
        highRisk: 0,
        needsReview: 0,
        activeInterventions: 0,
        completedThisWeek: 0
    };

    riskCounts.forEach(r => {
        if (r.risk_level === 'LOW') summary.lowRisk = r.count;
        if (r.risk_level === 'MEDIUM') summary.mediumRisk = r.count;
        if (r.risk_level === 'HIGH') summary.highRisk = r.count;
    });

    summary.needsReview = summary.highRisk + summary.mediumRisk;

    const activeInt = await querySingle(`SELECT COUNT(*) as count FROM student_interventions WHERE status != 'Completed'`);
    summary.activeInterventions = activeInt.count;

    const completedThisWeek = await querySingle(`SELECT COUNT(*) as count FROM student_interventions WHERE status = 'Completed' AND completed_date >= datetime('now', '-7 days')`);
    summary.completedThisWeek = completedThisWeek.count;

    res.json(summary);
}));

// GET /api/students
app.get('/api/students', asyncHandler(async (req, res) => {
    const students = await query(`
        SELECT s.id, s.student_code, s.name, s.course, s.semester, 
               m.attendance_percent, m.assignment_percent, m.learning_activity,
               p.risk_level, p.predicted_at as last_updated
        FROM students s
        LEFT JOIN student_metrics m ON s.id = m.student_id
        LEFT JOIN risk_predictions p ON s.id = p.student_id
        ORDER BY 
            CASE p.risk_level 
                WHEN 'HIGH' THEN 1 
                WHEN 'MEDIUM' THEN 2 
                ELSE 3 
            END, s.name
    `);
    res.json(students);
}));

// GET /api/students/:id
app.get('/api/students/:id', asyncHandler(async (req, res) => {
    const student = await querySingle(`SELECT * FROM students WHERE id = ?`, [req.params.id]);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
}));

// GET /api/students/:id/metrics
app.get('/api/students/:id/metrics', asyncHandler(async (req, res) => {
    const metrics = await querySingle(`SELECT * FROM student_metrics WHERE student_id = ?`, [req.params.id]);
    res.json(metrics || {});
}));

// GET /api/students/:id/prediction
app.get('/api/students/:id/prediction', asyncHandler(async (req, res) => {
    const prediction = await querySingle(`SELECT * FROM risk_predictions WHERE student_id = ?`, [req.params.id]);
    res.json(prediction || {});
}));

// GET /api/students/:id/explanation
app.get('/api/students/:id/explanation', asyncHandler(async (req, res) => {
    const prediction = await querySingle(`SELECT id FROM risk_predictions WHERE student_id = ?`, [req.params.id]);
    if (!prediction) return res.json([]);
    const factors = await query(`SELECT * FROM risk_factors WHERE prediction_id = ? ORDER BY impact_value DESC`, [prediction.id]);
    res.json(factors);
}));

// GET /api/students/:id/interventions
app.get('/api/students/:id/interventions', asyncHandler(async (req, res) => {
    // 1. Get assigned interventions
    const assigned = await query(`
        SELECT si.id, i.title, i.description, si.assigned_date, si.status, si.mentor_feedback, si.completed_date
        FROM student_interventions si
        JOIN interventions i ON si.intervention_id = i.id
        WHERE si.student_id = ?
        ORDER BY si.assigned_date DESC
    `, [req.params.id]);

    // 2. Generate recommended interventions dynamically based on metrics
    const metrics = await querySingle(`SELECT * FROM student_metrics WHERE student_id = ?`, [req.params.id]);
    const prediction = await querySingle(`SELECT risk_level FROM risk_predictions WHERE student_id = ?`, [req.params.id]);
    
    let recommended = [];
    if (metrics && prediction) {
        const rawRecs = generateRecommendations(metrics, prediction.risk_level);
        // Map to full intervention records from library
        for (let r of rawRecs) {
            const intRecord = await querySingle(`SELECT id, title, description FROM interventions WHERE title = ?`, [r.title]);
            if (intRecord) recommended.push({ ...intRecord, reason: r.reason });
        }
    }

    res.json({ assigned, recommended });
}));

// POST /api/interventions
app.post('/api/interventions', asyncHandler(async (req, res) => {
    const { student_id, intervention_id, mentor_id } = req.body;
    const result = await execute(`INSERT INTO student_interventions (student_id, intervention_id, mentor_id, status) VALUES (?, ?, ?, 'Pending')`, [student_id, intervention_id, mentor_id]);
    res.json({ success: true, id: result.lastID });
}));

// PUT /api/interventions/:id
app.put('/api/interventions/:id', asyncHandler(async (req, res) => {
    const { status, mentor_feedback } = req.body;
    let completed_date = null;
    if (status === 'Completed') completed_date = new Date().toISOString();

    await execute(`
        UPDATE student_interventions 
        SET status = ?, mentor_feedback = ?, completed_date = ? 
        WHERE id = ?
    `, [status, mentor_feedback, completed_date, req.params.id]);
    
    res.json({ success: true });
}));

// GET /api/students/:id/risk-history
app.get('/api/students/:id/risk-history', asyncHandler(async (req, res) => {
    const history = await query(`SELECT risk_level, risk_score, recorded_date FROM risk_history WHERE student_id = ? ORDER BY recorded_date ASC`, [req.params.id]);
    res.json(history);
}));

// GET /api/fairness
app.get('/api/fairness', asyncHandler(async (req, res) => {
    // Return mock fairness metrics for the Responsible AI screen
    res.json({
        metrics: {
            "Male Students": { recall: 0.82, false_negative_rate: 0.18 },
            "Female Students": { recall: 0.84, false_negative_rate: 0.16 },
            "First Generation": { recall: 0.81, false_negative_rate: 0.19 },
            "Non First Generation": { recall: 0.85, false_negative_rate: 0.15 }
        },
        message: "Fairness metrics are provided for monitoring and should be reviewed with appropriate institutional context.",
        featuresUsed: [
            "Attendance", "Assessment Performance", "Previous Performance", 
            "Assignment Completion", "Learning Activity", "Missed Assessments"
        ],
        sensitiveExcluded: [
            "Gender", "Race/Ethnicity", "Socioeconomic Status", "Age", "Disability Status"
        ]
    });
}));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error. Please try again.' });
});

app.listen(PORT, () => {
    console.log(`ShikshaSetu API server running on port ${PORT}`);
});
