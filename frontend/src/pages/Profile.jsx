import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FcHome } from "react-icons/fc";
import ListingItem from "../Components/ListingItem";

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
        const payload = JSON.parse(atob(token.split('.')[1]));
        isLoggedIn = payload.exp * 1000 > Date.now();
      } catch {
        isLoggedIn = false;
      }
    }
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    const API_URL = "http://localhost:3000/api/user/profile";
    const LISTINGS_URL = "http://localhost:3000/api/listings/mine";
    async function fetchProfile() {
      try {
        const res = await fetch(API_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          let errorMsg = "Failed to fetch profile";
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || errorMsg;
            console.error('Profile fetch API error:', errorData);
          } catch (jsonErr) {
            const text = await res.text();
            errorMsg = text || errorMsg;
            console.error('Profile fetch API error (non-JSON):', text);
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
        console.error('Profile fetch network error:', err);
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

  function onLogout() {
    toast.info("You have been logged out");
    navigate("/");
  }

  function onChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit() {
    const API_URL = "http://localhost:3000/api/user/profile";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Profile updated!");
      } else {
        let errorMsg = "Update failed";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
          console.error('Profile update API error:', errorData);
        } catch (jsonErr) {
          const text = await res.text();
          errorMsg = text || errorMsg;
          console.error('Profile update API error (non-JSON):', text);
        }
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.error('Profile update network error:', err);
    }
  }

  async function onDelete(id) {
    if (window.confirm("Delete this listing?")) {
      await fetch(`/api/listings/${id}`, { method: "DELETE", credentials: "include" });
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success("Listing deleted");
    }
  }

  function onEdit(id) {
    navigate(`/edit-listing/${id}`);
  }

  return (
    <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
      <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
      <div className="w-full md:w-[50%] mt-6 px-3">
        <form>
          <input
            type="text"
            id="name"
            value={formData.name}
            disabled={!changeDetail}
            onChange={onChange}
            className={`mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded ${
              changeDetail ? "bg-red-200" : ""
            }`}
          />
          <input
            type="email"
            id="email"
            value={formData.email}
            disabled
            className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded"
          />

          <div className="flex justify-between text-sm sm:text-lg mb-6">
            <p>
              Do you want to change your name?
              <span
                onClick={() => {
                  if (changeDetail) onSubmit();
                  setChangeDetail((prev) => !prev);
                }}
                className="text-red-600 ml-1 cursor-pointer"
              >
                {changeDetail ? "Apply change" : "Edit"}
              </span>
            </p>
            <p
              onClick={() => {
                localStorage.removeItem("token");
                window.dispatchEvent(new Event("storage")); // update header state
                toast.info("You have been logged out");
                navigate("/signin");
              }}
              className="text-blue-600 cursor-pointer"
            >
              Sign out
            </p>
          </div>
        </form>

        <Link
          to="/create-listing"
          className="w-full bg-blue-600 text-white px-7 py-3 rounded flex justify-center items-center"
        >
          <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" />
          Sell or rent your home
        </Link>
      </div>

      {listings.length > 0 && (
        <div className="max-w-6xl px-3 mt-6 mx-auto">
          <h2 className="text-2xl text-center font-semibold mb-6">My Listings</h2>
          <ul className="sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {listings.map((listing) => (
              <ListingItem
                key={listing._id}
                id={listing._id}
                listing={listing}
                onDelete={() => onDelete(listing._id)}
                onEdit={() => onEdit(listing._id)}
                onShow={() => navigate(`/show-listing/${listing._id}`)}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
