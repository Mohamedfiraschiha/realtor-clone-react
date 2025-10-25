import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaTimes, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function MakeOfferModal({ isOpen, onClose, listing, owner }) {
  const [formData, setFormData] = useState({
    offerPrice: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen && listing) {
      // Fetch existing offers/negotiation history
      fetchNegotiationHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, listing]);

  const fetchNegotiationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/offers?listingId=${listing._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.offers && data.offers.length > 0) {
          // Get the most recent offer's history
          setNegotiationHistory(data.offers[0].negotiationHistory || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch negotiation history:', error);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const calculateDifference = () => {
    const offer = parseFloat(formData.offerPrice) || 0;
    const asking = listing.regularPrice;
    const diff = asking - offer;
    const percent = ((diff / asking) * 100).toFixed(1);
    return { diff, percent };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to make an offer');
        return;
      }

      const response = await fetch('http://localhost:3001/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          listingPrice: listing.regularPrice,
          ownerId: owner._id,
          ownerEmail: owner.email,
          offerPrice: parseFloat(formData.offerPrice),
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit offer');
      }

      setSuccess(true);
      toast.success('Offer submitted successfully!');
      
      setTimeout(() => {
        setFormData({
          offerPrice: '',
          buyerName: '',
          buyerEmail: '',
          buyerPhone: '',
          message: '',
        });
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Make offer error:', error);
      toast.error(error.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const { diff, percent } = calculateDifference();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaMoneyBillWave className="text-white text-2xl" />
              <h2 className="text-2xl font-bold text-white">Make an Offer</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-green-100 mt-2">{listing.name}</p>
          <p className="text-white font-bold text-xl mt-1">
            Asking Price: {listing.regularPrice.toLocaleString()} TND
          </p>
        </div>

        {/* Negotiation History Toggle */}
        {negotiationHistory.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-b">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <FaHistory />
              {showHistory ? 'Hide' : 'View'} Negotiation History ({negotiationHistory.length})
            </button>
          </div>
        )}

        {/* Negotiation History */}
        {showHistory && negotiationHistory.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="space-y-3">
              {negotiationHistory.map((entry, index) => (
                <div key={index} className={`p-3 rounded-lg ${entry.by === 'buyer' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {entry.by === 'buyer' ? '👤 You' : '🏠 Owner'} - {entry.price.toLocaleString()} TND
                      </p>
                      {entry.message && <p className="text-sm text-slate-600 mt-1">{entry.message}</p>}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="p-12 text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Offer Submitted!</h3>
            <p className="text-slate-600">The property owner will review your offer soon.</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Offer Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Your Offer (TND)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  TND
                </span>
                <input
                  type="number"
                  name="offerPrice"
                  value={formData.offerPrice}
                  onChange={handleChange}
                  min="1"
                  required
                  placeholder={`e.g., ${(listing.regularPrice * 0.9).toFixed(0)}`}
                  className="w-full pl-16 pr-4 py-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {formData.offerPrice && (
                <div className={`mt-2 text-sm ${diff > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {diff > 0 ? (
                    <p>💡 Your offer is {diff.toLocaleString()} TND ({percent}%) below asking price</p>
                  ) : (
                    <p>✨ Your offer matches or exceeds the asking price!</p>
                  )}
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="buyerEmail"
                  value={formData.buyerEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Message to Owner
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                placeholder="Explain why you're interested, your timeline, financing status, etc..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Offer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
