import sys
import json
import joblib
import pandas as pd
import os

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input data provided"}))
        sys.exit(1)
        
    try:
        input_data = json.loads(sys.argv[1])
        
        # Load models
        model_dir = os.path.dirname(os.path.abspath(__file__))
        clf_path = os.path.join(model_dir, 'status_classifier.joblib')
        reg_path = os.path.join(model_dir, 'growth_regressor.joblib')
        iso_path = os.path.join(model_dir, 'anomaly_detector.joblib')
        
        if not os.path.exists(clf_path) or not os.path.exists(reg_path) or not os.path.exists(iso_path):
             print(json.dumps({"error": "Models not found. Train them first."}))
             sys.exit(1)
             
        # Disable warnings for joblib/sklearn version mismatch if any
        import warnings
        warnings.filterwarnings('ignore')
        
        rf_clf = joblib.load(clf_path)
        lr_reg = joblib.load(reg_path)
        iso_forest = joblib.load(iso_path)
        
        # Create DataFrame from input
        features = ['temperature', 'ph', 'dissolvedOxygen', 'ammonia']
        row = {f: float(input_data.get(f, 0)) for f in features}
        df = pd.DataFrame([row])
        
        # Predict
        status_pred = rf_clf.predict(df)[0]
        growth_pred = lr_reg.predict(df)[0]
        anomaly_pred = iso_forest.predict(df)[0] # 1 for normal, -1 for anomaly
        
        result = {
            "ml_status": str(status_pred),
            "ml_growth_index": float(round(growth_pred, 1)),
            "ml_anomaly": "Unusual" if anomaly_pred == -1 else "Normal"
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
