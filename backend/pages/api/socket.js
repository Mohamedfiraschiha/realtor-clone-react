import { Server } from "socket.io";

const userSockets = new Map(); // Map userId to socketId
const onlineUsers = new Set(); // Track online users

export default function SocketHandler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  if (res.socket.server.io) {
    console.log("Socket is already running");
    res.status(200).end();
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Handle user joining
      socket.on("user:join", (userId) => {
        userSockets.set(userId, socket.id);
        onlineUsers.add(userId);
        socket.userId = userId;

        // Notify others that user is online
        io.emit("user:online", { userId, socketId: socket.id });

        // Send list of online users to the newly connected user
        socket.emit("users:online", Array.from(onlineUsers));

        console.log(`User ${userId} joined. Online users:`, onlineUsers.size);
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
        }

        // Send confirmation back to sender
        socket.emit("message:sent", messageData);

        console.log(`Message from ${from} to ${to}: ${message}`);
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

          console.log(
            `User ${socket.userId} disconnected. Online users:`,
            onlineUsers.size
          );
        }
        console.log("User disconnected:", socket.id);
      });
    });

    console.log("Socket.io server initialized");
  }
  res.status(200).end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
