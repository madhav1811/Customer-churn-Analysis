import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import joblib
import os

# Path setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'Telco-Customer-Churn.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

os.makedirs(MODELS_DIR, exist_ok=True)

# Load Dataset
df = pd.read_csv(DATA_PATH)

# --- Feature Engineering ---
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

    return data

df = engineer_features(df)

# --- Preprocessing ---
df['Churn'] = (df['Churn'] == 'Yes').astype(int)
df = df.drop('customerID', axis=1)

# Encode categorical variables
le_dict = {}
for col in df.select_dtypes(['object', 'category']).columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    le_dict[col] = le

# Split features and target
X = df.drop('Churn', axis=1)
y = df['Churn']
feature_names = X.columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# --- SMOTE (Handle Imbalance) ---
print("Applying SMOTE to balance classes...")
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_res)
X_test_scaled = scaler.transform(X_test)

# --- Hyperparameter Tuning ---
print("Tuning XGBoost Model (RandomizedSearchCV)...")
param_grid = {
    'n_estimators': [100, 200, 300, 400],
    'learning_rate': [0.01, 0.03, 0.05, 0.1, 0.2],
    'max_depth': [3, 4, 5, 6, 7],
    'subsample': [0.6, 0.7, 0.8, 0.9, 1.0],
    'colsample_bytree': [0.6, 0.7, 0.8, 0.9, 1.0],
    'gamma': [0, 1, 2, 4],
    'min_child_weight': [1, 3, 5],
    'reg_alpha': [0, 0.5, 1],
    'reg_lambda': [1, 2, 4]
}

xgb = XGBClassifier(random_state=42, eval_metric='auc', n_jobs=-1)
search = RandomizedSearchCV(
    xgb,
    param_grid,
    n_iter=25,
    cv=3,
    scoring='roc_auc',
    n_jobs=-1,
    random_state=42,
    verbose=1
)
search.fit(X_train_scaled, y_train_res)

model = search.best_estimator_
print(f"Best Parameters: {search.best_params_}")

# --- Evaluation ---
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]
auc = roc_auc_score(y_test, y_prob)

print(f"\nImproved Model AUC: {auc:.4f}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# --- Save Artifacts ---
joblib.dump(model, os.path.join(MODELS_DIR, 'churn_model.joblib'))
joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))
joblib.dump(le_dict, os.path.join(MODELS_DIR, 'le_dict.joblib'))
joblib.dump(feature_names, os.path.join(MODELS_DIR, 'feature_names.joblib'))

print("Optimized model artifacts saved to backend/models/")
