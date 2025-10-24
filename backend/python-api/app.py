"""
Flask API for house price prediction
Provides endpoints to predict house prices based on property features
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = 'house_price_model.pkl'

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully!")
except FileNotFoundError:
    print("Model file not found. Please run train_model.py first.")
    model = None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict house price based on features
    
    Expected JSON input:
    {
        "area": float,
        "bedrooms": int,
        "bathrooms": int,
        "stories": int,
        "mainroad": bool,
        "guestroom": bool,
        "basement": bool,
        "hotwaterheating": bool,
        "airconditioning": bool,
        "parking": int,
        "prefarea": bool,
        "furnishingstatus": str ("unfurnished", "semi-furnished", "furnished")
    }
    
    Returns:
    {
        "predicted_price": float (in TND),
        "price_range": {
            "min": float,
            "max": float
        },
        "confidence": str
    }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        
        # Extract and validate features
        area = float(data.get('area', 100))
        bedrooms = int(data.get('bedrooms', 2))
        bathrooms = int(data.get('bathrooms', 1))
        stories = int(data.get('stories', 1))
        parking = int(data.get('parking', 0))
        
        # Convert boolean features
        mainroad = 1 if data.get('mainroad', False) else 0
        guestroom = 1 if data.get('guestroom', False) else 0
        basement = 1 if data.get('basement', False) else 0
        hotwaterheating = 1 if data.get('hotwaterheating', False) else 0
        airconditioning = 1 if data.get('airconditioning', False) else 0
        prefarea = 1 if data.get('prefarea', False) else 0
        
        # Convert furnishing status
        furnishing = data.get('furnishingstatus', 'unfurnished').lower()
        furnishing_map = {
            'unfurnished': 0,
            'semi-furnished': 1,
            'furnished': 2
        }
        furnishingstatus = furnishing_map.get(furnishing, 0)
        
        # Create feature array in the same order as training
        # Order: area, bedrooms, bathrooms, stories, mainroad_yes, guestroom_yes, 
        #        basement_yes, hotwaterheating_yes, airconditioning_yes, parking, 
        #        prefarea_yes, furnishingstatus
        features = np.array([[
            area,
            bedrooms,
            bathrooms,
            stories,
            mainroad,
            guestroom,
            basement,
            hotwaterheating,
            airconditioning,
            parking,
            prefarea,
            furnishingstatus
        ]])
        
        # Make prediction
        predicted_price = float(model.predict(features)[0])
        
        # Calculate confidence interval (±15% based on MAPE of 16.04%)
        margin = predicted_price * 0.15
        price_min = max(0, predicted_price - margin)
        price_max = predicted_price + margin
        
        return jsonify({
            'predicted_price': round(predicted_price, 2),
            'price_range': {
                'min': round(price_min, 2),
                'max': round(price_max, 2)
            },
            'confidence': 'good',
            'currency': 'TND'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
