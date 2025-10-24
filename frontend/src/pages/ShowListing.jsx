import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../Components/Spinner";
import {
  FaShare,
  FaBed,
  FaBath,
  FaParking,
  FaCouch,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { register } from "swiper/element/bundle";
import "swiper/css/bundle";
import { API_ENDPOINTS } from "../config";
import ContactButton from "../Components/ContactButton";

register(); // Register Swiper custom elements

export default function ShowListing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`${API_ENDPOINTS.LISTINGS.BASE}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch listing");
        const data = await res.json();
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
        setListing(null);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  // Fetch owner user ID from email
  const [ownerId, setOwnerId] = useState(null);
  useEffect(() => {
    async function fetchOwner() {
      if (!listing?.userEmail) return;
      try {
        const res = await fetch(
          `${API_ENDPOINTS.USERS.BASE}?email=${listing.userEmail}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setOwnerId(data.user._id);
          }
        }
      } catch (error) {
        console.error("Error fetching owner:", error);
      }
    }
    fetchOwner();
  }, [listing]);

  useEffect(() => {
    if (
      swiperRef.current &&
      listing &&
      listing.images &&
      listing.images.length > 0
    ) {
      Object.assign(swiperRef.current, {
        slidesPerView: 1,
        navigation: true,
        pagination: { clickable: true },
        autoplay: { delay: 3000 },
      });
      swiperRef.current.initialize();
    }
  }, [listing]);

  if (loading) return <Spinner />;
  if (!listing) return <div className="text-center p-4">Listing not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Share Link Icon */}
      <div
        className="fixed top-[13%] right-[3%] z-50 bg-white cursor-pointer border border-gray-300 rounded-full w-12 h-12 flex justify-center items-center shadow-lg hover:shadow-xl transition"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <FaShare className="text-lg text-slate-600" />
      </div>
      {shareLinkCopied && (
        <p className="fixed top-[23%] right-[3%] font-semibold border border-green-500 bg-green-50 text-green-700 rounded-lg z-50 px-4 py-2 shadow-lg">
          Link Copied!
        </p>
      )}

      {/* Image Slider */}
      {listing.images && listing.images.length > 0 && (
        <div className="relative w-full h-[400px] md:h-[500px]">
          <swiper-container
            ref={swiperRef}
            init="false"
            pagination="true"
            style={{ width: "100%", height: "100%" }}
          >
            {listing.images.map((url, index) => (
              <swiper-slide key={index}>
                <img
                  src={url}
                  alt={`${listing.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </swiper-slide>
            ))}
          </swiper-container>
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold text-slate-900">
                  {listing.name}
                </h1>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {listing.offer
                      ? listing.discountedPrice?.toLocaleString()
                      : listing.regularPrice?.toLocaleString()}{" "}
                    TND
                  </p>
                  {listing.offer && listing.discountedPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {listing.regularPrice?.toLocaleString()} TND
                    </p>
                  )}
                  {listing.type === "rent" && (
                    <p className="text-sm text-gray-600">/ month</p>
                  )}
                </div>
              </div>

              {/* Type Badge */}
              <div className="flex gap-2 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    listing.type === "rent"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  For {listing.type === "rent" ? "Rent" : "Sale"}
                </span>
                {listing.offer && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                    Special Offer
                  </span>
                )}
              </div>

              {/* Address */}
              {listing.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <FaMapMarkerAlt className="text-slate-500 mt-1 flex-shrink-0" />
                  <p className="text-base">{listing.address}</p>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Property Features
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {listing.bedrooms !== undefined && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <FaBed className="text-2xl text-slate-600" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {listing.bedrooms}
                      </p>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                    </div>
                  </div>
                )}
                {listing.bathrooms !== undefined && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <FaBath className="text-2xl text-slate-600" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {listing.bathrooms}
                      </p>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                    </div>
                  </div>
                )}
                {listing.parking !== undefined && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <FaParking className="text-2xl text-slate-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {listing.parking ? "Available" : "Not Available"}
                      </p>
                      <p className="text-sm text-gray-600">Parking</p>
                    </div>
                  </div>
                )}
                {listing.furnished !== undefined && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <FaCouch className="text-2xl text-slate-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {listing.furnished ? "Furnished" : "Unfurnished"}
                      </p>
                      <p className="text-sm text-gray-600">Status</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Owner Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Contact Owner
                </h2>
                {listing.userEmail && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Listed by</p>
                    <a
                      href={`mailto:${listing.userEmail}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {listing.userEmail}
                    </a>
                  </div>
                )}

                {/* Contact Button */}
                <div className="mt-4">
                  {ownerId ? (
                    <ContactButton
                      ownerId={ownerId}
                      ownerName={
                        listing.userName || listing.userEmail || "Owner"
                      }
                      listingId={listing._id}
                      listingName={listing.name}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm mt-2">Loading...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {listing.latitude !== undefined &&
                listing.longitude !== undefined && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">
                      Location
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-slate-500" />
                      <p className="text-sm">
                        {listing.latitude.toFixed(4)},{" "}
                        {listing.longitude.toFixed(4)}
                      </p>
                    </div>
                    {/* You can add a map here in the future */}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
