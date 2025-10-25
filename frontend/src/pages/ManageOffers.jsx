import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHandshake, FaCheckCircle, FaTimesCircle, FaReply } from "react-icons/fa";
import { API_ENDPOINTS } from "../config";

export default function ManageOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "" });
  const [activeTab, setActiveTab] = useState("received"); // received or sent
  const [receivedCount, setReceivedCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    // Fetch user profile for counter offers
    fetchProfile();
    fetchOffers();
    fetchCounts();
  }, [navigate, activeTab]);

  async function fetchProfile() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_ENDPOINTS.USER.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ name: data.name });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }

  async function fetchOffers() {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const role = activeTab === "received" ? "owner" : "requester";
      const res = await fetch(`/api/offers?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      } else {
        toast.error("Failed to load offers");
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCounts() {
    const token = localStorage.getItem("token");
    try {
      // Fetch received count
      const receivedRes = await fetch(`/api/offers?role=owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (receivedRes.ok) {
        const receivedData = await receivedRes.json();
        setReceivedCount(receivedData.offers?.length || 0);
      }

      // Fetch sent count
      const sentRes = await fetch(`/api/offers?role=requester`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sentRes.ok) {
        const sentData = await sentRes.json();
        setSentCount(sentData.offers?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch counts:", error);
    }
  }

  async function handleAction(offerId, action, counterData = null) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/offers?id=${offerId}&action=${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(counterData || {}),
        }
      );
      if (res.ok) {
        toast.success(`Offer ${action}ed successfully`);
        fetchOffers();
        fetchCounts(); // Update counts after action
      } else {
        toast.error("Failed to update offer");
      }
    } catch (error) {
      toast.error("Network error");
    }
  }

  function handleCounter(offer) {
    const counterPrice = prompt(
      `Current offer: ${offer.offerPrice?.toLocaleString()} TND\nEnter your counter offer price:`,
      offer.offerPrice
    );
    
    if (counterPrice && !isNaN(counterPrice) && parseFloat(counterPrice) > 0) {
      const message = prompt("Optional message for buyer:", "");
      handleAction(offer._id, "counter", {
        counterPrice: parseFloat(counterPrice),
        ownerName: formData.name,
        message: message || "Counter offer from owner"
      });
    } else if (counterPrice !== null) {
      toast.error("Please enter a valid price");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 rounded-full p-4">
              <FaHandshake className="text-3xl text-slate-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Offers</h1>
              <p className="text-gray-600 mt-2">
                Manage purchase offers
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
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FaHandshake className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Offers Yet</h3>
            <p className="text-gray-600">
              {activeTab === "received"
                ? "You haven't received any offers on your properties yet."
                : "You haven't sent any offers yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {offer.listingName || "Property Offer"}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Buyer:</span>
                        <span className="ml-2 font-semibold text-gray-900">{offer.buyerName}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Offer Price:</span>
                        <span className="ml-2 font-bold text-green-600 text-lg">
                          {offer.offerPrice?.toLocaleString()} TND
                        </span>
                      </div>
                      {offer.listingPrice && (
                        <div className="text-sm">
                          <span className="text-gray-600">Listing Price:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {offer.listingPrice?.toLocaleString()} TND
                          </span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {offer.message && (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 mb-3">
                        <strong>Message:</strong> {offer.message}
                      </div>
                    )}

                    {offer.negotiationHistory && offer.negotiationHistory.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Negotiation History:</h4>
                        <div className="space-y-1">
                          {offer.negotiationHistory.map((item, index) => (
                            <div key={index} className="text-xs text-gray-600 pl-3 border-l-2 border-gray-300">
                              <span className="font-medium">{item.by}:</span> {item.price.toLocaleString()} TND
                              {item.message && <span className="ml-2 italic">- {item.message}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        offer.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        offer.status === "accepted" ? "bg-green-100 text-green-800" :
                        offer.status === "countered" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {offer.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {activeTab === "received" && offer.status === "pending" && (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <button
                        onClick={() => handleAction(offer._id, "accept")}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle />
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleCounter(offer)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaReply />
                        Counter Offer
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to reject this offer?")) {
                            handleAction(offer._id, "reject", { reason: "Not interested" });
                          }
                        }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaTimesCircle />
                        Reject Offer
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
