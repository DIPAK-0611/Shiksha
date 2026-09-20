# ShikshaSetu

Student Success & Early Intervention Platform

ShikshaSetu helps teachers and mentors identify students who may need academic support early. It collects student academic and engagement data, predicts a risk level, explains why the prediction was made (Explainable AI), and recommends relevant interventions.

## Architecture

This project is built using:
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, Recharts, Lucide React
- **Backend**: Node.js, Express, SQLite3
- **Machine Learning**: `ml-random-forest` for Javascript ML pipeline
- **Explainability**: Custom heuristic SHAP simulator to provide plain-language feature contributions.

## Features

- **Risk Prediction Dashboard**: Overview of student population health.
- **Explainable AI (XAI)**: Understand exactly why a student was flagged as high risk.
- **Intervention Engine**: Rule-based recommendations tailored to the student's metrics.
- **Progress Tracking**: See historical risk trajectories.
- **Fairness & Responsible AI**: Monitor model bias across demographic groups.

## Setup Instructions

### 1. Environment Setup

Ensure you have Node.js (v18+) installed.

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

\`\`\`bash
cd backend
npm install
npm run seed  # Generates synthetic students, trains the ML model, and populates the SQLite database
npm run dev   # Starts the Express API server on http://localhost:5000
\`\`\`

Note: If \`npm run seed\` or \`npm run dev\` isn't set up, run:
\`\`\`bash
node scripts/seed.js
node server.js
\`\`\`

### 3. Frontend Setup

Open a second terminal and navigate to the frontend directory:

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

The application will be available at \`http://localhost:5173\`.

## Demo Credentials

- **Email**: \`mentor@shikshasetu.demo\`
- **Password**: \`password123\`

## Project Structure

- \`backend/\`
  - \`db/database.js\`: SQLite schema and connection
  - \`scripts/seed.js\`: Synthetic data generation and model training
  - \`ml/model.js\`: Random Forest training and prediction wrapper
  - \`ml/explain.js\`: Feature contribution logic (SHAP simulator)
  - \`interventions/engine.js\`: Rule-based recommendation engine
  - \`server.js\`: Express REST API routes
- \`frontend/\`
  - \`src/api/client.ts\`: API communication layer
  - \`src/pages/\`: React screens (Dashboard, Students, StudentProfile, etc.)
  - \`src/components/\`: Reusable UI elements (MetricBlock, RiskBadge, etc.)

## Assumptions & Limitations

- **Machine Learning**: Due to the environment constraints (no Python), the ML pipeline was implemented in JavaScript using \`ml-random-forest\`.
- **Explainability**: SHAP is native to Python. For this JS implementation, we simulate feature contributions using a heuristic rule-based analyzer that maps closely to the trained model's inputs.
- **Authentication**: Authentication is mocked for demo purposes (no real JWT).
- **Database**: SQLite is used for local demo portability. It can easily be swapped out for PostgreSQL by updating the query layer.
