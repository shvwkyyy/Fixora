const { verifyToken } = require("../utils/jwt");
function jwtMiddleware(req,res,next){
    const raw = req.headers.authorization || "";
    const token = typeof raw ==="string" && raw.startsWith("Bearer ") ? raw.split(" ")[1] : raw;
    if(!token) return res.status(401).json({ok:false , error : "token required"});
    const payload = verifyToken(token);
    if(!payload)return res.status(401).json({ok:false,error:"invalid or expired token"});
    req.user = payload;
    next();
} 
module.exports = jwtMiddleware;