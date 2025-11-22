const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});