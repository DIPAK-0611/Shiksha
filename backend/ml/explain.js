// This module simulates SHAP feature contributions since SHAP is Python-native.
// We use simple heuristic rules to determine feature contribution directions and magnitudes.

const featureNames = [
    'attendance_percent',
    'assignment_percent',
    'internal_marks',
    'learning_activity',
    'previous_marks',
    'quiz_score',
    'missed_assessments'
];

const featureLabels = {
    'attendance_percent': 'Attendance',
    'assignment_percent': 'Assignment Completion',
    'internal_marks': 'Internal Marks',
    'learning_activity': 'Learning Activity',
    'previous_marks': 'Previous Performance',
    'quiz_score': 'Quiz Score',
    'missed_assessments': 'Missed Assessments'
};

const explainPrediction = (metrics, risk_level) => {
    let factors = [];
    
    const addFactor = (name, value, impact, direction) => {
        factors.push({
            feature_name: featureLabels[name],
            feature_value: value,
            impact_value: Math.abs(impact),
            impact_direction: direction // 'increases risk' or 'decreases risk'
        });
    };

    // Simple heuristic SHAP simulator
    if (metrics.attendance_percent < 60) {
        addFactor('attendance_percent', metrics.attendance_percent, 0.25, 'increases risk');
    } else if (metrics.attendance_percent > 80) {
        addFactor('attendance_percent', metrics.attendance_percent, 0.15, 'decreases risk');
    }

    if (metrics.assignment_percent < 50) {
        addFactor('assignment_percent', metrics.assignment_percent, 0.2, 'increases risk');
    } else if (metrics.assignment_percent > 75) {
        addFactor('assignment_percent', metrics.assignment_percent, 0.1, 'decreases risk');
    }

    if (metrics.missed_assessments > 2) {
        addFactor('missed_assessments', metrics.missed_assessments, 0.3, 'increases risk');
    } else if (metrics.missed_assessments === 0) {
        addFactor('missed_assessments', metrics.missed_assessments, 0.1, 'decreases risk');
    }

    if (metrics.previous_marks < 50) {
        addFactor('previous_marks', metrics.previous_marks, 0.15, 'increases risk');
    }

    if (metrics.learning_activity < 40) {
        addFactor('learning_activity', metrics.learning_activity, 0.1, 'increases risk');
    }

    // Sort by impact value
    factors.sort((a, b) => b.impact_value - a.impact_value);

    // Keep top 4 factors
    return factors.slice(0, 4);
};

module.exports = {
    explainPrediction
};
