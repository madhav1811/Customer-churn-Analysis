import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib
import os

# Path setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'Telco-Customer-Churn.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Create model directory
os.makedirs(MODELS_DIR, exist_ok=True)

# Load Dataset
df = pd.read_csv(DATA_PATH)

# --- Preprocessing ---
# Clean TotalCharges: Convert to numeric and fill NaNs
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['TotalCharges'] = df['TotalCharges'].fillna(df['TotalCharges'].median())

# Target variable encoding
df['Churn'] = (df['Churn'] == 'Yes').astype(int)

# Drop redundant ID
df = df.drop('customerID', axis=1)

# Encode categorical variables
le_dict = {}
for col in df.select_dtypes('object').columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    le_dict[col] = le

# Split features and target
X = df.drop('Churn', axis=1)
y = df['Churn']

# Feature names for reference later
feature_names = X.columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Scale numeric features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# --- Training ---
print("Training GradientBoostingClassifier...")
model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
model.fit(X_train_scaled, y_train)

# --- Evaluation ---
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]
auc = roc_auc_score(y_test, y_prob)

print(f"Model AUC: {auc:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# --- Save Artifacts ---
joblib.dump(model, os.path.join(MODELS_DIR, 'churn_model.joblib'))
joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))
joblib.dump(le_dict, os.path.join(MODELS_DIR, 'le_dict.joblib'))
joblib.dump(feature_names, os.path.join(MODELS_DIR, 'feature_names.joblib'))

print("Model artifacts saved to backend/models/")
