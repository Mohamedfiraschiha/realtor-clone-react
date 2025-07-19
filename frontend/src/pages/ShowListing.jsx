import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../Components/Spinner";
import { FaMapMarkerAlt } from "react-icons/fa";
import { register } from 'swiper/element/bundle';
import "swiper/css/bundle";

register(); // Register Swiper custom elements

export default function ShowListing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`http://localhost:3000/api/listings/${id}`);
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

  useEffect(() => {
    if (swiperRef.current && listing && listing.images && listing.images.length > 0) {
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
    <main>
      {/* Swiper slider at the very top, full width */}
      {listing.images && listing.images.length > 0 && (
        <swiper-container
          ref={swiperRef}
          init="false"
          style={{ width: "100vw", maxWidth: "100vw", height: "400px", marginBottom: '2rem', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}
        >
          {listing.images.map((url, index) => (
            <swiper-slide key={index}>
              <img src={url} alt={`Slide ${index}`} className="w-full h-[400px] object-cover rounded" />
            </swiper-slide>
          ))}
        </swiper-container>
      )}
      {/* Info only, centered below Swiper */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{listing.name}</h1>
          <p className="text-xl text-green-600">${listing.regularPrice}</p>
        </div>

        <div className="mb-4 space-y-2">
          <p><strong>Description:</strong> {listing.description}</p>
          {listing.userEmail && (
            <p><strong>Owner Email:</strong> <a href={`mailto:${listing.userEmail}`} className="text-blue-600 underline">{listing.userEmail}</a></p>
          )}
          {listing.address && (
            <p><strong>Address:</strong> {listing.address}</p>
          )}
          {listing.type && (
            <p><strong>Type:</strong> {listing.type}</p>
          )}
          {listing.bedrooms !== undefined && (
            <p><strong>Bedrooms:</strong> {listing.bedrooms}</p>
          )}
          {listing.bathrooms !== undefined && (
            <p><strong>Bathrooms:</strong> {listing.bathrooms}</p>
          )}
          {listing.parking !== undefined && (
            <p><strong>Parking:</strong> {listing.parking ? 'Yes' : 'No'}</p>
          )}
          {listing.furnished !== undefined && (
            <p><strong>Furnished:</strong> {listing.furnished ? 'Yes' : 'No'}</p>
          )}
          {listing.latitude !== undefined && listing.longitude !== undefined && (
            <p><strong>Coordinates:</strong> {listing.latitude}, {listing.longitude}</p>
          )}
          {/* Add any other fields as needed */}
        </div>

        {/* Contact Owner */}
        {!contact ? (
          <button
            onClick={() => setContact(true)}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            Contact Owner
          </button>
        ) : (
          <div className="mt-4">
            <p>Email: <a href={`mailto:${listing.userEmail}`} className="text-blue-600 underline">{listing.userEmail}</a></p>
          </div>
        )}
      </div>
    </main>
  );
}
