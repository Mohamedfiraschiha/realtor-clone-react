import React, { useState, useEffect } from "react";
import { FaComments, FaTimes, FaCircle } from "react-icons/fa";
import { useSocket } from "../contexts/SocketContext";
import Chat from "./Chat";
import { toast } from "react-toastify";

export default function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const { socket, isUserOnline } = useSocket();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.on("message:receive", () => {
      fetchConversations();
    });

    return () => {
      socket.off("message:receive");
    };
  }, [socket]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3001/api/chat/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);

        // Calculate total unread
        const unread = data.conversations.reduce(
          (sum, conv) => sum + conv.unreadCount,
          0
        );
        setTotalUnread(unread);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const openChat = (conversation) => {
    setActiveChat({
      recipientId: conversation.userId,
      recipientName: conversation.fullName,
      listingId: conversation.lastMessage.listingId,
      listingName: conversation.lastMessage.listingName,
    });
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-40"
      >
        <FaComments className="text-2xl" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* Conversations Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded transition"
            >
              <FaTimes />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
                No conversations yet. Start chatting with property owners!
              </div>
            ) : (
              conversations.map((conversation, index) => {
                const isOnline = isUserOnline(conversation.userId);
                return (
                  <div
                    key={index}
                    onClick={() => openChat(conversation)}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {conversation.fullName}
                          </h4>
                          <FaCircle
                            className={`text-xs ${
                              isOnline ? "text-green-500" : "text-gray-400"
                            }`}
                          />
                        </div>
                        {conversation.lastMessage.listingName && (
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage.listingName}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount > 9
                              ? "9+"
                              : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Active Chat Window */}
      {activeChat && (
        <Chat
          recipientId={activeChat.recipientId}
          recipientName={activeChat.recipientName}
          listingId={activeChat.listingId}
          listingName={activeChat.listingName}
          onClose={() => {
            setActiveChat(null);
            fetchConversations(); // Refresh to update unread counts
          }}
        />
      )}
    </>
  );
}
