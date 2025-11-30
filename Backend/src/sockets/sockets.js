const { Server } = require("socket.io");
const socketAuthMiddleware = require("../middleware/socketAuth");
const Worker = require("../models/WorkerProfile.model");
const Message = require("../models/Message.model");

let ioInstance = null;
const presence = new Map();

const toKey = (value) => (value ? value.toString() : "");

function addPresence(userId, socketId) {
  const key = toKey(userId);
  if (!key) return;
  const set = presence.get(key) || new Set();
  set.add(socketId);
  presence.set(key, set);
}

function removePresence(userId, socketId) {
  const key = toKey(userId);
  if (!key) return;
  const set = presence.get(key);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) presence.delete(key);
}

function isUserOnline(userId) {
  const key = toKey(userId);
  const set = presence.get(key);
  return !!(set && set.size);
}

function makeConversationId(a, b) {
  const s1 = toKey(a);
  const s2 = toKey(b);
  if (!s1 || !s2) return "";
  return s1 < s2 ? `${s1}_${s2}` : `${s2}_${s1}`;
}

async function handleMessageSend(socket, payload = {}, ack) {
  try {
    const senderId = socket.userId;
    const receiverId = toKey(payload.receiverId);
    const contentText = payload.contentText?.trim() || "";
    const contentImage = payload.contentImage || null;

    if (!receiverId) {
      return ack?.({ ok: false, error: "receiverId is required" });
    }
    if (!contentText && !contentImage) {
      return ack?.({ ok: false, error: "contentText or contentImage required" });
    }

    const conversationId = makeConversationId(senderId, receiverId);
    const messageDoc = await Message.create({
      conversationId,
      senderId,
      receiverId,
      contentText: contentText || null,
      contentImage,
      isRead: false,
    });

    const io = getIO();
    io.to(`user:${receiverId}`).to(`user:${senderId}`).emit("message:new", messageDoc);
    ack?.({ ok: true, message: messageDoc });
  } catch (err) {
    console.error("message:send error", err);
    ack?.({ ok: false, error: "internal error" });
  }
}

function initSockets(httpServer, options = {}) {
  if (ioInstance) return ioInstance;

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingInterval: 25000,
    pingTimeout: 60000,
    ...options,
  });

  io.use(socketAuthMiddleware());

  io.on("connection", async (socket) => {
    const user = socket.user || {};
    const userId = toKey(user.id || user._id || user.userId);

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.userId = userId;
    socket.join(`user:${userId}`);
    addPresence(userId, socket.id);

    const role = user.role || user.UserType;
    if (role === "worker") {
      socket.join(`worker:${userId}`);
      try {
        const profile = await Worker.findOne({ userId }).lean();
        if (profile?.specialty) {
          socket.join(`specialty:${profile.specialty}`);
        }
      } catch (err) {
        console.warn("worker room join failed", err?.message || err);
      }
    }

    socket.on("message:send", (payload, ack) => handleMessageSend(socket, payload, ack));

    socket.on("typing", (payload = {}) => {
      const receiverId = toKey(payload.receiverId);
      if (!receiverId) return;
      io.to(`user:${receiverId}`).emit("typing", {
        fromUserId: userId,
        typing: !!payload.typing,
        conversationId: payload.conversationId || makeConversationId(userId, receiverId),
      });
    });

    socket.on("disconnect", () => {
      removePresence(userId, socket.id);
    });
  });

  ioInstance = io;
  return io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized — call initSockets first");
  }
  return ioInstance;
}

function emitToUser(userId, event, payload) {
  try {
    const io = getIO();
    io.to(`user:${toKey(userId)}`).emit(event, payload);
    return true;
  } catch (err) {
    console.warn("emitToUser failed", err?.message || err);
    return false;
  }
}

module.exports = {
  initSockets,
  getIO,
  isUserOnline,
  emitToUser,
};