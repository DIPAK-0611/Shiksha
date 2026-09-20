// Rule-based recommendation engine for suggesting interventions

const generateRecommendations = (metrics, riskPrediction) => {
    let recommendations = [];

    // Interventions:
    // 1. Mentor Meeting
    // 2. Remedial Session
    // 3. Weekly Progress Review
    // 4. Learning Resources
    // 5. Assignment Support
    // 6. Subject Practice
    // 7. Attendance Follow-up

    if (metrics.attendance_percent < 60) {
        recommendations.push({
            title: 'Attendance Follow-up',
            reason: 'Student attendance has dropped below 60%. Needs immediate check-in.',
            priority: 'High'
        });
    }

    if (metrics.internal_marks < 50 || metrics.quiz_score < 50) {
        recommendations.push({
            title: 'Remedial Session',
            reason: 'Additional support for areas with weak assessment performance.',
            priority: 'High'
        });
        recommendations.push({
            title: 'Subject Practice',
            reason: 'Assign additional practice sets to improve understanding.',
            priority: 'Medium'
        });
    }

    if (metrics.assignment_percent < 60) {
        recommendations.push({
            title: 'Assignment Support',
            reason: 'Student is missing multiple assignments.',
            priority: 'Medium'
        });
    }

    if (metrics.learning_activity < 50) {
        recommendations.push({
            title: 'Learning Resources',
            reason: 'Provide extra reading materials or video lectures to boost engagement.',
            priority: 'Low'
        });
    }

    if (riskPrediction === 'HIGH' || riskPrediction === 'MEDIUM') {
        recommendations.push({
            title: 'Mentor Meeting',
            reason: 'One-to-one academic check-in to discuss overall performance.',
            priority: 'High'
        });
        recommendations.push({
            title: 'Weekly Progress Review',
            reason: 'Monitor attendance, assignments and performance for the next two weeks.',
            priority: 'Medium'
        });
    }

    // Deduplicate and prioritize
    let unique = [];
    let titles = new Set();
    for (let r of recommendations) {
        if (!titles.has(r.title)) {
            titles.add(r.title);
            unique.push(r);
        }
    }

    // Sort by priority High > Medium > Low
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    unique.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    // Return top 3
    return unique.slice(0, 3);
};

module.exports = {
    generateRecommendations
};
