import joblib
import pandas as pd
import os

# Paths to the saved model artifacts
MODELS_DIR = os.path.join('backend', 'models')

print("Loading model artifacts...")
model = joblib.load(os.path.join(MODELS_DIR, 'churn_model.joblib'))
scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.joblib'))
le_dict = joblib.load(os.path.join(MODELS_DIR, 'le_dict.joblib'))
feature_names = joblib.load(os.path.join(MODELS_DIR, 'feature_names.joblib'))

# Sample customer data to test
sample_customer = {
    'gender': 'Female',
    'SeniorCitizen': 0,
    'Partner': 'Yes',
    'Dependents': 'No',
    'tenure': 72,
    'PhoneService': 'Yes',
    'MultipleLines': 'Yes',
    'InternetService': 'Fiber optic',
    'OnlineSecurity': 'Yes',
    'OnlineBackup': 'Yes',
    'DeviceProtection': 'Yes',
    'TechSupport': 'Yes',
    'StreamingTV': 'Yes',
    'StreamingMovies': 'Yes',
    'Contract': 'Two year',
    'PaperlessBilling': 'Yes',
    'PaymentMethod': 'Bank transfer (automatic)',
    'MonthlyCharges': 115.5,
    'TotalCharges': 8200.5
}

# 1. Convert to DataFrame
df = pd.DataFrame([sample_customer])

# 2. Feature Engineering (same as training)
def engineer_features(data):
    # Total charges cleaning
    data['TotalCharges'] = pd.to_numeric(data['TotalCharges'], errors='coerce')
    data['TotalCharges'] = data['TotalCharges'].fillna(data['TotalCharges'].median())

    # Feature 1: Total Services count
    service_cols = ['PhoneService', 'MultipleLines', 'OnlineSecurity', 
                   'OnlineBackup', 'DeviceProtection', 'TechSupport', 
                   'StreamingTV', 'StreamingMovies']
    data['TotalServices'] = (data[service_cols] == 'Yes').sum(axis=1)

    # Feature 2: Tenure grouping
    data['TenureGroup'] = pd.cut(data['tenure'], 
                                bins=[-1, 12, 24, 48, 60, 100], 
                                labels=['0-1yr', '1-2yr', '2-4yr', '4-5yr', '5yr+'])

    # Feature 3: Charge density (charges per month)
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
    data['HighSpender'] = (data['MonthlyCharges'] > data['MonthlyCharges'].quantile(0.75)).astype(int)

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

df = engineer_features(df)

# 2. Preprocess (Label Encoding)
for col, le in le_dict.items():
    if col in df.columns:
        df[col] = le.transform(df[col].astype(str))

# 3. Reorder features to match training data
df = df[feature_names]

# 4. Scale
X_scaled = scaler.transform(df)

# 5. Predict
prob = model.predict_proba(X_scaled)[0][1]
risk = "High" if prob > 0.5 else "Medium" if prob > 0.3 else "Low"

print("\n--- Model Prediction Result ---")
print(f"Customer Churn Probability: {prob:.2%}")
print(f"Risk Level: {risk.upper()}")
print("--------------------------------")
