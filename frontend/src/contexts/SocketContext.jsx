import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Get user ID from token
    const getUser = () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        if (payload.exp * 1000 < Date.now()) {
          return null;
        }
        
        const user = {
          id: payload.userId || payload.id, // Support both userId and id from JWT payload
          email: payload.email,
        };
        return user;
      } catch (error) {
        console.error("❌ Error parsing token:", error);
        return null;
      }
    };

    const user = getUser();
    if (!user || !user.id) {
      return;
    }

    // Initialize socket connection
    const SOCKET_URL =
      process.env.REACT_APP_SOCKET_URL || "http://localhost:3002";

    console.log("🔌 Connecting to Socket.io server:", SOCKET_URL);

    // Connect to standalone Socket.io server
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setConnected(true);

      // Join with user ID
      console.log("👤 Joining with user ID:", user.id);
      newSocket.emit("user:join", user.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setConnected(false);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setConnected(false);
    });

    // Handle online users list
    newSocket.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    // Handle user coming online
    newSocket.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    // Handle user going offline
    newSocket.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const value = {
    socket,
    connected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.includes(userId),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
