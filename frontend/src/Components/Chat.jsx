import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { FaPaperPlane, FaTimes, FaCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Chat({ recipientId, recipientName, listingId, listingName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, connected, isUserOnline } = useSocket();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const isOnline = isUserOnline(recipientId);

  // Fetch message history
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId, listingId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('message:receive', (data) => {
      if (data.from === recipientId) {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
        
        // Mark as read
        markAsRead(data.from);
      }
    });

    // Listen for typing indicator
    socket.on('typing:indicator', (data) => {
      if (data.from === recipientId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('message:receive');
      socket.off('typing:indicator');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, recipientId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = listingId
        ? `http://localhost:3001/api/chat/messages?userId=${recipientId}&listingId=${listingId}`
        : `http://localhost:3001/api/chat/messages?userId=${recipientId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        scrollToBottom();
        
        // Mark messages as read
        markAsRead(recipientId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (fromUserId) => {
    try {
      await fetch(`http://localhost:3001/api/chat/read?from=${fromUserId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !connected) return;

    const messageData = {
      to: recipientId,
      from: user.id,
      message: newMessage.trim(),
      listingId,
      listingName,
    };

    try {
      // Send via socket for real-time delivery
      socket.emit('message:send', messageData);

      // Save to database
      const response = await fetch('http://localhost:3001/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
        scrollToBottom();
        
        // Stop typing indicator
        socket.emit('typing:stop', { to: recipientId, from: user.id });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    // Send typing indicator
    socket.emit('typing:start', { to: recipientId, from: user.id });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { to: recipientId, from: user.id });
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            {recipientName}
            <FaCircle className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-400'}`} />
          </h3>
          {listingName && (
            <p className="text-xs text-blue-100 truncate">About: {listingName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="hover:bg-blue-700 p-1 rounded transition"
        >
          <FaTimes />
        </button>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="bg-yellow-100 text-yellow-800 text-xs p-2 text-center">
          Connecting...
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSentByMe = msg.from._id === user.id || msg.from === user.id;
            return (
              <div
                key={index}
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isSentByMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isSentByMe ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(msg.timestamp || msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-300 rounded-lg p-3 rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}
