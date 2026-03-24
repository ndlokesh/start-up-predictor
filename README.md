# Startup Success Predictor 🚀

A high-fidelity, data-driven dashboard that uses Machine Learning to predict the long-term viability of early-stage startups.

## 🌟 Key Features
- **Cyber-Corporate Dashboards**: A sleek, futuristic 3D UI designed with a clean white palette and neon blue/teal accents.
- **Predictive Engine**: An Ensemble Learning model (Random Forest) trained on historical startup performance data.
- **Success Probability Dial**: A real-time probability gauge with a glassmorphism design.
- **Global Funding Network**: Interactive 3D node-link visualization of venture funding ecosystems.

## 🛠️ Technology Stack
- **Frontend**: React, Three.js, @react-three/fiber, TailwindCSS, Framer Motion.
- **Backend (ML)**: Python, Scikit-Learn, Pandas, Joblib.
- **Interface**: FastAPI (REST API).

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- Python 3.10+
- Node.js 18+

### 2. Setup ML Pipeline
Run the data generation and model training script:
```bash
cd ml
pip install -r requirements.txt
python pipeline.py
```

### 3. Launch Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📈 Methodology
1. **Data Acquisition**: Synthesis of historical data including funding rounds, location, team size, and industry.
2. **Feature Engineering**: Label encoding categorical data and scaling numerical features.
3. **Training**: Random Forest Classifier selected for high-dimensional robustness and Feature Importance insights.
4. **Deployment**: Real-time inference via a FastAPI endpoint.
