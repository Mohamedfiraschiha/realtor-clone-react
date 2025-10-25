import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCalendarCheck, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

export default function ManageVisits() {
  const navigate = useNavigate();
  const [visitRequests, setVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received"); // received or sent
  const [receivedCount, setReceivedCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchVisitRequests();
    fetchCounts();
  }, [navigate, activeTab]);

  async function fetchVisitRequests() {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const role = activeTab === "received" ? "owner" : "requester";
      const res = await fetch(`/api/visit-requests?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVisitRequests(data.requests || []);
      } else {
        toast.error("Failed to load visit requests");
      }
    } catch (error) {
      console.error("Failed to fetch visit requests:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCounts() {
    const token = localStorage.getItem("token");
    try {
      // Fetch received count
      const receivedRes = await fetch(`/api/visit-requests?role=owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (receivedRes.ok) {
        const receivedData = await receivedRes.json();
        setReceivedCount(receivedData.requests?.length || 0);
      }

      // Fetch sent count
      const sentRes = await fetch(`/api/visit-requests?role=requester`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sentRes.ok) {
        const sentData = await sentRes.json();
        setSentCount(sentData.requests?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch counts:", error);
    }
  }

  async function handleAction(requestId, action) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/visit-requests?id=${requestId}&action=${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success(`Visit request ${action}d successfully`);
        fetchVisitRequests();
        fetchCounts(); // Update counts after action
      } else {
        toast.error("Failed to update visit request");
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
              <FaCalendarCheck className="text-3xl text-slate-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Visit Requests</h1>
              <p className="text-gray-600 mt-2">
                Manage property visit requests
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
            <p className="mt-4 text-gray-600">Loading visit requests...</p>
          </div>
        ) : visitRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FaCalendarCheck className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Visit Requests</h3>
            <p className="text-gray-600">
              {activeTab === "received" 
                ? "You haven't received any visit requests yet." 
                : "You haven't sent any visit requests yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visitRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {request.listingName || "Property Visit Request"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div><strong>{activeTab === "received" ? "Requested by" : "Property Owner"}:</strong> {request.userName}</div>
                      <div><strong>Email:</strong> {request.userEmail || "N/A"}</div>
                      <div><strong>Date:</strong> {new Date(request.preferredDate).toLocaleDateString()}</div>
                      <div><strong>Time:</strong> {request.preferredTime}</div>
                    </div>
                    {request.message && (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 mb-3">
                        <strong>Message:</strong> {request.message}
                      </div>
                    )}
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {request.status === "pending" && <FaClock className="mr-1" />}
                        {request.status === "approved" && <FaCheckCircle className="mr-1" />}
                        {request.status === "rejected" && <FaTimesCircle className="mr-1" />}
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {activeTab === "received" && request.status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleAction(request._id, "approve")}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request._id, "reject")}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaTimesCircle />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
