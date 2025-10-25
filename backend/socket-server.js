const { createServer } = require('http');
const { Server } = require('socket.io');

const userSockets = new Map(); // Map userId to socketId
const onlineUsers = new Set(); // Track online users

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Handle user joining
  socket.on("user:join", (userId) => {
    userSockets.set(userId, socket.id);
    onlineUsers.add(userId);
    socket.userId = userId;

    // Notify others that user is online
    io.emit("user:online", { userId, socketId: socket.id });

    // Send list of online users to the newly connected user
    socket.emit("users:online", Array.from(onlineUsers));

    console.log(`👤 User ${userId} joined. Online users: ${onlineUsers.size}`);
  });

  // Handle sending message
  socket.on("message:send", (data) => {
    const { to, from, message, listingId, listingName } = data;
    const recipientSocketId = userSockets.get(to);

    const messageData = {
      from,
      to,
      message,
      listingId,
      listingName,
      timestamp: new Date().toISOString(),
    };

    // Send to recipient if online
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message:receive", messageData);
      console.log(`📨 Message delivered to ${to}`);
    } else {
      console.log(`📭 Recipient ${to} is offline`);
    }

    // Send confirmation back to sender
    socket.emit("message:sent", messageData);

    console.log(`💬 Message from ${from} to ${to}: ${message.substring(0, 50)}...`);
  });

  // Handle typing indicator
  socket.on("typing:start", (data) => {
    const recipientSocketId = userSockets.get(data.to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing:indicator", {
        from: data.from,
        isTyping: true,
      });
    }
  });

  socket.on("typing:stop", (data) => {
    const recipientSocketId = userSockets.get(data.to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing:indicator", {
        from: data.from,
        isTyping: false,
      });
    }
  });

  // Handle read receipts
  socket.on("message:read", (data) => {
    const senderSocketId = userSockets.get(data.from);
    if (senderSocketId) {
      io.to(senderSocketId).emit("message:read", {
        by: socket.userId,
        messageId: data.messageId,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      onlineUsers.delete(socket.userId);

      // Notify others that user is offline
      io.emit("user:offline", { userId: socket.userId });

      console.log(`👋 User ${socket.userId} disconnected. Online users: ${onlineUsers.size}`);
    }
    console.log("❌ Socket disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`🔗 Accepting connections from http://localhost:3000`);
});
