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
