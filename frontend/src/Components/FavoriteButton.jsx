import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function FavoriteButton({ listingId, className = '', iconSize = 'text-2xl' }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, [listingId]);

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const exists = data.favorites.some(fav => fav.listingId === listingId);
        setIsFavorite(exists);
      }
    } catch (error) {
      console.error('Check favorite error:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save favorites');
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`http://localhost:3001/api/favorites?listingId=${listingId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setIsFavorite(false);
          toast.success('Removed from favorites');
        }
      } else {
        // Add to favorites
        const response = await fetch('http://localhost:3001/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ listingId })
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success('Added to favorites! ❤️');
        }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      toast.error('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`transition-all duration-200 ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <FaHeart className={`${iconSize} text-red-500 hover:scale-110 transition-transform`} />
      ) : (
        <FaRegHeart className={`${iconSize} text-gray-400 hover:text-red-500 hover:scale-110 transition-all`} />
      )}
    </button>
  );
}
