const User = require("../models/user.model");
const { verifyToken } = require("../utils/jwt");

const normalizeToken = (raw) => {
    if (!raw) return null;
    const token = typeof raw === "string" ? raw : String(raw);
    return token.startsWith("Bearer ") ? token.slice(7).trim() : token;
};

function socketAuthMiddleware() {
    return async (socket, next) => {
        try {
            const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
            const token = normalizeToken(raw);
            if (!token) return next(new Error("Authentication error: token required"));

            const payload = verifyToken(token);
            if (!payload?.id) return next(new Error("Authentication error: invalid token"));

            const user = await User.findById(payload.id).lean();
            if (!user) return next(new Error("Authentication error: user not found"));

            socket.userId = user._id.toString();
            socket.user = {
                id: socket.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.userType,
                UserType: user.userType,
                email: user.email,
            };
            return next();
        } catch (err) {
            console.error("Socket Auth Error:", err);
            return next(new Error("Authentication error"));
        }
    };
}

module.exports = socketAuthMiddleware;