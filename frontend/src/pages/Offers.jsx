import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../Components/Spinner";
import { API_ENDPOINTS } from "../config";
import ListingItem from "../Components/ListingItem";
import { FaTag, FaFilter } from "react-icons/fa";

export default function Offers() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastId, setLastId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_ENDPOINTS.LISTINGS.BASE}?offer=true&limit=8`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setListings(data);
        setLoading(false);
        if (data.length > 0) {
          setLastId(data[data.length - 1]._id);
          setHasMore(data.length === 8);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        toast.error("Could not fetch listing");
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  async function onFetchMoreListings() {
    try {
      setLoading(true);
      const res = await fetch(`${API_ENDPOINTS.LISTINGS.BASE}?offer=true&limit=4&last=${lastId}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setListings((prev) => [...prev, ...data]);
      setLoading(false);
      if (data.length > 0) {
        setLastId(data[data.length - 1]._id);
        setHasMore(data.length === 4);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Could not fetch listing");
      setLoading(false);
    }
  }

  // Navigation helpers
  const handleShow = (id) => {
    window.location.href = `/listing/${id}`;
  };
  const handleEdit = (id) => {
    window.location.href = `/edit-listing/${id}`;
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete listing");
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success("Listing deleted successfully");
    } catch (error) {
      toast.error("Could not delete listing");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 rounded-full p-4">
                <FaTag className="text-3xl text-slate-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Special Offers</h1>
                <p className="text-gray-600 mt-2">
                  {listings.length > 0 ? `${listings.length} properties with exclusive deals` : 'No offers available'}
                </p>
              </div>
            </div>
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-300">
              <FaFilter />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : listings && listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {listings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  id={listing._id}
                  listing={listing}
                  onShow={() => handleShow(listing._id)}
                  onEdit={() => handleEdit(listing._id)}
                  onDelete={() => handleDelete(listing._id)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={onFetchMoreListings}
                  className="px-8 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-lg font-semibold hover:bg-slate-900 hover:text-white transition-all duration-300"
                >
                  Load More Properties
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <FaTag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Offers Available</h3>
            <p className="text-gray-600">Check back later for exclusive deals on properties</p>
          </div>
        )}
      </div>
    </div>
  );
}
