import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyMap from "../Components/PropertyMap";
import ListingItem from "../Components/ListingItem";
import Spinner from "../Components/Spinner";
import { API_ENDPOINTS } from "../config";
import { toast } from "react-toastify";
import { FaMap, FaList, FaFilter } from "react-icons/fa";

export default function MapView() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("map"); // 'map' or 'split'
  const [selectedListing, setSelectedListing] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    enableSearchRadius: false,
    searchRadius: 5,
    enableClustering: true,
  });

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const queryString = searchParams.toString();
        const url = queryString
          ? `${API_ENDPOINTS.LISTINGS.SEARCH}?${queryString}`
          : `${API_ENDPOINTS.LISTINGS.BASE}`;

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
          const listingsData = Array.isArray(data.listings)
            ? data.listings
            : data;
          setListings(listingsData);

          // Set initial map center to first listing with geolocation
          const firstWithGeo = listingsData.find(
            (l) => l.geolocation?.lat && l.geolocation?.lng
          );
          if (firstWithGeo) {
            setMapCenter([
              firstWithGeo.geolocation.lat,
              firstWithGeo.geolocation.lng,
            ]);
          }
        } else {
          toast.error(data.message || "Failed to fetch listings");
        }
      } catch (error) {
        console.error("Map view error:", error);
        toast.error("Failed to fetch listings");
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <Spinner />;

  return (
    <div className="h-screen flex flex-col">
      {/* Header Controls */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Map View</h1>
            <p className="text-gray-600">
              {listings.length}{" "}
              {listings.length === 1 ? "property" : "properties"} found
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
                  viewMode === "map"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaMap /> Map Only
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
                  viewMode === "split"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaList /> Split View
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaFilter /> Map Settings
            </button>
          </div>
        </div>

        {/* Map Settings */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Enable Clustering */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="clustering"
                  checked={filters.enableClustering}
                  onChange={(e) =>
                    handleFilterChange("enableClustering", e.target.checked)
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="clustering" className="font-medium">
                  Enable Marker Clustering
                </label>
              </div>

              {/* Search Radius */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="searchRadius"
                  checked={filters.enableSearchRadius}
                  onChange={(e) =>
                    handleFilterChange("enableSearchRadius", e.target.checked)
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="searchRadius" className="font-medium">
                  Show Search Radius
                </label>
              </div>

              {/* Radius Size */}
              {filters.enableSearchRadius && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Radius: {filters.searchRadius} miles
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.searchRadius}
                    onChange={(e) =>
                      handleFilterChange("searchRadius", Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className={viewMode === "map" ? "w-full" : "w-1/2 md:w-2/3"}>
          <PropertyMap
            listings={listings}
            center={mapCenter}
            zoom={12}
            height="100%"
            enableClustering={filters.enableClustering}
            enableSearchRadius={filters.enableSearchRadius}
            searchRadius={filters.searchRadius}
          />
        </div>

        {/* Listings Sidebar (Split View) */}
        {viewMode === "split" && (
          <div className="w-1/2 md:w-1/3 overflow-y-auto bg-gray-50 border-l border-gray-300">
            <div className="p-4 space-y-4">
              {listings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No properties to display
                </div>
              ) : (
                listings.map((listing) => (
                  <div
                    key={listing._id}
                    onClick={() => {
                      setSelectedListing(listing);
                      if (
                        listing.geolocation?.lat &&
                        listing.geolocation?.lng
                      ) {
                        setMapCenter([
                          listing.geolocation.lat,
                          listing.geolocation.lng,
                        ]);
                      }
                    }}
                    className={`cursor-pointer transition transform hover:scale-105 ${
                      selectedListing?._id === listing._id
                        ? "ring-2 ring-blue-500 rounded-lg"
                        : ""
                    }`}
                  >
                    <ListingItem listing={listing} id={listing._id} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
