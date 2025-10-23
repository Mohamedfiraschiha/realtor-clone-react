import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      return;
    }

    // Initialize socket connection
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    
    // First, initialize the Socket.io server by calling the API endpoint
    fetch(`${SOCKET_URL}/api/socket`).catch(console.error);
    
    // Then connect to Socket.io
    const newSocket = io(SOCKET_URL, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      
      // Join with user ID
      newSocket.emit('user:join', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // Handle online users list
    newSocket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    // Handle user coming online
    newSocket.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    // Handle user going offline
    newSocket.on('user:offline', ({ userId }) => {
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
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
