import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBed, FaBath, FaDollarSign, FaHome, FaMapMarkerAlt, FaSave, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  
  const [filters, setFilters] = useState({
    location: "",
    type: "all",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    sortBy: "date-desc",
  });

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedSearches");
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Handle filter changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build query string
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, value);
      }
    });

    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
  };

  // Save current search criteria
  const saveSearch = () => {
    const searchName = prompt("Enter a name for this search:");
    if (!searchName) return;

    const newSearch = {
      id: Date.now(),
      name: searchName,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem("savedSearches", JSON.stringify(updated));
    toast.success("Search saved successfully!");
  };

  // Load a saved search
  const loadSearch = (savedFilters) => {
    setFilters(savedFilters);
    toast.info("Search loaded");
  };

  // Delete a saved search
  const deleteSearch = (id) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem("savedSearches", JSON.stringify(updated));
    toast.success("Search deleted");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Location Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="City, Neighborhood, or ZIP"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaHome className="inline mr-2" />
              Property Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaDollarSign className="inline mr-2" />
              Min Price
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="No Min"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaDollarSign className="inline mr-2" />
              Max Price
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="No Max"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
        >
          <FaFilter />
          {showFilters ? "Hide" : "Show"} Advanced Filters
        </button>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaBed className="inline mr-2" />
                Bedrooms
              </label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaBath className="inline mr-2" />
                Bathrooms
              </label>
              <select
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            className="flex-1 min-w-[200px] bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
          >
            <FaSearch />
            Search Properties
          </button>
          <button
            type="button"
            onClick={saveSearch}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center gap-2"
          >
            <FaSave />
            Save Search
          </button>
        </div>
      </form>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Saved Searches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition duration-200"
              >
                <h4 className="font-semibold text-lg mb-2">{search.name}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {search.filters.location && `📍 ${search.filters.location}`}
                  {search.filters.type !== "all" && ` • ${search.filters.type}`}
                  {search.filters.minPrice && ` • $${search.filters.minPrice}+`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadSearch(search.filters)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition text-sm font-medium"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteSearch(search.id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
