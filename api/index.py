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
        # Look for files in 'api/' directory for Vercel deployment
        model = joblib.load('api/startup_model.pkl')
        industry_encoder = joblib.load('api/industry_encoder.pkl')
        location_encoder = joblib.load('api/location_encoder.pkl')
        return model, industry_encoder, location_encoder
    except Exception as e:
        # Fallback for local dev
        try:
            model = joblib.load('ml/startup_model.pkl')
            industry_encoder = joblib.load('ml/industry_encoder.pkl')
            location_encoder = joblib.load('ml/location_encoder.pkl')
            return model, industry_encoder, location_encoder
        except:
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
            advantages = [
                "Niche market positioning allows for specialized focus",
                "Low burn rate enables longer survival period",
                "Direct founder-customer engagement",
                "Agile decision making with small team",
                "Targeted marketing potential in specific districts"
            ]
            disadvantages = [
                "Insufficient funding rounds to sustain long-term growth",
                "Low capital accumulation for the sector (Below ₹1 Cr)",
                "Small team size may bottleneck market deployment",
                "Limited executive experience increases execution risk",
                "High competitor density in the chosen market segment"
            ]
            explanation = "Your venture shows high potential but faces significant structural hurdles in funding and team scaling."
            tips = ["Secure additional seed funding to reach ₹2Cr+ runway", "Expand core execution team with domain experts", "File for provisional patents to construct legal IP moats", "Pivot go-to-market strategy to avoid dense competitor segments"]
        else:
            analysis = "High Probability of Success."
            advantages = [
                "Demonstrated consistent VC trust with multiple funding milestones",
                "Robust capital reserves fueling aggressive expansion",
                "Adequate team infrastructure to scale operations rapidly",
                "Deep founder experience instills investor confidence",
                "Secured IP creates a powerful technological moat against rivals"
            ]
            disadvantages = [
                "High burn rate during scale-up requires constant monitoring",
                "Increased operational complexity across multiple regions",
                "Competitive talent acquisition costs in tier-1 cities",
                "Strict regulatory compliance requirements for mature entities",
                "Dilution of original culture during rapid team growth"
            ]
            explanation = "Your venture demonstrates exceptional alignment with standard unicorn frameworks and strong execution signals."
            tips = ["Accelerate market penetration via strategic corporate partnerships", "Reinvest capital into proprietary R&D to widen IP lead", "Begin preparing audited financials for future IPO planning", "Scale operations into adjacent tier-1 tech hubs"]

        importances = model.feature_importances_
        feature_names = ["Industry", "Location", "Rounds", "Funding(INR)", "Team Size", "Competitors", "Exp", "Patent"]
        feature_impacts = [{"subject": f, "A": importances[i] * 100, "fullMark": 100} for i, f in enumerate(feature_names)]

        return {
            "success_probability": success_prob,
            "status": "Success" if prob >= 0.5 else "Failure",
            "confidence": float(max(prob, 1-prob) * 100),
            "analysis": analysis,
            "explanation": explanation,
            "advantages": advantages,
            "disadvantages": disadvantages,
            "tips": tips,
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
    json_path = 'api/states_districts.json'
    if not os.path.exists(json_path):
        json_path = 'ml/states_districts.json'

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
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
