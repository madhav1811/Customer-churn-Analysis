from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .models import PredictionLog

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Churn Analysis API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML components
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'Telco-Customer-Churn.csv')

try:
    model = joblib.load(os.path.join(MODELS_DIR, 'churn_model.joblib'))
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.joblib'))
    le_dict = joblib.load(os.path.join(MODELS_DIR, 'le_dict.joblib'))
    feature_names = joblib.load(os.path.join(MODELS_DIR, 'feature_names.joblib'))
except Exception as e:
    print(f"Error loading models: {e}")
    # In a real app we might fail fast here
    model = None

# Pydantic models
class CustomerData(BaseModel):
    gender: str = "Male"
    SeniorCitizen: int = 0
    Partner: str = "No"
    Dependents: str = "No"
    tenure: int = 1
    PhoneService: str = "Yes"
    MultipleLines: str = "No"
    InternetService: str = "Fiber optic"
    OnlineSecurity: str = "No"
    OnlineBackup: str = "No"
    DeviceProtection: str = "No"
    TechSupport: str = "No"
    StreamingTV: str = "No"
    StreamingMovies: str = "No"
    Contract: str = "Month-to-month"
    PaperlessBilling: str = "Yes"
    PaymentMethod: str = "Electronic check"
    MonthlyCharges: float = 70.0
    TotalCharges: float = 70.0

def engineer_features(data):
    # Feature 1: Total Services
    service_cols = ['PhoneService', 'MultipleLines', 'OnlineSecurity', 
                   'OnlineBackup', 'DeviceProtection', 'TechSupport', 
                   'StreamingTV', 'StreamingMovies']
    # Check which columns exist in input
    existing_cols = [c for c in service_cols if c in data.columns]
    data['TotalServices'] = (data[existing_cols] == 'Yes').sum(axis=1)
    
    # Feature 2: Tenure grouping
    data['TenureGroup'] = pd.cut(data['tenure'], 
                                bins=[0, 12, 24, 48, 60, 100], 
                                labels=['0-1yr', '1-2yr', '2-4yr', '4-5yr', '5yr+'])
    
    # Feature 3: Charge density
    data['ChargeDensity'] = data['TotalCharges'] / (data['tenure'] + 1)
    
    return data

@app.get("/")
def read_root():
    return {"status": "online", "message": "Churn Analysis API is running"}

@app.post("/predict")
def predict(customer: CustomerData, db: Session = Depends(get_db)):
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    # Convert input to DataFrame
    input_df = pd.DataFrame([customer.dict()])
    
    # Preprocess
    # Feature Engineering
    input_df = engineer_features(input_df)

    # Encoding
    for col, le in le_dict.items():
        if col in input_df.columns:
            # Handle unknown labels by defaulting to 0 or similar
            try:
                input_df[col] = le.transform(input_df[col].astype(str))
            except:
                input_df[col] = 0
                
    # Reorder columns to match feature_names
    input_df = input_df[feature_names]
    
    # Scale
    X_scaled = scaler.transform(input_df)
    
    # Predict
    prob = model.predict_proba(X_scaled)[0][1]
    risk = "High" if prob > 0.5 else "Medium" if prob > 0.3 else "Low"
    
    # Strategies
    strategies = []
    if risk == "High":
        strategies = ["Offer 1-year contract with discount", "Provide premium support", "Dedicated account manager"]
    elif risk == "Medium":
        strategies = ["Incentivize auto-pay", "Offer relevant service add-ons"]
    else:
        strategies = ["Maintain service quality", "Standard loyalty rewards"]

    # Log to DB
    log_entry = PredictionLog(
        tenure=customer.tenure,
        monthly_charges=customer.MonthlyCharges,
        total_charges=customer.TotalCharges,
        contract=customer.Contract,
        churn_probability=float(prob),
        risk_level=risk
    )
    db.add(log_entry)
    db.commit()
    
    return {
        "churn_probability": round(float(prob), 4),
        "risk_level": risk,
        "strategies": strategies
    }

@app.get("/stats")
def get_stats():
    # Dynamic EDA from CSV
    df = pd.read_csv(DATA_PATH)
    df['Churn'] = (df['Churn'] == 'Yes').astype(int)
    
    # Calculate churn by segment
    segments = {
        "Contract": df.groupby('Contract')['Churn'].mean().to_dict(),
        "InternetService": df.groupby('InternetService')['Churn'].mean().to_dict(),
        "PaymentMethod": df.groupby('PaymentMethod')['Churn'].mean().to_dict(),
        "Gender": df.groupby('gender')['Churn'].mean().to_dict()
    }
    
    # Overall metrics
    metrics = {
        "avg_churn_rate": round(df['Churn'].mean(), 4),
        "total_customers": len(df),
        "fiber_churn_rate": round(df[df['InternetService'] == 'Fiber optic']['Churn'].mean(), 4)
    }
    
    return {
        "segments": segments,
        "metrics": metrics
    }

@app.get("/revenue-impact")
def revenue_impact():
    df = pd.read_csv(DATA_PATH)
    total_revenue_monthly = df[df['Churn'] == 'No']['MonthlyCharges'].sum()
    lost_revenue_monthly = df[df['Churn'] == 'Yes']['MonthlyCharges'].sum()
    
    return {
        "monthly_lost_revenue": round(float(lost_revenue_monthly), 2),
        "monthly_active_revenue": round(float(total_revenue_monthly), 2),
        "annual_projected_loss": round(float(lost_revenue_monthly * 12), 2)
    }
