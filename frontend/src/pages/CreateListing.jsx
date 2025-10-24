import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaSearch, FaHome, FaImage } from "react-icons/fa";
import { API_ENDPOINTS } from "../config";
import Spinner from "../Components/Spinner";
import PriceSuggestion from "../Components/PriceSuggestion";

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geolocation, setGeolocation] = useState({ lat: null, lng: null });
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    area: "",
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
  });

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true" || e.target.value === true) boolean = true;
    if (e.target.value === "false" || e.target.value === false) boolean = false;
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, images: e.target.files }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  // Geocode address using Nominatim (free OpenStreetMap API)
  async function geocodeAddress() {
    if (!formData.address) {
      toast.error("Please enter an address first");
      return;
    }

    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.address
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "RealtorCloneApp/1.0",
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        setGeolocation(location);
        toast.success("Location found on map!");
      } else {
        toast.error("Could not find location. Please check the address.");
        setGeolocation({ lat: null, lng: null });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to geocode address");
      setGeolocation({ lat: null, lng: null });
    } finally {
      setGeocoding(false);
    }
  }

  async function uploadImages(files) {
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const form = new FormData();
      form.append("file", files[i]);
      form.append("upload_preset", "react-uploads");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dj0xaaqox/image/upload",
        {
          method: "POST",
          body: form,
        }
      );
      const result = await res.json();
      if (!result.secure_url) throw new Error("Image upload failed");
      uploadedUrls.push(result.secure_url);
    }
    return uploadedUrls;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error("Discounted price must be less than regular price");
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images allowed");
      return;
    }
    try {
      const imgUrls = await uploadImages(images);
      // Geocode if not already done
      let finalGeolocation = geolocation;
      if (!geolocation.lat || !geolocation.lng) {
        toast.info("Geocoding address...");
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address
            )}&limit=1`,
            {
              headers: {
                "User-Agent": "RealtorCloneApp/1.0",
              },
            }
          );
          const data = await response.json();
          if (data && data.length > 0) {
            finalGeolocation = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            };
          } else {
            toast.warning(
              "Could not geocode address. Listing will not appear on map."
            );
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.warning("Geocoding failed. Listing will not appear on map.");
        }
      }

      const listing = {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        area,
        address,
        description,
        offer,
        regularPrice,
        discountedPrice: offer ? discountedPrice : null,
        images: imgUrls,
        geolocation: finalGeolocation,
      };
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.LISTINGS.BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(listing),
      });
      if (!res.ok) throw new Error("Failed to create listing");
      await res.json(); // We don't need the response data
      toast.success("Listing created");
      navigate("/profile");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner />
      </div>
    );

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    area,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
  } = formData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 rounded-full p-4">
              <FaHome className="text-3xl text-slate-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Create Listing
              </h1>
              <p className="text-gray-600 mt-2">
                List your property for sale or rent
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        >
          {/* Property Type */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Property Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                id="type"
                value="sale"
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  type === "sale"
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                For Sale
              </button>
              <button
                type="button"
                id="type"
                value="rent"
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  type === "rent"
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                For Rent
              </button>
            </div>
          </div>

          {/* Property Name */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Property Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={onChange}
              placeholder="e.g., Modern 3-Bedroom Apartment"
              maxLength="32"
              minLength="10"
              required
              className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onChange}
                min="1"
                max="50"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onChange}
                min="1"
                max="50"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Area */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Area (square meters)
            </label>
            <input
              type="number"
              id="area"
              value={area}
              onChange={onChange}
              min="10"
              max="10000"
              required
              placeholder="e.g., 120"
              className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Parking */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Parking Spot
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                id="parking"
                value={true}
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  parking
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                id="parking"
                value={false}
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  !parking
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Furnished */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Furnished
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                id="furnished"
                value={true}
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  furnished
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                id="furnished"
                value={false}
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  !furnished
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={onChange}
              placeholder="Full address (e.g., 123 Main St, New York, NY 10001)"
              required
              rows="3"
              className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Geocode Button */}
          <button
            type="button"
            onClick={geocodeAddress}
            disabled={geocoding || !address}
            className="mb-4 w-full px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {geocoding ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Finding Location...
              </>
            ) : (
              <>
                <FaSearch />
                Find Location on Map
              </>
            )}
          </button>

          {/* Location Status */}
          {geolocation.lat && geolocation.lng ? (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <FaMapMarkerAlt className="text-green-600 text-xl" />
              <div>
                <p className="font-semibold text-sm">Location found</p>
                <p className="text-xs">
                  {geolocation.lat.toFixed(4)}, {geolocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
          ) : (
            address && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-700">
                <FaMapMarkerAlt className="text-yellow-600 text-xl" />
                <p className="text-sm">
                  Click "Find Location on Map" to make this property visible on
                  the map
                </p>
              </div>
            )
          )}

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={onChange}
              placeholder="Describe your property..."
              required
              rows="5"
              className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Offer */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Special Offer
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                id="offer"
                value={true}
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  offer
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                id="offer"
                value={false}
                onClick={onChange}
                className={`px-6 py-3 font-semibold text-sm uppercase rounded-lg transition-all duration-200 ${
                  !offer
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-slate-900"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* AI Price Suggestion - Only for Sale properties */}
          {type === "sale" && (
            <PriceSuggestion 
              formData={formData}
              onPriceSelect={(price) => {
                setFormData(prev => ({ ...prev, regularPrice: price }));
                toast.success(`Price set to ${price.toLocaleString()} TND`);
              }}
            />
          )}

          {/* Regular Price */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Regular Price (TND) {type === "rent" && "per Month"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg">TND</span>
              </div>
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChange}
                min="50"
                max="400000000"
                required
                className="w-full pl-16 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Discounted Price */}
          {offer && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Discounted Price (TND) {type === "rent" && "per Month"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">TND</span>
                </div>
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required={offer}
                  className="w-full pl-16 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Images */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <FaImage className="inline mr-2" />
              Property Images
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Upload up to 6 images. The first image will be the cover photo.
            </p>
            <input
              type="file"
              id="images"
              onChange={onChange}
              accept=".jpg,.png,.jpeg"
              multiple
              required
              className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:font-semibold hover:file:bg-slate-800 transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-8 py-4 bg-slate-900 text-white font-bold text-lg rounded-lg hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Create Listing
          </button>
        </form>
      </div>
    </div>
  );
}
