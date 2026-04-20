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

# Load optimal threshold
try:
    with open(os.path.join(BASE_DIR, 'models', 'optimal_threshold.json'), 'r') as f:
        threshold_data = json.load(f)
        optimal_threshold = threshold_data.get('optimal_threshold', 0.5)
except:
    optimal_threshold = 0.5

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
    # Total charges cleaning
    data['TotalCharges'] = pd.to_numeric(data['TotalCharges'], errors='coerce')
    data['TotalCharges'] = data['TotalCharges'].fillna(data['TotalCharges'].median())

    # Feature 1: Total Services
    service_cols = ['PhoneService', 'MultipleLines', 'OnlineSecurity',
                   'OnlineBackup', 'DeviceProtection', 'TechSupport',
                   'StreamingTV', 'StreamingMovies']
    # Check which columns exist in input
    existing_cols = [c for c in service_cols if c in data.columns]
    data['TotalServices'] = (data[existing_cols] == 'Yes').sum(axis=1)

    # Feature 2: Tenure grouping
    data['TenureGroup'] = pd.cut(data['tenure'],
                                bins=[-1, 12, 24, 48, 60, 100],
                                labels=['0-1yr', '1-2yr', '2-4yr', '4-5yr', '5yr+'])

    # Feature 3: Charge density
    data['ChargeDensity'] = data['TotalCharges'] / (data['tenure'] + 1)

    # Feature 4: Contract length indicators
    data['ContractMonths'] = data['Contract'].map({
        'Month-to-month': 1,
        'One year': 12,
        'Two year': 24
    }).fillna(0).astype(int)
    data['IsMonthToMonth'] = (data['Contract'] == 'Month-to-month').astype(int)
    data['IsTwoYear'] = (data['Contract'] == 'Two year').astype(int)

    # Feature 5: Payment automation and service density
    data['AutoPay'] = data['PaymentMethod'].str.contains('automatic', case=False, na=False).astype(int)
    data['ServiceDensity'] = data['TotalServices'] / (data['tenure'] + 1)

    # Feature 6: Senior + partner interaction
    data['SeniorPartner'] = ((data['SeniorCitizen'] == 1) & (data['Partner'] == 'Yes')).astype(int)

    # ADVANCED FEATURES FOR HIGHER ACCURACY

    # Feature 7: Internet service quality score
    internet_quality = {
        'DSL': 1,
        'Fiber optic': 3,
        'No': 0
    }
    data['InternetQuality'] = data['InternetService'].map(internet_quality).fillna(0)

    # Feature 8: Security package (security + tech support)
    data['SecurityPackage'] = ((data['OnlineSecurity'] == 'Yes') &
                              (data['TechSupport'] == 'Yes')).astype(int)

    # Feature 9: Streaming package
    data['StreamingPackage'] = ((data['StreamingTV'] == 'Yes') &
                               (data['StreamingMovies'] == 'Yes')).astype(int)

    # Feature 10: Complete package (all services)
    data['CompletePackage'] = (data['TotalServices'] == 8).astype(int)

    # Feature 11: Charge per service
    data['ChargePerService'] = data['MonthlyCharges'] / (data['TotalServices'] + 1)

    # Feature 12: Tenure stability (long-term vs short-term)
    data['TenureStability'] = (data['tenure'] > 24).astype(int)

    # Feature 13: High spender indicator
    # For single predictions, use a reasonable threshold
    data['HighSpender'] = (data['MonthlyCharges'] > 100).astype(int)  # Using 100 as threshold

    # Feature 14: Billing efficiency
    data['BillingEfficiency'] = data['TotalCharges'] / (data['MonthlyCharges'] * data['tenure'] + 1)

    # Feature 15: Contract commitment score
    contract_scores = {
        'Month-to-month': 1,
        'One year': 3,
        'Two year': 5
    }
    data['ContractCommitment'] = data['Contract'].map(contract_scores).fillna(1)

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
    risk = "High" if prob >= optimal_threshold else "Medium" if prob >= optimal_threshold * 0.7 else "Low"
    
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

    # Calculate Feature Impact (Simple Perturbation)
    top_features = ['tenure', 'Contract', 'InternetService', 'MonthlyCharges', 'TotalServices']
    impacts = []
    
    # Base prob for comparisons
    base_prob = float(prob)
    
    for feat in top_features:
        # Create a "what if" scenario version of the input
        temp_input = input_df.copy()
        
        # Determine a "safe/ideal" value for the feature to see how much the current value hurt/helped
        if feat == 'tenure': temp_input[feat] = 72
        elif feat == 'Contract': temp_input[feat] = 2 # 'Two year'
        elif feat == 'InternetService': temp_input[feat] = 2 # 'No'
        elif feat == 'MonthlyCharges': temp_input[feat] = 20.0
        elif feat == 'TotalServices': temp_input[feat] = 8
        
        # Scale and predict
        if feat in le_dict:
            # We already have encoded values in input_df, so just use encoded defaults above
            pass
            
        temp_scaled = scaler.transform(temp_input)
        temp_prob = model.predict_proba(temp_scaled)[0][1]
        
        # Impact is how much the current value pushed probability up (positive) or down (negative)
        impact_score = base_prob - temp_prob
        impacts.append({
            "feature": feat,
            "impact": round(float(impact_score), 4),
            "current_value": str(getattr(customer, feat) if hasattr(customer, feat) else input_df[feat].iloc[0])
        })
    
    return {
        "churn_probability": round(float(prob), 4),
        "risk_level": risk,
        "strategies": strategies,
        "feature_impacts": impacts
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
