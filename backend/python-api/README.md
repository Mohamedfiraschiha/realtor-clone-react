# House Price Prediction API Setup

This Python Flask API provides AI-powered house price predictions based on property features.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Navigate to the python-api directory:
```bash
cd backend/python-api
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install required packages:
```bash
pip install -r requirements.txt
```

## Training the Model

Before running the API, you need to train and save the model:

```bash
python train_model.py
```

This will create a `house_price_model.pkl` file that the API will use for predictions.

**Note**: The current training script uses dummy data for demonstration. In production, replace it with real Tunisian housing market data for accurate predictions.

## Running the API

Start the Flask server:

```bash
python app.py
```

The API will run on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Price Prediction
```
POST /predict
Content-Type: application/json
```

Request body:
```json
{
  "area": 150,
  "bedrooms": 3,
  "bathrooms": 2,
  "stories": 2,
  "mainroad": true,
  "guestroom": true,
  "basement": false,
  "hotwaterheating": true,
  "airconditioning": true,
  "parking": 2,
  "prefarea": false,
  "furnishingstatus": "furnished"
}
```

Response:
```json
{
  "predicted_price": 250000.50,
  "price_range": {
    "min": 212500.42,
    "max": 287500.58
  },
  "confidence": "good",
  "currency": "TND"
}
```

## Integration with Next.js Backend

The Next.js backend (port 3001) communicates with this Python API. Make sure both servers are running:

1. Python API: `http://localhost:5000`
2. Next.js Backend: `http://localhost:3001`

The Next.js API route at `/api/predict-price` forwards requests to the Python API.

## Model Features

The model uses these property features for prediction:
- Area (square meters)
- Number of bedrooms
- Number of bathrooms
- Number of stories
- Main road access (yes/no)
- Guest room (yes/no)
- Basement (yes/no)
- Hot water heating (yes/no)
- Air conditioning (yes/no)
- Parking spaces
- Preferred area (yes/no)
- Furnishing status (unfurnished/semi-furnished/furnished)

## Model Performance

- Algorithm: Linear Regression
- Expected accuracy: ±15-16% (based on original model MAPE)
- Confidence interval: ±15% of predicted price

## Troubleshooting

### Import errors
Make sure you've activated the virtual environment and installed all requirements.

### Model not found
Run `python train_model.py` to create the model file.

### Port already in use
Change the port in `app.py` by modifying the `PORT` environment variable or the default port.

### CORS errors
The API has CORS enabled for all origins. If you still face issues, check your browser console for details.

## Production Deployment

For production:
1. Replace dummy training data with real Tunisian market data
2. Use a production WSGI server like Gunicorn instead of Flask's development server
3. Set up proper environment variables
4. Enable HTTPS
5. Add authentication if needed
6. Consider containerizing with Docker

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
