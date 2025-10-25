import React, { useState } from 'react';
import { FaFileAlt, FaTimes, FaCheckCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function RentalApplicationModal({ isOpen, onClose, listing, owner }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      currentAddress: '',
      moveInDate: '',
    },
    // Employment Info
    employmentInfo: {
      employmentStatus: 'employed',
      employer: '',
      position: '',
      monthlyIncome: '',
      employmentDuration: '',
    },
    // References
    references: [
      { name: '', relationship: '', phone: '', email: '' },
      { name: '', relationship: '', phone: '', email: '' },
    ],
    // Additional
    numberOfOccupants: 1,
    hasPets: false,
    petDetails: '',
    additionalNotes: '',
    creditCheckConsent: false,
    backgroundCheckConsent: false,
  });

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleReferenceChange = (index, field, value) => {
    const newReferences = [...formData.references];
    newReferences[index][field] = value;
    setFormData(prev => ({ ...prev, references: newReferences }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to submit application');
        return;
      }

      const response = await fetch('http://localhost:3001/api/rental-applications', {
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
        throw new Error('Failed to submit application');
      }

      setSuccess(true);
      toast.success('Application submitted successfully!');
      
      setTimeout(() => {
        setStep(1);
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Submit application error:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-white text-2xl" />
              <h2 className="text-2xl font-bold text-white">Rental Application</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-indigo-100 mt-2">{listing.name}</p>
        </div>

        {/* Progress Bar */}
        {!success && (
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex justify-between mb-2">
              {['Personal', 'Employment', 'References', 'Consent'].map((label, index) => (
                <div
                  key={label}
                  className={`flex-1 text-center text-sm font-semibold ${
                    step > index + 1 ? 'text-green-600' : step === index + 1 ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="p-12 text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
            <p className="text-slate-600">The property owner will review your application soon.</p>
          </div>
        ) : (
          /* Form Steps */
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.personalInfo.fullName}
                    onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Address</label>
                  <textarea
                    value={formData.personalInfo.currentAddress}
                    onChange={(e) => handleChange('personalInfo', 'currentAddress', e.target.value)}
                    required
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Desired Move-in Date</label>
                  <input
                    type="date"
                    value={formData.personalInfo.moveInDate}
                    onChange={(e) => handleChange('personalInfo', 'moveInDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Employment Information */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Employment Information</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Status</label>
                  <select
                    value={formData.employmentInfo.employmentStatus}
                    onChange={(e) => handleChange('employmentInfo', 'employmentStatus', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {(formData.employmentInfo.employmentStatus === 'employed' || 
                  formData.employmentInfo.employmentStatus === 'self-employed') && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Employer/Company</label>
                      <input
                        type="text"
                        value={formData.employmentInfo.employer}
                        onChange={(e) => handleChange('employmentInfo', 'employer', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Position/Title</label>
                      <input
                        type="text"
                        value={formData.employmentInfo.position}
                        onChange={(e) => handleChange('employmentInfo', 'position', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Duration</label>
                      <input
                        type="text"
                        value={formData.employmentInfo.employmentDuration}
                        onChange={(e) => handleChange('employmentInfo', 'employmentDuration', e.target.value)}
                        placeholder="e.g., 2 years"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Income (TND)</label>
                  <input
                    type="number"
                    value={formData.employmentInfo.monthlyIncome}
                    onChange={(e) => handleChange('employmentInfo', 'monthlyIncome', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 3: References */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">References</h3>
                
                {formData.references.map((ref, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-slate-800">Reference {index + 1}</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Relationship</label>
                        <input
                          type="text"
                          value={ref.relationship}
                          onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                          placeholder="e.g., Former landlord"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={ref.phone}
                          onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={ref.email}
                          onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Occupants</label>
                    <input
                      type="number"
                      value={formData.numberOfOccupants}
                      onChange={(e) => handleChange(null, 'numberOfOccupants', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasPets}
                        onChange={(e) => handleChange(null, 'hasPets', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">I have pets</span>
                    </label>
                  </div>

                  {formData.hasPets && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Pet Details</label>
                      <textarea
                        value={formData.petDetails}
                        onChange={(e) => handleChange(null, 'petDetails', e.target.value)}
                        placeholder="Type, breed, size, number of pets..."
                        rows="2"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Consent & Additional Notes */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Consent & Additional Information</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.creditCheckConsent}
                        onChange={(e) => handleChange(null, 'creditCheckConsent', e.target.checked)}
                        required
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                      />
                      <span className="text-sm text-slate-700">
                        <strong>Credit Check Consent:</strong> I authorize the landlord to conduct a credit check as part of the rental application process.
                      </span>
                    </label>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.backgroundCheckConsent}
                        onChange={(e) => handleChange(null, 'backgroundCheckConsent', e.target.checked)}
                        required
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                      />
                      <span className="text-sm text-slate-700">
                        <strong>Background Check Consent:</strong> I authorize the landlord to conduct a background check and verify the information provided.
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => handleChange(null, 'additionalNotes', e.target.value)}
                    placeholder="Any additional information you'd like to share..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaArrowLeft />
                  Previous
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all"
                >
                  Next
                  <FaArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !formData.creditCheckConsent || !formData.backgroundCheckConsent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
