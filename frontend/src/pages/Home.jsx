import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "../Components/Slider";
import ListingItem from "../Components/ListingItem";

export default function Home() {
  const [offerListings, setOfferListings] = useState(null);
  const [rentListings, setRentListings] = useState(null);
  const [saleListings, setSaleListings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllListings() {
      try {
        // Offers
        const offerRes = await fetch("/api/listings?offer=true&limit=4");
        const offers = await offerRes.json();
        setOfferListings(offers);

        // Rent
        const rentRes = await fetch("/api/listings?type=rent&limit=4");
        const rents = await rentRes.json();
        setRentListings(rents);

        // Sale
        const saleRes = await fetch("/api/listings?type=sale&limit=4");
        const sales = await saleRes.json();
        setSaleListings(sales);
      } catch (error) {
        console.error("Failed to fetch listings for home page", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllListings();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;


  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <Slider />
      <div className="max-w-6xl mx-auto pt-4 space-y-6">
        {offerListings && offerListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent offers</h2>
            <Link to="/offers">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more offers
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  listing={listing}
                  id={listing._id}
                />
              ))}
            </ul>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Places for rent
            </h2>
            <Link to="/category/rent">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for rent
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  listing={listing}
                  id={listing._id}
                />
              ))}
            </ul>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Places for sale
            </h2>
            <Link to="/category/sale">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for sale
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  listing={listing}
                  id={listing._id}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
