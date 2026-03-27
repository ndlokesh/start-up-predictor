import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import json

os.makedirs('data', exist_ok=True)
os.makedirs('ml', exist_ok=True)

def generate_startup_data(n_samples=15000):
    np.random.seed(42)
    
    industries = [
        'FinTech', 'SaaS', 'E-commerce', 'Healthcare', 'EdTech', 'AI/ML', 'CleanEnergy', 
        'Gaming', 'Web3', 'Food & Beverage', 'AgriTech', 'Logistics', 'Retail', 
        'Manufacturing', 'Automotive', 'PropTech', 'Travel & Tourism', 'Fashion', 
        'Entertainment', 'DeepTech', 'D2C Brands'
    ]
    
    locations = []
    with open('ml/states_districts.json', 'r', encoding='utf-8') as f:
        sd_data = json.load(f)
        for state_obj in sd_data['states']:
            for district in state_obj['districts']:
                locations.append(f"{state_obj['state']} - {district}")
    
    # In case there's no data fallback
    if len(locations) == 0:
         locations = ['Maharashtra - Mumbai', 'Karnataka - Bengaluru']
         
    data = {
        'id': range(n_samples),
        'industry': np.random.choice(industries, n_samples),
        'location': np.random.choice(locations, n_samples),
        'funding_rounds': np.random.randint(1, 6, n_samples),
        'total_funding_inr': 0,
        'team_size': np.random.randint(2, 60, n_samples),
        'competitor_density': np.random.randint(1, 25, n_samples),
        'founder_experience_years': np.random.randint(0, 25, n_samples),
        'has_patent': np.random.choice([0, 1], n_samples, p=[0.75, 0.25]),
        'success': 0
    }
    
    df = pd.DataFrame(data)
    
    df['total_funding_inr'] = df['funding_rounds'] * np.random.uniform(5000000, 80000000, n_samples)
    
    industry_weights = {
        'AI/ML': 1.5, 'FinTech': 1.3, 'SaaS': 1.2, 'DeepTech': 1.6, 'Healthcare': 1.1, 
        'E-commerce': 0.8, 'Food & Beverage': 0.7, 'AgriTech': 0.9, 'Logistics': 0.8, 
        'EdTech': 0.7, 'Gaming': 0.9, 'CleanEnergy': 1.1, 'Web3': 1.0, 'D2C Brands': 0.8
    }
    
    def calculate_success(row):
        score = 0
        score += np.log1p(row['total_funding_inr']) * 0.4
        score += industry_weights.get(row['industry'], 1.0) * 2.0
        score += row['founder_experience_years'] * 0.12
        score += row['has_patent'] * 0.6
        score -= row['competitor_density'] * 0.06
        
        prob = 1 / (1 + np.exp(-(score - 10))) 
        return 1 if np.random.random() < prob else 0

    df['success'] = df.apply(calculate_success, axis=1)
    
    df.to_csv('data/startup_data.csv', index=False)
    print(f"Dataset generated successfully with {len(locations)} unique Indian districts mapped!")
    return df

def train_model(df):
    X = df.drop(['id', 'success'], axis=1)
    y = df['success']
    
    le_industry = LabelEncoder()
    le_location = LabelEncoder()
    
    X['industry'] = le_industry.fit_transform(X['industry'])
    X['location'] = le_location.fit_transform(X['location'])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model Accuracy based on extensive regions: {score:.2f}")
    
    joblib.dump(model, 'ml/startup_model.pkl')
    joblib.dump(le_industry, 'ml/industry_encoder.pkl')
    joblib.dump(le_location, 'ml/location_encoder.pkl')
    print("Model and Encoders saved at ml/")

if __name__ == "__main__":
    df = generate_startup_data()
    train_model(df)
