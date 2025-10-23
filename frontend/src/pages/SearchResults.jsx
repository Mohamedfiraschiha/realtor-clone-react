import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ListingItem from "../Components/ListingItem";
import PropertyMap from "../Components/PropertyMap";
import Spinner from "../Components/Spinner";
import { API_ENDPOINTS } from "../config";
import { toast } from "react-toastify";
import { FaMap, FaTh } from "react-icons/fa";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'map'

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        // Build query string from search params
        const queryString = searchParams.toString();
        const url = `${API_ENDPOINTS.LISTINGS.SEARCH}?${queryString}`;

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
          setListings(Array.isArray(data.listings) ? data.listings : data);
          setTotalResults(
            data.total || (Array.isArray(data) ? data.length : 0)
          );
        } else {
          toast.error(data.message || "Failed to fetch listings");
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [searchParams]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Search Summary */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-600">
            Found {totalResults}{" "}
            {totalResults === 1 ? "property" : "properties"}
          </p>

          {/* Active Filters Display */}
          {searchParams.toString() && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(searchParams.entries()).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <strong>{key.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
              viewMode === "grid"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaTh /> Grid
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
              viewMode === "map"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaMap /> Map
          </button>
        </div>
      </div>

      {/* Results Display */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">
            No properties found matching your criteria
          </p>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} id={listing._id} />
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <PropertyMap
            listings={listings}
            height="600px"
            enableClustering={true}
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingItem
                key={listing._id}
                listing={listing}
                id={listing._id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
