import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../Components/Spinner";
import { API_ENDPOINTS } from "../config";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Slider() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch(API_ENDPOINTS.LISTINGS.SLIDER);
        const data = await res.json();
        setListings(data);
        console.log("Slider listings:", data);
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  if (loading) return <Spinner />;
  if (!listings || listings.filter(l => l.images && l.images.length > 0).length === 0) {
    return <div className="text-center py-8 text-gray-500">No featured listings available.</div>;
  }

  return (
    <Swiper
      slidesPerView={1}
      navigation
      pagination={{ type: "progressbar" }}
      effect="fade"
      modules={[EffectFade, Autoplay, Navigation, Pagination]}
      autoplay={{ delay: 3000 }}
    >
      {listings
        .filter(listing => listing.images && listing.images.length > 0)
        .map((listing) => (
          <SwiperSlide
            key={listing._id}
            onClick={() => navigate(`/category/${listing.type}/${listing._id}`)}
          >
            <div
              style={{
                background: `url(${listing.images[0]}) center, no-repeat`,
                backgroundSize: "cover",
              }}
              className="relative w-full h-[300px] overflow-hidden"
            ></div>
            <p className="text-[#f1faee] absolute left-1 top-3 font-medium max-w-[90%] bg-[#457b9d] shadow-lg opacity-90 p-2 rounded-br-3xl">
              {listing.name}
            </p>
            <p className="text-[#f1faee] absolute left-1 bottom-1 font-semibold max-w-[90%] bg-[#e63946] shadow-lg opacity-90 p-2 rounded-tr-3xl">
              ${listing.discountedPrice ?? listing.regularPrice}
              {listing.type === "rent" && " / month"}
            </p>
          </SwiperSlide>
        ))}
    </Swiper>
  );
}
