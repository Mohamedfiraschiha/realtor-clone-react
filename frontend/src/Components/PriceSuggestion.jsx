import React, { useState } from 'react';
import { FaRobot, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function PriceSuggestion({ formData, onPriceSelect }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const getPriceSuggestion = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Prepare data for prediction
      const requestData = {
        area: parseFloat(formData.area) || 100,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        stories: 1, // Default - you can add this to your form if needed
        mainroad: true, // Default - can be added to form
        guestroom: formData.bedrooms >= 3, // Heuristic: 3+ bedrooms likely has guest room
        basement: false, // Default - can be added to form
        hotwaterheating: true, // Default for modern homes
        airconditioning: true, // Default for modern homes
        parking: parseInt(formData.parking) || 0,
        prefarea: false, // Default - can be added to form
        furnishingstatus: formData.furnished ? 'furnished' : 'unfurnished'
      };

      const response = await fetch('http://localhost:3001/api/predict-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get price prediction');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error('Price prediction error:', err);
      setError('Unable to get price suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestedPrice = () => {
    if (prediction && onPriceSelect) {
      onPriceSelect(Math.round(prediction.predicted_price));
    }
  };

  const handleUseMinPrice = () => {
    if (prediction && onPriceSelect) {
      onPriceSelect(Math.round(prediction.price_range.min));
    }
  };

  const handleUseMaxPrice = () => {
    if (prediction && onPriceSelect) {
      onPriceSelect(Math.round(prediction.price_range.max));
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaRobot className="text-3xl text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              AI Price Suggestion
            </h3>
            <p className="text-sm text-slate-600">
              Get an estimated price based on your property features
            </p>
          </div>
        </div>
        
        <button
          onClick={getPriceSuggestion}
          disabled={loading || !formData.area || !formData.bedrooms}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FaRobot />
              Get Suggestion
            </>
          )}
        </button>
      </div>

      {!formData.area || !formData.bedrooms ? (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2">
          <FaExclamationCircle />
          Please fill in at least the area and number of bedrooms to get a price suggestion
        </div>
      ) : null}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <FaExclamationCircle />
          {error}
        </div>
      )}

      {prediction && (
        <div className="mt-4 space-y-4">
          <div className="bg-white rounded-lg p-5 border-2 border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-3">
              <FaCheckCircle className="text-xl" />
              <span className="font-semibold">Prediction Complete</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Minimum Price */}
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-slate-600 mb-1">Conservative</div>
                <div className="text-2xl font-bold text-blue-700">
                  {prediction.price_range.min.toLocaleString()} TND
                </div>
                <button
                  onClick={handleUseMinPrice}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Use this price
                </button>
              </div>

              {/* Predicted Price */}
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-400">
                <div className="text-sm text-slate-600 mb-1">Recommended</div>
                <div className="text-3xl font-bold text-green-700">
                  {Math.round(prediction.predicted_price).toLocaleString()} TND
                </div>
                <button
                  onClick={handleUseSuggestedPrice}
                  className="mt-2 px-4 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors font-semibold"
                >
                  Use this price
                </button>
              </div>

              {/* Maximum Price */}
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-slate-600 mb-1">Optimistic</div>
                <div className="text-2xl font-bold text-purple-700">
                  {prediction.price_range.max.toLocaleString()} TND
                </div>
                <button
                  onClick={handleUseMaxPrice}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  Use this price
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500 text-center">
              <p>AI prediction based on area, bedrooms, bathrooms, parking, and furnishing status</p>
              <p className="mt-1">Accuracy: ±15% • This is an estimate and may vary based on location and market conditions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
