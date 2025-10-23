import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config";
import Slider from "../Components/Slider";
import ListingItem from "../Components/ListingItem";
import AdvancedSearch from "../Components/AdvancedSearch";
import { FaHome, FaKey, FaTag, FaChartLine } from "react-icons/fa";

export default function Home() {
  const [offerListings, setOfferListings] = useState(null);
  const [rentListings, setRentListings] = useState(null);
  const [saleListings, setSaleListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    forRent: 0,
    forSale: 0,
    offers: 0,
  });

  useEffect(() => {
    async function fetchAllListings() {
      try {
        // Offers
        const offerRes = await fetch(
          `${API_ENDPOINTS.LISTINGS.BASE}?offer=true&limit=4`
        );
        const offers = await offerRes.json();
        setOfferListings(offers);

        // Rent
        const rentRes = await fetch(
          `${API_ENDPOINTS.LISTINGS.BASE}?type=rent&limit=4`
        );
        const rents = await rentRes.json();
        setRentListings(rents);

        // Sale
        const saleRes = await fetch(
          `${API_ENDPOINTS.LISTINGS.BASE}?type=sale&limit=4`
        );
        const sales = await saleRes.json();
        setSaleListings(sales);

        // Calculate stats
        setStats({
          total:
            (Array.isArray(offers) ? offers.length : 0) +
            (Array.isArray(rents) ? rents.length : 0) +
            (Array.isArray(sales) ? sales.length : 0),
          forRent: Array.isArray(rents) ? rents.length : 0,
          forSale: Array.isArray(sales) ? sales.length : 0,
          offers: Array.isArray(offers) ? offers.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch listings for home page", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllListings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Slider */}
      <Slider />

      {/* Advanced Search Component */}
      <div className="relative -mt-20 z-10">
        <AdvancedSearch />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Total Properties
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.total}+
                </h3>
              </div>
              <div className="bg-slate-100 rounded-full p-4">
                <FaHome className="text-2xl text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  For Rent
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.forRent}
                </h3>
              </div>
              <div className="bg-slate-100 rounded-full p-4">
                <FaKey className="text-2xl text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  For Sale
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.forSale}
                </h3>
              </div>
              <div className="bg-slate-100 rounded-full p-4">
                <FaChartLine className="text-2xl text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Special Offers
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.offers}
                </h3>
              </div>
              <div className="bg-slate-100 rounded-full p-4">
                <FaTag className="text-2xl text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Offers Section */}
        {offerListings && offerListings.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Special Offers
                </h2>
                <p className="text-gray-600">
                  Exclusive deals on premium properties
                </p>
              </div>
              <Link
                to="/offers"
                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-300 shadow-sm"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  listing={listing}
                  id={listing._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Places for Rent Section */}
        {rentListings && rentListings.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Properties for Rent
                </h2>
                <p className="text-gray-600">Find your ideal rental property</p>
              </div>
              <Link
                to="/category/rent"
                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-300 shadow-sm"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  listing={listing}
                  id={listing._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Places for Sale Section */}
        {saleListings && saleListings.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Properties for Sale
                </h2>
                <p className="text-gray-600">Discover your dream home today</p>
              </div>
              <Link
                to="/category/sale"
                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-300 shadow-sm"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  listing={listing}
                  id={listing._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-slate-900 rounded-2xl p-12 text-center text-white shadow-lg">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Browse thousands of properties or list your own. Start your real
            estate journey today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/search"
              className="px-8 py-4 bg-white text-slate-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-sm"
            >
              Browse Properties
            </Link>
            <Link
              to="/create-listing"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-slate-900 transition-all duration-300"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
