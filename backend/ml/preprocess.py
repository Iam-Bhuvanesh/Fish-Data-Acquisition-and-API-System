import pandas as pd
import numpy as np
import os
import sys

def load_and_preprocess(filepath):
    # Load data
    df = pd.read_csv(filepath)
    
    # Rename columns flexibly based on common headers
    col_mapping = {
        'Temperature': 'temperature', 'TEMP': 'temperature', 'TEMP (C)': 'temperature',
        'PH': 'ph', 'ph': 'ph',
        'Dissolved Oxygen': 'dissolvedOxygen', 'DO': 'dissolvedOxygen', 'DO (mg/l)': 'dissolvedOxygen',
        'Turbidity': 'turbidity', 'TURBIDITY': 'turbidity',
        'Nitrate': 'nitrate', 'NITRATE': 'nitrate', 'NITRATE(PPM)': 'nitrate',
        'Ammonia': 'ammonia', 'AMMONIA': 'ammonia', 'AMMONIA(mg/l)': 'ammonia',
        'Manganese': 'manganese', 'MANGANESE': 'manganese', 'MANGANESE(mg/l)': 'manganese'
    }
    
    df = df.rename(columns=col_mapping)
    
    # Keep only necessary columns if they exist
    required_cols = ['temperature', 'ph', 'dissolvedOxygen', 'ammonia']
    for col in required_cols:
        if col not in df.columns:
            # fill with some default if missing, or drop
            df[col] = 0.0

    # Ensure types
    df = df[required_cols].astype(float)

    # 1. Status Label (Disease Risk)
    status_list = []
    for _, row in df.iterrows():
        riskScore = 0
        if row['dissolvedOxygen'] < 4: riskScore += 40
        if row['ammonia'] > 0.05: riskScore += 30
        if row['ph'] < 6.5 or row['ph'] > 8.5: riskScore += 15
        if row['temperature'] > 30: riskScore += 15
        
        if riskScore > 60:
            status_list.append("High")
        elif riskScore > 30:
            status_list.append("Medium")
        else:
            status_list.append("Low")
            
    df['status_label'] = status_list
    
    # 2. Growth Index (Regression Target)
    growth_list = []
    for _, row in df.iterrows():
        growthIndex = 100
        if 24 <= row['temperature'] <= 28:
            growthIndex *= 1.1
        else:
            growthIndex *= 0.9
            
        if row['dissolvedOxygen'] >= 5.5:
            growthIndex *= 1.05
        else:
            growthIndex *= 0.8
            
        growth_list.append(growthIndex)
        
    df['growth_index'] = growth_list
    
    return df

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python preprocess.py <input_csv> <output_csv>")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    df = load_and_preprocess(input_file)
    df.to_csv(output_file, index=False)
    print(f"Preprocessed {len(df)} rows and saved to {output_file}")
