const { verifyToken } = require("../utils/jwt");

function extractToken(req) {
    const header = req.headers.authorization || req.headers.Authorization;
    if (header && typeof header === "string" && header.startsWith("Bearer ")) {
        return header.slice(7).trim();
    }
    if (req.cookies?.accessToken) return req.cookies.accessToken;
    return null;
}

function jwtMiddleware(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ ok: false, error: "token required" });
        }

        const payload = verifyToken(token);
        if (!payload || !payload.id) {
            return res.status(401).json({ ok: false, error: "invalid or expired token" });
        }

        req.authToken = token;
        req.user = {
            id: payload.id,
            role: payload.role || "user",
        };

        next();
    } catch (err) {
        console.error("jwtMiddleware error", err);
        return res.status(401).json({ ok: false, error: "invalid or expired token" });
    }
}

module.exports = jwtMiddleware;