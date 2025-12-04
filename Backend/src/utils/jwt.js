const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES;
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES;

console.log("JWT_SECRET:", JWT_SECRET);
console.log("ACCESS_EXPIRES:", ACCESS_EXPIRES);
console.log("REFRESH_EXPIRES:", REFRESH_EXPIRES);


function signAccessToken(payload){
    return jwt.sign(payload,JWT_SECRET,{expiresIn:ACCESS_EXPIRES});
}

function signRefreshToken(payload){
    return jwt.sign(payload,JWT_SECRET,{expiresIn:REFRESH_EXPIRES});
}

function verifyToken(token){
    try{
        return jwt.verify(token,JWT_SECRET);
    }catch(err){
        return null;
    }
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyToken
}