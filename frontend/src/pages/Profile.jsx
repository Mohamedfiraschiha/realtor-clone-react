import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHome, FaUser, FaSignOutAlt, FaEdit } from "react-icons/fa";
import ListingItem from "../Components/ListingItem";
import { API_ENDPOINTS } from "../config";

export default function Profile() {
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [listings, setListings] = useState([]);

  // Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    let isLoggedIn = false;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        isLoggedIn = payload.exp * 1000 > Date.now();
      } catch {
        isLoggedIn = false;
      }
    }
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    const API_URL = API_ENDPOINTS.USER.PROFILE;
    const LISTINGS_URL = `${API_ENDPOINTS.LISTINGS.BASE}/mine`;
    async function fetchProfile() {
      try {
        const res = await fetch(API_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          let errorMsg = "Failed to fetch profile";
          try {
            const text = await res.text();
            try {
              const errorData = JSON.parse(text);
              errorMsg = errorData.message || errorMsg;
              console.error("Profile fetch API error:", errorData);
            } catch (jsonErr) {
              errorMsg = text || errorMsg;
              console.error("Profile fetch API error (non-JSON):", text);
            }
          } catch (readErr) {
            console.error("Could not read response body:", readErr);
          }
          toast.error(errorMsg);
          localStorage.removeItem("token");
          navigate("/signin");
          return;
        }
        const data = await res.json();
        setFormData({ name: data.name, email: data.email });
      } catch (err) {
        toast.error("Failed to fetch profile");
        console.error("Profile fetch network error:", err);
        localStorage.removeItem("token");
        navigate("/signin");
      }
    }
    async function fetchListings() {
      try {
        const res = await fetch(LISTINGS_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchProfile();
    fetchListings();
  }, [navigate]);

  function onChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit() {
    const API_URL = `${API_ENDPOINTS.LISTINGS.BASE}/user/profile`;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Profile updated!");
      } else {
        let errorMsg = "Update failed";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
          console.error("Profile update API error:", errorData);
        } catch (jsonErr) {
          const text = await res.text();
          errorMsg = text || errorMsg;
          console.error("Profile update API error (non-JSON):", text);
        }
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.error("Profile update network error:", err);
    }
  }

  async function onDelete(id) {
    if (window.confirm("Delete this listing?")) {
      await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success("Listing deleted");
    }
  }

  function onEdit(id) {
    navigate(`/edit-listing/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 rounded-full p-4">
              <FaUser className="text-3xl text-slate-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">
                Manage your account and listings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Account Information
          </h2>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                disabled={!changeDetail}
                onChange={onChange}
                className={`w-full px-4 py-3 text-gray-900 bg-white border rounded-lg transition-colors duration-200 ${
                  changeDetail
                    ? "border-slate-900 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    : "border-gray-300 bg-gray-50"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (changeDetail) onSubmit();
                  setChangeDetail((prev) => !prev);
                }}
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <FaEdit />
                {changeDetail ? "Save Changes" : "Edit Profile"}
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.dispatchEvent(new Event("storage"));
                  toast.info("You have been logged out");
                  navigate("/signin");
                }}
                className="flex-1 px-6 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-lg font-semibold hover:bg-slate-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaSignOutAlt />
                Sign Out
              </button>
            </div>
          </form>
        </div>

        {/* Create Listing CTA */}
        <div className="bg-slate-900 rounded-xl p-8 text-center text-white shadow-lg max-w-2xl mx-auto mb-12">
          <FaHome className="text-5xl mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">List Your Property</h3>
          <p className="text-gray-300 mb-6">
            Start earning by renting or selling your property today
          </p>
          <Link
            to="/create-listing"
            className="inline-block px-8 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-300"
          >
            Create New Listing
          </Link>
        </div>

        {/* My Listings Section */}
        {listings.length > 0 && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                My Listings
              </h2>
              <p className="text-gray-600">
                {listings.length}{" "}
                {listings.length === 1 ? "property" : "properties"} listed
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  id={listing._id}
                  listing={listing}
                  onDelete={() => onDelete(listing._id)}
                  onEdit={() => onEdit(listing._id)}
                />
              ))}
            </div>
          </div>
        )}

        {listings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FaHome className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Listings Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first listing to get started
            </p>
            <Link
              to="/create-listing"
              className="inline-block px-8 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-300"
            >
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
