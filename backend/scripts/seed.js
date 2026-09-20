const db = require('../db/database');
const { trainModel, predict } = require('../ml/model');
const { explainPrediction } = require('../ml/explain');

// First names and last names for synthetic data
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Diya', 'Ananya', 'Kiara', 'Aadhya', 'Pari', 'Sneha', 'Riya', 'Kavya', 'Neha', 'Maya', 'Saanvi', 'Rahul', 'Amit', 'Neha', 'Priya', 'Rohan', 'Karan', 'Pooja', 'Vikram'];
const lastNames = ['Patil', 'Kulkarni', 'Shah', 'Sharma', 'Singh', 'Verma', 'Kumar', 'Gupta', 'Deshmukh', 'Joshi', 'Chavan', 'Rao', 'Bhat', 'Menon', 'Nair', 'Iyer', 'Pillai', 'Gowda', 'Reddy', 'Naidu'];
const courses = ['CSE', 'ECE', 'ME', 'CE', 'IT'];

const generateStudent = (id) => {
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const course = courses[Math.floor(Math.random() * courses.length)];
    const semester = Math.floor(Math.random() * 8) + 1;
    return {
        student_code: `STU2024${String(id).padStart(4, '0')}`,
        name,
        class_name: `${course}-${semester}A`,
        course,
        semester,
        email: `student${id}@shikshasetu.demo`
    };
};

// Generate realistic metrics
const generateMetrics = (isHighRisk) => {
    if (isHighRisk) {
        return {
            attendance_percent: Math.floor(Math.random() * 30) + 40, // 40-70
            assignment_percent: Math.floor(Math.random() * 40) + 30, // 30-70
            internal_marks: Math.floor(Math.random() * 30) + 30, // 30-60
            learning_activity: Math.floor(Math.random() * 30) + 20, // 20-50
            previous_marks: Math.floor(Math.random() * 30) + 40, // 40-70
            quiz_score: Math.floor(Math.random() * 30) + 30, // 30-60
            missed_assessments: Math.floor(Math.random() * 4) + 2, // 2-5
        };
    } else {
        const isMediumRisk = Math.random() > 0.6;
        if (isMediumRisk) {
            return {
                attendance_percent: Math.floor(Math.random() * 20) + 65, // 65-85
                assignment_percent: Math.floor(Math.random() * 20) + 60, // 60-80
                internal_marks: Math.floor(Math.random() * 20) + 55, // 55-75
                learning_activity: Math.floor(Math.random() * 30) + 50, // 50-80
                previous_marks: Math.floor(Math.random() * 20) + 60, // 60-80
                quiz_score: Math.floor(Math.random() * 20) + 60, // 60-80
                missed_assessments: Math.floor(Math.random() * 2) + 1, // 1-2
            };
        } else { // Low Risk
            return {
                attendance_percent: Math.floor(Math.random() * 15) + 85, // 85-100
                assignment_percent: Math.floor(Math.random() * 15) + 85, // 85-100
                internal_marks: Math.floor(Math.random() * 20) + 80, // 80-100
                learning_activity: Math.floor(Math.random() * 20) + 80, // 80-100
                previous_marks: Math.floor(Math.random() * 20) + 80, // 80-100
                quiz_score: Math.floor(Math.random() * 20) + 80, // 80-100
                missed_assessments: 0,
            };
        }
    }
};

const runSeed = async () => {
    console.log('Starting seed process...');
    
    // 1. Clear tables for idempotency (in a real app we'd be more careful)
    const tables = ['risk_history', 'student_interventions', 'risk_factors', 'risk_predictions', 'student_metrics', 'interventions', 'students', 'users'];
    
    for (let table of tables) {
        await new Promise((res) => db.run(`DELETE FROM ${table}`, res));
        await new Promise((res) => db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`, res)); // Reset AI
    }

    // 2. Insert Users (Mentor)
    await new Promise((res) => db.run(`INSERT INTO users (name, email, password_hash, role) VALUES ('Demo Mentor', 'mentor@shikshasetu.demo', 'password123', 'mentor')`, res));

    // 3. Insert Interventions Library
    const interventions = [
        ['Mentor Meeting', 'One-to-one academic check-in.', 'HIGH_RISK', 'High'],
        ['Remedial Session', 'Additional support for areas with weak assessment performance.', 'LOW_MARKS', 'High'],
        ['Weekly Progress Review', 'Monitor attendance, assignments and performance for the next two weeks.', 'TREND_DECLINE', 'Medium'],
        ['Learning Resources', 'Provide extra reading materials or video lectures to boost engagement.', 'LOW_ACTIVITY', 'Low'],
        ['Assignment Support', 'Help structure time and provide guidance for completing missing assignments.', 'LOW_ASSIGNMENT', 'Medium'],
        ['Subject Practice', 'Assign additional practice sets to improve understanding.', 'LOW_MARKS', 'Medium'],
        ['Attendance Follow-up', 'Check-in regarding recent absences.', 'LOW_ATTENDANCE', 'High']
    ];

    for (let inv of interventions) {
        await new Promise((res) => db.run(`INSERT INTO interventions (title, description, trigger_type, priority) VALUES (?, ?, ?, ?)`, inv, res));
    }

    // 4. Generate Students and Metrics
    const NUM_STUDENTS = 300;
    let mlData = [];
    let mlLabels = [];
    let studentsInfo = [];

    // Pre-determine some specific high risk students for demo
    for (let i = 1; i <= NUM_STUDENTS; i++) {
        const student = generateStudent(i);
        // Force the first 5 to be high risk, the rest 15% high risk
        const isHighRisk = i <= 5 || Math.random() < 0.15; 
        
        // Manual override for demo predictability
        if (i === 1) { student.name = 'Rahul Patil'; student.course = 'CSE'; student.semester = 3; }
        if (i === 2) { student.name = 'Sneha Kulkarni'; student.course = 'CSE'; student.semester = 3; }
        if (i === 3) { student.name = 'Amit Shah'; student.course = 'ECE'; student.semester = 4; }

        await new Promise((res) => {
            db.run(`INSERT INTO students (student_code, name, class_name, course, semester, email) VALUES (?, ?, ?, ?, ?, ?)`, 
                [student.student_code, student.name, student.class_name, student.course, student.semester, student.email], 
                function(err) {
                    student.id = this.lastID;
                    res();
                });
        });

        // Generate specific metrics for known demo users
        let metrics;
        if (i === 1) {
            metrics = { attendance_percent: 58, assignment_percent: 42, internal_marks: 45, learning_activity: 38, previous_marks: 51, quiz_score: 40, missed_assessments: 3 };
        } else if (i === 2) {
            metrics = { attendance_percent: 86, assignment_percent: 84, internal_marks: 78, learning_activity: 82, previous_marks: 75, quiz_score: 80, missed_assessments: 0 };
        } else if (i === 3) {
            metrics = { attendance_percent: 71, assignment_percent: 64, internal_marks: 59, learning_activity: 61, previous_marks: 64, quiz_score: 65, missed_assessments: 1 };
        } else {
            metrics = generateMetrics(isHighRisk);
        }

        await new Promise((res) => {
            db.run(`INSERT INTO student_metrics (student_id, attendance_percent, assignment_percent, internal_marks, learning_activity, previous_marks, quiz_score, missed_assessments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [student.id, metrics.attendance_percent, metrics.assignment_percent, metrics.internal_marks, metrics.learning_activity, metrics.previous_marks, metrics.quiz_score, metrics.missed_assessments],
                res);
        });

        studentsInfo.push({ student, metrics, isHighRisk });
        
        // ML Data Prep
        const features = [metrics.attendance_percent, metrics.assignment_percent, metrics.internal_marks, metrics.learning_activity, metrics.previous_marks, metrics.quiz_score, metrics.missed_assessments];
        mlData.push(features);
        
        // Assign actual labels for training based on heuristics (since we need to train the model to predict what we want)
        let label = 'LOW';
        if (isHighRisk || i === 1) label = 'HIGH';
        else if (i === 3 || (metrics.attendance_percent < 75 && metrics.internal_marks < 65)) label = 'MEDIUM';
        mlLabels.push(label);
    }

    // 5. Train Model
    trainModel(mlData, mlLabels);

    // 6. Predict and Save
    const predictions = predict(mlData);

    for (let i = 0; i < NUM_STUDENTS; i++) {
        const student = studentsInfo[i].student;
        const metrics = studentsInfo[i].metrics;
        const pred = predictions[i];

        await new Promise((res) => {
            db.run(`INSERT INTO risk_predictions (student_id, risk_level, risk_probability, model_version) VALUES (?, ?, ?, ?)`,
                [student.id, pred.risk_level, pred.risk_probability, 'Risk Model v1.0'],
                function(err) {
                    const predictionId = this.lastID;
                    // 7. Save Risk Factors
                    const factors = explainPrediction(metrics, pred.risk_level);
                    let factorPromises = factors.map(f => {
                        return new Promise(fRes => {
                            db.run(`INSERT INTO risk_factors (prediction_id, feature_name, feature_value, impact_value, impact_direction) VALUES (?, ?, ?, ?, ?)`,
                                [predictionId, f.feature_name, f.feature_value, f.impact_value, f.impact_direction],
                                fRes);
                        });
                    });
                    Promise.all(factorPromises).then(res);
                });
        });

        // 8. Generate History for a subset of students
        if (i < 20) {
            // Generate some past weeks
            const weeks = 5;
            let currentRiskScore = pred.risk_probability;
            let currentLevel = pred.risk_level;
            
            for (let w = weeks; w >= 0; w--) {
                const date = new Date();
                date.setDate(date.getDate() - (w * 7));
                
                // Add some jitter to past scores
                const jitter = (Math.random() * 0.1) - 0.05;
                let pastScore = Math.min(1, Math.max(0, currentRiskScore + jitter + (w * 0.05))); // Trends slightly down over time usually, or up. Let's just make it vary.
                
                let pastLevel = 'LOW';
                if (pastScore > 0.7) pastLevel = 'HIGH';
                else if (pastScore > 0.4) pastLevel = 'MEDIUM';

                if(w===0) {
                    pastScore = currentRiskScore;
                    pastLevel = currentLevel;
                }

                await new Promise(res => {
                    db.run(`INSERT INTO risk_history (student_id, risk_level, risk_score, recorded_date) VALUES (?, ?, ?, ?)`,
                        [student.id, pastLevel, pastScore, date.toISOString()],
                        res);
                });
            }

            // Also add some mock interventions
            if (currentLevel === 'HIGH' || currentLevel === 'MEDIUM') {
                const iDate1 = new Date();
                iDate1.setDate(iDate1.getDate() - 14);
                
                await new Promise(res => {
                    db.run(`INSERT INTO student_interventions (student_id, intervention_id, mentor_id, assigned_date, status, mentor_feedback, completed_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [student.id, 1, 1, iDate1.toISOString(), 'Completed', 'Student attended the session and discussed challenges.', new Date().toISOString()],
                        res);
                });
            }
        }
    }

    console.log('Seed completed successfully.');
};

runSeed().then(() => {
    // Need a small timeout to let sqlite finish all writes properly since we didn't perfectly await all inner loops safely
    setTimeout(() => {
        db.close();
        process.exit(0);
    }, 1000);
});
