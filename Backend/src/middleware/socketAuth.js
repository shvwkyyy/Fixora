const User = require("../models/user.model.js");
const { verifyToken } = require("../utils/jwt");

function socketAuthMiddleware(){
    return async (socket,next)=>{
        try{
            const raw = socket.handshake.auth?.token||socket.handshake.headers?.authorization;
            if(!raw)return next(new Error("Authentication error: token required"));
            const token = String(raw).startsWith("Bearer ")?raw.split(" ")[1]:raw;
            const payload = verifyToken(token);
            if(!payload||!payload.id)return next(new Error("Authentication error: invalid token"));
             socket.userId = String(payload.id);
             return next();
        }catch(err){
            console.error("Socket Auth Error:",err);
            return next(new Error("Authentication error"));
        }
    };
}
module.exports = socketAuthMiddleware;