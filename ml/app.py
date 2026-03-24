from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import json
import random
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Startup Success Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_ml_components():
    try:
        model = joblib.load('ml/startup_model.pkl')
        industry_encoder = joblib.load('ml/industry_encoder.pkl')
        location_encoder = joblib.load('ml/location_encoder.pkl')
        return model, industry_encoder, location_encoder
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None, None

model, industry_encoder, location_encoder = load_ml_components()

class StartupRequest(BaseModel):
    industry: str
    location: str
    funding_rounds: int
    total_funding_inr: float
    team_size: int
    competitor_density: int
    founder_experience_years: int
    has_patent: int

class ChatRequest(BaseModel):
    message: str

@app.post("/predict")
async def predict_success(request: StartupRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    try:
        try:
            industry_encoded = industry_encoder.transform([request.industry])[0]
        except:
            industry_encoded = 0
            
        try:
            location_encoded = location_encoder.transform([request.location])[0]
        except:
            location_encoded = 0
        
        features = [
            industry_encoded,
            location_encoded,
            request.funding_rounds,
            request.total_funding_inr,
            request.team_size,
            request.competitor_density,
            request.founder_experience_years,
            request.has_patent
        ]
        
        prob = model.predict_proba([features])[0][1]
        success_prob = float(prob * 100)
        
        if success_prob < 50:
            analysis = "High Risk of Closure."
            reason = []
            if request.funding_rounds < 2: reason.append("Insufficient funding rounds to sustain long-term growth.")
            if request.total_funding_inr < 10000000: reason.append("Low capital accumulation for the chosen sector (Below ₹1 Cr).")
            if request.team_size < 5: reason.append("Small team size may bottleneck market deployment.")
            if request.founder_experience_years < 3: reason.append("Limited executive experience increases execution risk.")
            if request.competitor_density > 15: reason.append("High competitor density indicates severe market saturation.")
            if not request.has_patent: reason.append("Lack of patents/IP severely reduces defensibility against incumbents.")
            if not reason: reason.append("Underlying financial markers and industry constraints restrict viability.")
            explanation = " ".join(reason)
            tips = ["Secure additional seed funding to reach ₹2Cr+ runway", "Expand core execution team with domain experts", "File for provisional patents to construct legal IP moats", "Pivot go-to-market strategy to avoid dense competitor segments"]
        else:
            analysis = "High Probability of Success."
            reason = []
            if request.funding_rounds >= 3: reason.append("Demonstrated consistent VC trust with multiple funding milestones.")
            if request.total_funding_inr >= 20000000: reason.append("Robust capital reserves (Above ₹2 Cr) fueling aggressive expansion.")
            if request.team_size >= 10: reason.append("Adequate team infrastructure to scale operations rapidly.")
            if request.founder_experience_years >= 5: reason.append("Deep founder experience instills investor confidence.")
            if request.competitor_density <= 10: reason.append("Operating in an accessible market space with high growth potential.")
            if request.has_patent: reason.append("Secured IP creates a powerful technological moat against rivals.")
            if not reason: reason.append("Your venture demonstrates exceptional alignment with standard unicorn frameworks.")
            explanation = " ".join(reason)
            tips = ["Accelerate market penetration via strategic corporate partnerships", "Reinvest capital into proprietary R&D to widen IP lead", "Begin preparing audited financials for future IPO planning", "Scale operations into adjacent tier-1 tech hubs"]

        benchmarks = {
            "SaaS": {"funding": 30000000, "team": 15, "exp": 6, "rounds": 2, "competitors": 8},
            "FinTech": {"funding": 80000000, "team": 25, "exp": 8, "rounds": 3, "competitors": 12},
            "E-commerce": {"funding": 100000000, "team": 40, "exp": 7, "rounds": 3, "competitors": 15},
            "AI/ML": {"funding": 50000000, "team": 12, "exp": 5, "rounds": 2, "competitors": 5},
            "DeepTech": {"funding": 120000000, "team": 20, "exp": 8, "rounds": 3, "competitors": 2},
            "Food & Beverage": {"funding": 15000000, "team": 30, "exp": 4, "rounds": 2, "competitors": 20},
            "AgriTech": {"funding": 20000000, "team": 18, "exp": 6, "rounds": 2, "competitors": 8},
            "Logistics": {"funding": 45000000, "team": 50, "exp": 7, "rounds": 2, "competitors": 12},
            "default": {"funding": 25000000, "team": 10, "exp": 5, "rounds": 2, "competitors": 10}
        }
        benchmark = benchmarks.get(request.industry, benchmarks["default"])

        importances = model.feature_importances_
        feature_names = ["Industry", "Location", "Rounds", "Funding(INR)", "Team Size", "Competitors", "Exp", "Patent"]
        feature_impacts = [{"subject": f, "A": importances[i] * 100, "fullMark": 100} for i, f in enumerate(feature_names)]

        return {
            "success_probability": success_prob,
            "status": "Success" if prob >= 0.5 else "Failure",
            "confidence": float(max(prob, 1-prob) * 100),
            "analysis": analysis,
            "explanation": explanation,
            "tips": tips,
            "benchmark": benchmark,
            "feature_impacts": feature_impacts
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/chat")
async def chat_interaction(request: ChatRequest):
    msg = request.message.lower()
    responses = [
        "Based on the ML indicators, scaling your team and securing IP is paramount.",
        "That's an interesting strategy! In the Indian market, reaching Series B heavily depends on MoM growth metrics.",
        "As an AI VC Consultant, I'd suggest focusing tightly on reducing competitor density by pivoting your niche.",
        "Your financial runway (Total Funding INR) determines survivability. A 24-month runway is the golden standard.",
        "Consider expanding your operations into Tier 2 cities in India like Pune or Indore to capture untapped markets efficiently.",
        "Securing a patent often multiplies a startup's valuation by 1.5x during investor due diligence."
    ]
    if "hello" in msg or "hi" in msg:
        reply = "Hello! I am your AI VC Consultant. How can I help you scale your startup in India?"
    elif "funding" in msg:
        reply = "Funding in Indian Rupees typically requires scaling beyond ₹5 Crores at the Series A level to be competitive. What specific funding advice do you need?"
    elif "fail" in msg or "success" in msg:
        reply = "Success depends heavily on balancing your Team Size, securing Patents, and acquiring multiple Funding Rounds. Have you checked your Scenario Simulator?"
    else:
        reply = random.choice(responses)
        
    return {"reply": reply}

@app.get("/metadata")
async def get_metadata():
    if industry_encoder is None or location_encoder is None:
         return {"industries": [], "states": {}}
    
    states_dict = {}
    try:
        with open('ml/states_districts.json', 'r', encoding='utf-8') as f:
            sd_data = json.load(f)
            for state_obj in sd_data.get('states', []):
                states_dict[state_obj['state']] = state_obj['districts']
    except Exception as e:
        states_dict = {"Maharashtra": ["Mumbai", "Pune"], "Karnataka": ["Bengaluru"]}

    return {
        "industries": list(industry_encoder.classes_),
        "states": states_dict
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
