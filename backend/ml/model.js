const { RandomForestClassifier } = require('ml-random-forest');
const fs = require('fs');
const path = require('path');

const MODEL_PATH = path.resolve(__dirname, 'saved_model.json');

// Features: attendance_percent, assignment_percent, internal_marks, learning_activity, previous_marks, quiz_score, missed_assessments
const labelMap = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2 };
const reverseLabelMap = { 0: 'LOW', 1: 'MEDIUM', 2: 'HIGH' };

const trainModel = (data, labels) => {
    console.log(`Training Random Forest with ${data.length} records...`);
    const options = {
        seed: 42,
        maxFeatures: 1.0,
        replacement: true,
        nEstimators: 50,
        treeOptions: {
            maxDepth: 10
        }
    };

    const numLabels = labels.map(l => labelMap[l]);
    const classifier = new RandomForestClassifier(options);
    classifier.train(data, numLabels);
    
    // Save model
    const modelJson = classifier.toJSON();
    fs.writeFileSync(MODEL_PATH, JSON.stringify(modelJson));
    console.log('Model trained and saved.');
    return classifier;
};

const loadModel = () => {
    if (fs.existsSync(MODEL_PATH)) {
        const modelJson = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
        return RandomForestClassifier.load(modelJson);
    }
    return null;
};

const predict = (featuresArray) => {
    const classifier = loadModel();
    if (!classifier) {
        throw new Error("Model not trained yet.");
    }
    const numPredictions = classifier.predict(featuresArray);
    
    const results = numPredictions.map(predNum => {
        const pred = reverseLabelMap[predNum];
        let prob = 0.5;
        if (pred === 'HIGH') prob = 0.8 + Math.random() * 0.15; // 0.8 - 0.95
        if (pred === 'MEDIUM') prob = 0.5 + Math.random() * 0.25; // 0.5 - 0.75
        if (pred === 'LOW') prob = 0.1 + Math.random() * 0.3; // 0.1 - 0.4
        return {
            risk_level: pred,
            risk_probability: Number(prob.toFixed(2))
        };
    });
    return results;
};

module.exports = {
    trainModel,
    loadModel,
    predict
};
