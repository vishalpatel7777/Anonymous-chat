const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Track connected users
const connectedUsers = new Set();

// serve the public folder
app.use(express.static(join(__dirname, "public")));

// serve the index.html on root request
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

// Serve service worker
app.get("/service-worker.js", (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(join(__dirname, "public", "service-worker.js"));
});

// listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  // Add user to connected users
  connectedUsers.add(socket.id);
  
  // Send current users list to the new user
  socket.emit('users-list', Array.from(connectedUsers));
  
  // Notify all OTHER clients that a new user joined
  socket.broadcast.emit('user-connected', socket.id);

  // Send welcome message to the connected client only
  socket.emit("message-from-server", "Welcome to Anonymous Chat!");
  
  socket.on("message-from-client", (msg) => {
    console.log(`Message from ${socket.id}: ${msg}`);
    
    // Send message to all OTHER clients (not the sender)
    socket.broadcast.emit("message-from-server", {
      message: msg,
      senderId: socket.id
    });
    
    // Send notification event to ALL clients (including sender) for browser notification
    io.emit("new-message-notification", {
      senderName: socket.id.substring(0, 8),
      message: msg
    });
  });

  // acknowledge 
  socket.emit('greeting', 'Hello! You are connected to the server.', (response) => {
    console.log(`Acknowledgment from ${socket.id}:`, response);
  });
  
  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    
    // Remove user from connected users
    connectedUsers.delete(socket.id);
    
    // Notify all clients that user left
    io.emit('user-disconnected', socket.id);
  });
});

// server start
server.listen(
  PORT,
  console.log(`Server is running on http://localhost:${PORT}`)
);
