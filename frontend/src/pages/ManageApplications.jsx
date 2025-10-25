import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFileContract, FaCheckCircle, FaTimesCircle, FaUser, FaBriefcase } from "react-icons/fa";

export default function ManageApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [activeTab, setActiveTab] = useState("received"); // received or sent
  const [receivedCount, setReceivedCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchApplications();
    fetchCounts();
  }, [navigate, activeTab]);

  async function fetchApplications() {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const role = activeTab === "received" ? "owner" : "requester";
      const res = await fetch(`/api/rental-applications?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      } else {
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCounts() {
    const token = localStorage.getItem("token");
    try {
      // Fetch received count
      const receivedRes = await fetch(`/api/rental-applications?role=owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (receivedRes.ok) {
        const receivedData = await receivedRes.json();
        setReceivedCount(receivedData.applications?.length || 0);
      }

      // Fetch sent count
      const sentRes = await fetch(`/api/rental-applications?role=requester`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sentRes.ok) {
        const sentData = await sentRes.json();
        setSentCount(sentData.applications?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch counts:", error);
    }
  }

  async function handleAction(applicationId, action) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/rental-applications?id=${applicationId}&action=${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success(`Application ${action}d successfully`);
        fetchApplications();
        fetchCounts(); // Update counts after action
      } else {
        toast.error("Failed to update application");
      }
    } catch (error) {
      toast.error("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 rounded-full p-4">
              <FaFileContract className="text-3xl text-slate-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Rental Applications</h1>
              <p className="text-gray-600 mt-2">
                Manage rental applications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === "received"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Received ({receivedCount})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === "sent"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Sent ({sentCount})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FaFileContract className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">
              {activeTab === "received"
                ? "You haven't received any rental applications yet."
                : "You haven't sent any rental applications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Application Header */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {app.listingName || "Rental Application"}
                      </h3>

                      {/* Quick Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FaUser className="text-gray-400" />
                          <span className="text-gray-600">Applicant:</span>
                          <span className="font-semibold text-gray-900">{app.personalInfo?.fullName}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 text-gray-900">{app.personalInfo?.email}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 text-gray-900">{app.personalInfo?.phone}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Employment Info */}
                      {app.employmentInfo && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FaBriefcase className="text-blue-600" />
                            <h4 className="font-semibold text-gray-900">Employment</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Employer:</span>
                              <span className="ml-2 font-medium text-gray-900">{app.employmentInfo.employer}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Position:</span>
                              <span className="ml-2 font-medium text-gray-900">{app.employmentInfo.position}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Monthly Income:</span>
                              <span className="ml-2 font-bold text-green-600">
                                {app.employmentInfo.monthlyIncome?.toLocaleString()} TND
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <span className="ml-2 text-gray-900">{app.employmentInfo.duration}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          app.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          app.status === "approved" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Toggle Details Button */}
                      <button
                        onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {expandedApp === app._id ? "Hide Details ▲" : "View Full Details ▼"}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    {activeTab === "received" && app.status === "pending" && (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <button
                          onClick={() => handleAction(app._id, "approve")}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaCheckCircle />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to reject this application?")) {
                              handleAction(app._id, "reject");
                            }
                          }}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaTimesCircle />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedApp === app._id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      {app.personalInfo && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Personal Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Current Address:</span>
                              <p className="text-gray-900">{app.personalInfo.currentAddress}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Date of Birth:</span>
                              <p className="text-gray-900">
                                {app.personalInfo.dateOfBirth ? new Date(app.personalInfo.dateOfBirth).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Occupants:</span>
                              <p className="text-gray-900">{app.personalInfo.numberOfOccupants || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Pets:</span>
                              <p className="text-gray-900">{app.personalInfo.hasPets ? "Yes" : "No"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* References */}
                      {app.references && app.references.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">References</h4>
                          <div className="space-y-3">
                            {app.references.map((ref, index) => (
                              <div key={index} className="p-3 bg-white rounded-lg text-sm">
                                <div className="font-semibold text-gray-900">{ref.name}</div>
                                <div className="text-gray-600">{ref.relationship}</div>
                                <div className="text-gray-600">{ref.phone}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional Notes */}
                      {app.additionalNotes && (
                        <div className="md:col-span-2">
                          <h4 className="font-bold text-gray-900 mb-2">Additional Notes</h4>
                          <p className="text-sm text-gray-700 p-3 bg-white rounded-lg">
                            {app.additionalNotes}
                          </p>
                        </div>
                      )}

                      {/* Consent Information */}
                      <div className="md:col-span-2">
                        <h4 className="font-bold text-gray-900 mb-2">Consents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            {app.creditCheckConsent ? (
                              <FaCheckCircle className="text-green-600" />
                            ) : (
                              <FaTimesCircle className="text-red-600" />
                            )}
                            <span>Credit Check Consent</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {app.backgroundCheckConsent ? (
                              <FaCheckCircle className="text-green-600" />
                            ) : (
                              <FaTimesCircle className="text-red-600" />
                            )}
                            <span>Background Check Consent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
