import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSearch, FaMapMarkerAlt, FaHome, FaImage } from "react-icons/fa";
import Spinner from "../Components/Spinner";
import { API_ENDPOINTS } from "../config";
import PriceSuggestion from "../Components/PriceSuggestion";

export default function EditListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [geolocation, setGeolocation] = useState({ lat: null, lng: null });
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.LISTINGS.BASE}/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Listing not found");
        setFormData({ ...data, images: data.images || data.imgUrls || [] });
        // Set geolocation if exists
        if (data.geolocation) {
          setGeolocation(data.geolocation);
        }
      } catch (err) {
        toast.error(err.message || "Could not load listing");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") boolean = true;
    if (e.target.value === "false") boolean = false;
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, images: e.target.files }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  // Geocode address
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
      const data = await res.json();
      if (!data.secure_url) throw new Error("Image upload failed");
      uploadedUrls.push(data.secure_url);
    }
    return uploadedUrls;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { discountedPrice, regularPrice, offer, images, ...rest } = formData;

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
      const imgUrls =
        images.length > 0 ? await uploadImages(images) : formData.imgUrls || [];

      // Geocode if needed
      let finalGeolocation = geolocation;
      if ((!geolocation.lat || !geolocation.lng) && formData.address) {
        toast.info("Geocoding address...");
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
            finalGeolocation = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            };
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      }

      const updatedListing = {
        ...rest,
        discountedPrice: offer ? discountedPrice : null,
        regularPrice,
        offer,
        images: imgUrls, // send images field, not imgUrls
        geolocation: finalGeolocation,
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_ENDPOINTS.LISTINGS.BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedListing),
      });

      if (!res.ok) throw new Error("Update failed");
      toast.success("Listing updated");
      navigate("/profile");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !formData) return <Spinner />;

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
              <h1 className="text-4xl font-bold text-slate-900">
                Edit Listing
              </h1>
              <p className="text-gray-600 mt-1">
                Update your property details and information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={onSubmit}>
            {/* Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Listing Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="type"
                  value="sale"
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    formData.type === "sale"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  Sell
                </button>
                <button
                  type="button"
                  id="type"
                  value="rent"
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    formData.type === "rent"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  Rent
                </button>
              </div>
            </div>

            {/* Property Name */}
            <div className="mb-8">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Property Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ""}
                onChange={onChange}
                placeholder="e.g., Beautiful 2-Bedroom Apartment"
                maxLength="32"
                minLength="10"
                required
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  value={formData.bedrooms}
                  onChange={onChange}
                  min="1"
                  max="50"
                  required
                  className="w-full px-4 py-3 text-center text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="bathrooms"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  value={formData.bathrooms}
                  onChange={onChange}
                  min="1"
                  max="50"
                  required
                  className="w-full px-4 py-3 text-center text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
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
                value={formData.area || ""}
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
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Parking Spot
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="parking"
                  value={true}
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    formData.parking
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  id="parking"
                  value={false}
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    !formData.parking
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Furnished */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Furnished
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="furnished"
                  value={true}
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    formData.furnished
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  id="furnished"
                  value={false}
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    !formData.furnished
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Address
              </label>
              <textarea
                type="text"
                id="address"
                value={formData.address || ""}
                onChange={onChange}
                placeholder="Full address (e.g., 123 Main St, New York, NY 10001)"
                required
                rows="2"
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              />
            </div>

            {/* Geocode Button */}
            <button
              type="button"
              onClick={geocodeAddress}
              disabled={geocoding || !formData.address}
              className="mb-4 w-full px-6 py-3 bg-slate-900 text-white font-medium text-sm uppercase rounded-lg hover:bg-slate-800 transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <FaMapMarkerAlt className="text-green-600 text-lg" />
                <span className="text-sm font-medium">
                  Location found: {geolocation.lat.toFixed(4)},{" "}
                  {geolocation.lng.toFixed(4)}
                </span>
              </div>
            ) : (
              formData.address && (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-700">
                  <FaMapMarkerAlt className="text-yellow-600 text-lg" />
                  <span className="text-sm font-medium">
                    Click "Find Location on Map" to geocode this address
                  </span>
                </div>
              )
            )}

            {/* Description */}
            <div className="mb-8">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Description
              </label>
              <textarea
                type="text"
                id="description"
                value={formData.description || ""}
                onChange={onChange}
                placeholder="Describe your property..."
                required
                rows="4"
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              />
            </div>

            {/* Offer */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Special Offer
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="offer"
                  value={true}
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    formData.offer
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  id="offer"
                  value={false}
                  onClick={onChange}
                  className={`px-6 py-3 font-medium text-sm uppercase rounded-lg transition duration-150 ease-in-out ${
                    !formData.offer
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900 border-2 border-gray-200 hover:border-slate-900"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* AI Price Suggestion - Only for Sale properties */}
            {formData.type === "sale" && (
              <PriceSuggestion
                formData={formData}
                onPriceSelect={(price) => {
                  setFormData((prev) => ({ ...prev, regularPrice: price }));
                  toast.success(`Price set to ${price.toLocaleString()} TND`);
                }}
              />
            )}

            {/* Regular Price */}
            <div className="mb-8">
              <label
                htmlFor="regularPrice"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Regular Price (TND){" "}
                {formData.type === "rent" && (
                  <span className="text-gray-500 font-normal">(/ Month)</span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  TND
                </span>
                <input
                  type="number"
                  id="regularPrice"
                  value={formData.regularPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required
                  className="w-full pl-16 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Discounted Price */}
            {formData.offer && (
              <div className="mb-8">
                <label
                  htmlFor="discountedPrice"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Discounted Price (TND)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    TND
                  </span>
                  <input
                    type="number"
                    id="discountedPrice"
                    value={formData.discountedPrice || ""}
                    onChange={onChange}
                    min="0"
                    max={formData.regularPrice - 1}
                    required={formData.offer}
                    className="w-full pl-16 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Images */}
            <div className="mb-8">
              <label
                htmlFor="images"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                <FaImage className="inline mr-2" />
                Property Images{" "}
                <span className="text-gray-500 font-normal">(max 6)</span>
              </label>

              {/* Show previews of existing images */}
              {formData.images &&
                Array.isArray(formData.images) &&
                formData.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {formData.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt={`Listing ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                )}

              <input
                type="file"
                id="images"
                onChange={onChange}
                accept=".jpg,.png,.jpeg"
                multiple
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload up to 6 images (JPG, PNG, JPEG)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-8 py-4 bg-slate-900 text-white font-semibold text-sm uppercase rounded-lg hover:bg-slate-800 transition duration-150 ease-in-out shadow-sm"
            >
              Update Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
