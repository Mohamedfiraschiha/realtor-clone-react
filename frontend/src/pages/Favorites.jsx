import { useEffect, useState } from 'react';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Components/Spinner';
import ListingItem from '../Components/ListingItem';

export default function Favorites() {
  // eslint-disable-next-line no-unused-vars
  const [favorites, setFavorites] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }

      // Get favorite listing IDs
      const favResponse = await fetch('http://localhost:3001/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!favResponse.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const favData = await favResponse.json();
      setFavorites(favData.favorites);

      // Fetch listing details for each favorite
      if (favData.favorites.length > 0) {
        const listingPromises = favData.favorites.map(fav =>
          fetch(`http://localhost:3001/api/listings/${fav.listingId}`)
            .then(res => res.ok ? res.json() : null)
        );

        const listingResults = await Promise.all(listingPromises);
        setListings(listingResults.filter(l => l !== null));
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/favorites?listingId=${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Remove from local state
        setFavorites(prev => prev.filter(fav => fav.listingId !== listingId));
        setListings(prev => prev.filter(listing => listing._id !== listingId));
        toast.success('Removed from favorites');
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
      toast.error('Failed to remove favorite');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <FaHeart className="text-4xl text-red-500" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">My Favorites</h1>
              <p className="text-gray-600 mt-2">
                {listings.length} {listings.length === 1 ? 'property' : 'properties'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start adding properties to your favorites to see them here
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing._id} className="relative">
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveFavorite(listing._id)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors"
                  title="Remove from favorites"
                >
                  <FaTrash className="text-red-500" />
                </button>
                
                <ListingItem
                  listing={listing}
                  id={listing._id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
