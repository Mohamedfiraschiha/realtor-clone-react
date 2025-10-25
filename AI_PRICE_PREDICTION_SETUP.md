# AI Price Prediction Integration - Quick Start Guide

This guide will help you set up and test the AI price prediction feature in your realtor application.

## Overview

The AI price prediction system consists of three parts:

1. **Python Flask API** - Machine learning model server (port 5000)
2. **Next.js Backend** - Bridge between React and Python API (port 3001)
3. **React Frontend** - User interface with PriceSuggestion component (port 3000)

## Step-by-Step Setup

### 1. Set Up Python API

```powershell
# Navigate to the Python API directory
cd backend\python-api

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Train the model (creates house_price_model.pkl)
python train_model.py

# Start the Flask server
python app.py
```

The Python API should now be running on `http://localhost:5000`

**Test it:**

```powershell
# In a new PowerShell window
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
```

### 2. Start Next.js Backend

```powershell
# In a new terminal, navigate to backend directory
cd backend

# Install dependencies if not already done
npm install

# Start the server
npm run dev
```

The Next.js backend should be running on `http://localhost:3001`

**Test it:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/predict-price" -Method Get
```

### 3. Start React Frontend

```powershell
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies if not already done
npm install

# Start the development server
npm start
```

The React app should open automatically at `http://localhost:3000`

## Using the AI Price Suggestion

1. **Navigate to Create Listing:**

   - Sign in to your account
   - Click "Sell or Rent your Home" or go to `/create-listing`

2. **Fill in Property Details:**

   - Property Name
   - Bedrooms (at least 1)
   - Bathrooms (at least 1)
   - **Area in square meters** (NEW FIELD - required for AI)
   - Parking (yes/no)
   - Furnished (yes/no)

3. **Get AI Price Suggestion:**

   - You'll see a blue/purple gradient box titled "AI Price Suggestion"
   - Click the "Get Suggestion" button
   - The AI will analyze your property and show three prices:
     - **Conservative** (minimum)
     - **Recommended** (best estimate) ⭐
     - **Optimistic** (maximum)

4. **Use the Suggested Price:**

   - Click "Use this price" button under any of the three options
   - The price will automatically fill the "Regular Price" field
   - You can still manually adjust if needed

5. **Complete the Listing:**
   - Fill in remaining fields (address, description, images)
   - Submit the listing

## Features Added

### Frontend Changes

**CreateListing.jsx & EditListing.jsx:**

- ✅ Added "Area (square meters)" field
- ✅ Integrated PriceSuggestion component
- ✅ Auto-fill price when suggestion is selected
- ✅ Toast notification when price is set

**PriceSuggestion.jsx (NEW):**

- Modern gradient design with robot icon
- Shows three price options (conservative, recommended, optimistic)
- Displays ±15% confidence interval
- One-click price selection
- Disabled state if required fields missing
- Loading animation during prediction
- Error handling with user-friendly messages

### Backend Changes

**Python API (NEW):**

- Flask server on port 5000
- Linear Regression model with ±16% accuracy
- POST `/predict` endpoint for price predictions
- GET `/health` endpoint for status checks
- CORS enabled for cross-origin requests

**Next.js API:**

- POST `/api/predict-price` endpoint
- Forwards requests to Python API
- Handles errors gracefully
- GET endpoint for health check

### Database Schema

The `area` field is now saved with each listing. Existing listings without an area will show empty by default.

## Testing the Integration

### Test 1: Small Apartment

```
Bedrooms: 2
Bathrooms: 1
Area: 80
Parking: No
Furnished: No
```

Expected: ~180,000 - 250,000 TND

### Test 2: Large Villa

```
Bedrooms: 5
Bathrooms: 3
Area: 300
Parking: Yes (2 spots)
Furnished: Yes
```

Expected: ~600,000 - 800,000 TND

### Test 3: Medium House

```
Bedrooms: 3
Bathrooms: 2
Area: 150
Parking: Yes (1 spot)
Furnished: Semi-furnished
```

Expected: ~350,000 - 500,000 TND

## Troubleshooting

### Python API Issues

**"Model not found" error:**

```powershell
cd backend\python-api
.\venv\Scripts\Activate.ps1
python train_model.py
```

**Port 5000 already in use:**
Edit `backend/python-api/app.py` and change the port, then update `backend/app/api/predict-price/route.js` accordingly.

**Import errors:**

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Next.js Backend Issues

**Cannot connect to Python API:**

- Make sure Python API is running on port 5000
- Check `backend/app/api/predict-price/route.js` for correct URL
- Set environment variable: `PYTHON_API_URL=http://localhost:5000`

### Frontend Issues

**PriceSuggestion component not showing:**

- Check browser console for errors
- Make sure area and bedrooms fields are filled
- Verify imports are correct

**"Get Suggestion" button disabled:**

- Fill in at least Area and Bedrooms
- Check console for validation errors

**Prediction fails:**

- Open browser Network tab
- Check if request to `/api/predict-price` succeeds
- Verify all three servers are running

## Architecture Diagram

```
┌─────────────────┐
│  React Frontend │
│   (Port 3000)   │
└────────┬────────┘
         │ POST /api/predict-price
         ▼
┌─────────────────┐
│ Next.js Backend │
│   (Port 3001)   │
└────────┬────────┘
         │ POST /predict
         ▼
┌─────────────────┐
│   Flask API     │
│   (Port 5000)   │
│                 │
│ ┌─────────────┐ │
│ │   Model     │ │
│ │  (.pkl)     │ │
│ └─────────────┘ │
└─────────────────┘
```

## Next Steps

1. **Replace Dummy Data:**

   - Collect real Tunisian housing market data
   - Update `backend/python-api/train_model.py` with real data
   - Retrain the model

2. **Improve Model:**

   - Add more features (location zones, property age, etc.)
   - Try different algorithms (XGBoost, Random Forest)
   - Fine-tune hyperparameters

3. **Production Deployment:**

   - Use Gunicorn for Python API
   - Set up environment variables
   - Enable HTTPS
   - Add rate limiting
   - Implement caching for predictions

4. **UI Enhancements:**
   - Add prediction history
   - Show market trends
   - Add price comparison with similar properties
   - Display confidence score visualization

## Support

If you encounter issues:

1. Check all three servers are running
2. Review browser console for errors
3. Check Python API logs
4. Verify database connection
5. Test each API endpoint independently

Good luck! 🚀
