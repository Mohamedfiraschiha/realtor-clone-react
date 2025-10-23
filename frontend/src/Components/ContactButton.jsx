import React, { useState } from 'react';
import { FaComment } from 'react-icons/fa';
import Chat from './Chat';

export default function ContactButton({ ownerId, ownerName, listingId, listingName }) {
  const [showChat, setShowChat] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  // Don't show contact button if viewing own listing
  if (user && user.id === ownerId) {
    return null;
  }

  // Don't show if not logged in
  if (!user) {
    return (
      <button
        onClick={() => window.location.href = '/signin'}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold shadow-lg"
      >
        <FaComment />
        Sign in to Chat
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold shadow-lg"
      >
        <FaComment />
        Chat with Owner
      </button>

      {showChat && (
        <Chat
          recipientId={ownerId}
          recipientName={ownerName}
          listingId={listingId}
          listingName={listingName}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
