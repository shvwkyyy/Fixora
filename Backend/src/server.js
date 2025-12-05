require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSockets }= require("./sockets/sockets");
const PORT = process.env.PORT || 4000;


(async ()=>{
  try{
    await connectDB();
    const server = http.createServer(app);
    initSockets(server);
    server.listen(PORT,()=>console.log("server is running on port", PORT));
  }catch(err){
    console.error("startup error",err);
    process.exit(1);
  }
})();