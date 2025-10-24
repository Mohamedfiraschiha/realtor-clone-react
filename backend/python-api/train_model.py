"""
Train and save the house price prediction model
This script creates a dummy model since we don't have the Housing.csv file
In production, replace with actual training data
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OrdinalEncoder
import pickle

# Create sample training data for Tunisian market (prices in TND)
# This is dummy data - replace with real Tunisian housing data
np.random.seed(42)
n_samples = 500

data = {
    'area': np.random.randint(50, 500, n_samples),
    'bedrooms': np.random.randint(1, 6, n_samples),
    'bathrooms': np.random.randint(1, 4, n_samples),
    'stories': np.random.randint(1, 4, n_samples),
    'mainroad_yes': np.random.randint(0, 2, n_samples),
    'guestroom_yes': np.random.randint(0, 2, n_samples),
    'basement_yes': np.random.randint(0, 2, n_samples),
    'hotwaterheating_yes': np.random.randint(0, 2, n_samples),
    'airconditioning_yes': np.random.randint(0, 2, n_samples),
    'parking': np.random.randint(0, 4, n_samples),
    'prefarea_yes': np.random.randint(0, 2, n_samples),
    'furnishingstatus': np.random.randint(0, 3, n_samples),  # 0=unfurnished, 1=semi, 2=furnished
}

# Generate realistic prices based on features (Tunisian market)
# Base price + area effect + bedroom effect + other features
prices = (
    50000 +  # base price in TND
    data['area'] * 800 +  # 800 TND per sqm
    data['bedrooms'] * 30000 +  # 30k per bedroom
    data['bathrooms'] * 20000 +  # 20k per bathroom
    data['parking'] * 15000 +  # 15k per parking spot
    data['furnishingstatus'] * 25000 +  # 25k per furnishing level
    data['airconditioning_yes'] * 20000 +  # 20k for AC
    data['mainroad_yes'] * 30000 +  # 30k for main road
    data['basement_yes'] * 40000 +  # 40k for basement
    data['guestroom_yes'] * 25000 +  # 25k for guest room
    data['prefarea_yes'] * 50000 +  # 50k for preferred area
    np.random.normal(0, 30000, n_samples)  # random noise
)

df = pd.DataFrame(data)
df['price'] = prices

# Prepare features and target
X = df.drop(['price'], axis=1)
y = df['price']

# Train Linear Regression model (best performer from notebook)
model = LinearRegression()
model.fit(X, y)

# Save the model
with open('house_price_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model trained and saved successfully!")
print(f"Model R² score: {model.score(X, y):.4f}")
print(f"Feature names: {list(X.columns)}")
