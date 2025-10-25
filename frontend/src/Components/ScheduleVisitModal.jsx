import React, { useState } from 'react';
import { FaCalendar, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ScheduleVisitModal({ isOpen, onClose, listing, owner }) {
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', 
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to schedule a visit');
        return;
      }

      const response = await fetch('http://localhost:3001/api/visit-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          ownerId: owner._id,
          ownerEmail: owner.email,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule visit');
      }

      setSuccess(true);
      toast.success('Visit request sent successfully!');
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setFormData({
          preferredDate: '',
          preferredTime: '',
          userName: '',
          userEmail: '',
          userPhone: '',
          message: '',
        });
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Schedule visit error:', error);
      toast.error(error.message || 'Failed to schedule visit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaCalendar className="text-white text-2xl" />
              <h2 className="text-2xl font-bold text-white">Schedule a Visit</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-blue-100 mt-2">{listing.name}</p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-12 text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h3>
            <p className="text-slate-600">The property owner will contact you soon.</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Preferred Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferredTime: slot }))}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      formData.preferredTime === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="userPhone"
                value={formData.userPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                placeholder="Any specific requirements or questions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                disabled={loading || !formData.preferredTime}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Request Visit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
