const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis.js");
const initSockets = require("./sockets/sockets");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 4000;
(async ()=>{
  try{
    await connectDB();
    if(connectRedis) await connectRedis();
    const server = http.createServer(app);
    const io = initSockets(server);
    server.listen(PORT,()=>console.log("server is running on port", PORT));
  }catch(err){
    console.error("startup error",err);
    process.exit(1);
  }
})();