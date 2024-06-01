const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");

// socket-server setup with expressjs
const io = new Server(server, {
  pingTimeout: 50 * 1000, // 50 secs
  cors: { origin: "*" },
});

const connectedClients = new Map();

io.on("connection", (socket) => {
  console.log("A client connected");

  // Store the client's unique identifier (e.g., user ID)
  socket.on("storeClientInfo", (userId) => {
    connectedClients.set(userId, socket.id);
    // Notify other clients that this user is online
    socket.broadcast.emit("userOnline", userId);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A client disconnected");
    // Find the disconnected client's identifier
    const disconnectedUserId = getKeyByValue(connectedClients, socket.id);
    if (disconnectedUserId) {
      connectedClients.delete(disconnectedUserId);
      // Notify other clients that this user is offline
      socket.broadcast.emit("userOffline", disconnectedUserId);
    }
  });
});

// Helper function to get a key from a value in a Map
function getKeyByValue(map, value) {
  for (const [key, val] of map.entries()) {
    if (val === value) {
      return key;
    }
  }
  return null;
}

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
