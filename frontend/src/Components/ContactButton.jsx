import React, { useState } from "react";
import { FaComment } from "react-icons/fa";
import Chat from "./Chat";

export default function ContactButton({
  ownerId,
  ownerName,
  listingId,
  listingName,
}) {
  const [showChat, setShowChat] = useState(false);
  
  // Get user info from token
  const getUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        return null;
      }
      return {
        id: payload.id, // The backend uses 'id' not 'userId'
        email: payload.email
      };
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  const user = getUser();

  // Don't show contact button if viewing own listing
  if (user && user.id === ownerId) {
    return null;
  }

  // Don't show if not logged in
  if (!user) {
    return (
      <button
        onClick={() => (window.location.href = "/signin")}
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
