import { useEffect, useState } from "react";
import { toast } from "react-toastify";
// Firebase imports removed; replaced with backend fetch logic.
import Spinner from "../Components/Spinner";
import ListingItem from "../Components/ListingItem";
import { useParams } from "react-router-dom";
import { API_ENDPOINTS } from "../config";

export default function Category() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastId, setLastId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const params = useParams();

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_ENDPOINTS.LISTINGS.BASE}?type=${params.categoryName}&limit=8`);
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
  }, [params.categoryName]);

  async function onFetchMoreListings() {
    try {
      setLoading(true);
      const res = await fetch(`${API_ENDPOINTS.LISTINGS.BASE}?type=${params.categoryName}&limit=4&last=${lastId}`);
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

  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold mb-6">
        {params.categoryName === "rent" ? "Places for rent" : "Places for sale"}
      </h1>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.map((listing) => (
                <ListingItem
                  key={listing._id}
                  id={listing._id}
                  listing={listing}
                />
              ))}
            </ul>
          </main>
          {hasMore && (
            <div className="flex justify-center items-center">
              <button
                onClick={onFetchMoreListings}
                className="bg-white px-3 py-1.5 text-gray-700 border border-gray-300 mb-6 mt-6 hover:border-slate-600 rounded transition duration-150 ease-in-out"
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <p>
          There are no current{" "}
          {params.categoryName === "rent"
            ? "places for rent"
            : "places for sale"}
        </p>
      )}
    </div>
  );
}
