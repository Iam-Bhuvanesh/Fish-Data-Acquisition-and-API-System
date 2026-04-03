import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
import joblib
import sys
import os

def train_models(csv_path, model_dir):
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    features = ['temperature', 'ph', 'dissolvedOxygen', 'ammonia']
    X = df[features]
    
    # 1. Train Status Classifier (High/Medium/Low)
    y_status = df['status_label']
    print("Training Random Forest Classifier for Health Status...")
    rf_clf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_clf.fit(X, y_status)
    
    # 2. Train Growth Regressor
    y_growth = df['growth_index']
    print("Training Linear Regression for Growth Index...")
    lr_reg = LinearRegression()
    lr_reg.fit(X, y_growth)
    
    # 3. Train Anomaly Detector (Isolation Forest)
    print("Training Isolation Forest for Anomaly Detection...")
    from sklearn.ensemble import IsolationForest
    iso_forest = IsolationForest(contamination=0.01, random_state=42)
    iso_forest.fit(X)
    
    # Ensure dir exists
    os.makedirs(model_dir, exist_ok=True)
    
    # Save models
    clf_path = os.path.join(model_dir, 'status_classifier.joblib')
    reg_path = os.path.join(model_dir, 'growth_regressor.joblib')
    iso_path = os.path.join(model_dir, 'anomaly_detector.joblib')
    
    joblib.dump(rf_clf, clf_path)
    joblib.dump(lr_reg, reg_path)
    joblib.dump(iso_forest, iso_path)
    
    print(f"Models saved to {model_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python train.py <processed_csv> <model_output_dir>")
        sys.exit(1)
        
    train_models(sys.argv[1], sys.argv[2])
