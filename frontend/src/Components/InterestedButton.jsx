import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function InterestedButton({ listingId, onOpenChat, className = '' }) {
  const [loading, setLoading] = useState(false);

  const handleInterestedClick = async () => {
    setLoading(true);
    
    try {
      // Open chat with owner
      if (onOpenChat) {
        onOpenChat();
      }
      
      // Could also send a notification to the owner here
      toast.success("Chat opened! You can now message the property owner.");
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to open chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleInterestedClick}
      disabled={loading}
      className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      <FaHeart className="text-xl" />
      {loading ? 'Opening...' : "I'm Interested"}
    </button>
  );
}
