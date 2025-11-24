const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const mongoose = require("mongoose");
const { createAdapter } = require("@socket.io/redis-adapter");
const { redisClient } = require("../config/redis");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/user.model");
const Worker = require("../models/WorkerProfile.model")
async function allowAction(redis, key, limit = 30, windowSec = 60) {
  const v = await redis.incr(key);
  if (v === 1) await redis.expire(key, windowSec);
  return v <= limit;
}

async function cacheGet(redis, key) {
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

async function cacheSet(redis, key, value, ttlSeconds = 30) {
  await redis.setEx(key, ttlSeconds, JSON.stringify(value));
}

async function addOnlineSocket(redis, userId, socketId) {
  await redis.sAdd(`online:${userId}`, socketId);
  await redis.expire(`online:${userId}`, 60 * 60 * 24);
}

async function removeOnlineSocket(redis, userId, socketId) {
  await redis.sRem(`online:${userId}`, socketId);
  const remaining = await redis.sCard(`online:${userId}`);
  if (remaining === 0) await redis.del(`online:${userId}`);
}
async function isUserOnline(redis, userId) {
  const c = await redis.sCard(`online:${userId}`);
  return c > 0;
}
async function findNearbyWorkers(redis, coordinates, maxDistance = 5000, specialty) {
  const lng = Number(coordinates[0]).toFixed(4);
  const lat = Number(coordinates[1]).toFixed(4);
  const key = `nearby:${lng}:${lat}:${specialty || "any"}:${maxDistance}`;
  const cached = await cacheGet(redis, key);
  if (cached) return cached;

  const agg = [
    {
      $geoNear: {
        near: { type: "Point", coordinates },
        distanceField: "distance",
        spherical: true,
        maxDistance,
      },
    },
    { $lookup: { from: "users", localField: "UserId", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1, UserId: 1, Specialty: 1, HourPrice: 1, distance: 1,
        "user.FName": 1, "user.LName": 1, "user.location": 1,
      },
    },
  ];
  if (specialty) agg.splice(1, 0, { $match: { Specialty: specialty } });
  const workers = await Worker.aggregate(agg);
  await cacheSet(redis, key, workers, 20);
  return workers;
}
async function initSockets(httpServer, options = {}) {
  if (typeof connectRedisIfNeeded === "function") {
    await connectRedisIfNeeded();
  } else if (redisClient && !redisClient.isOpen) {
    try { await redisClient.connect(); } catch (e) { /* ignore */ }
  }
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_ORIGIN || "*", methods: ["GET", "POST"] },
    pingInterval: 25000,
    pingTimeout: 60000,
    ...options.ioOptions,
  });
  const redisUrl = process.env.REDIS_URL || options.redisAdapterUrl;
  if (redisUrl) {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ socket.io redis adapter connected");
  } else if (redisClient && redisClient.isOpen) {
    try {
      const pub = redisClient.duplicate ? redisClient.duplicate() : createClient({ url: process.env.REDIS_URL });
      const sub = pub.duplicate ? pub.duplicate() : createClient({ url: process.env.REDIS_URL });
      if (pub.connect) await pub.connect();
      if (sub.connect) await sub.connect();
      io.adapter(createAdapter(pub, sub));
      console.log("✅ socket.io redis adapter connected (from existing client)");
    } catch (e) {
      console.warn("⚠️ adapter from existing client failed:", e.message);
    }
  } else {
    console.warn("⚠️ No Redis adapter configured — single-process broadcasts only");
  }
  io.use(socketAuthMiddleware());
  io.on("connection", (socket) => {
    const user = socket.user;
    const userId = socket.userId;
    const socketId = socket.id;
    console.log(`socket connected: ${socketId} user:${userId} type:${user?.UserType || user?.role || "N/A"}`);
    socket.join(`user:${userId}`);
    (async () => {
      try {
        const userDoc = (user && user._id) ? user : await User.findById(userId).lean();
        if ((userDoc?.UserType || userDoc?.role) === "worker") {
          socket.join(`worker:${userId}`);
          try {
            const wp = await Worker.findOne({ UserId: userId }).lean();
            if (wp?.Specialty) socket.join(`specialty:${wp.Specialty}`);
          } catch (e) {  }
        }
      } catch (e) {  }
    })();
    (async () => {
      try {
        if (redisClient && redisClient.isOpen) {
          await addOnlineSocket(redisClient, userId, socketId);
          io.to(`user:${userId}`).emit("presence:connected", { userId, socketId });
        }
      } catch (e) {
        console.error("presence set error", e);
      }
    })();
    (async () => {
      try {
        if (redisClient && redisClient.isOpen) {
          const listKey = `offline_msgs:${userId}`;
          const msgs = await redisClient.lRange(listKey, 0, -1);
          if (msgs && msgs.length) {
            msgs.reverse().forEach(m => {
              const parsed = JSON.parse(m);
              io.to(`user:${userId}`).emit("message:new", parsed);
            });
            await redisClient.del(listKey);
          }
        }
      } catch (e) {
        console.error("deliver offline msgs error", e);
      }
    })();
    socket.on("job:create", async (payload, ack) => {
      try {
        if (!payload || !Array.isArray(payload.coordinates)) return ack?.({ ok: false, error: "coordinates required" });
        const { coordinates, specialty, jobData } = payload;
        if (!specialty) return ack?.({ ok: false, error: "specialty required" });
        if (redisClient && redisClient.isOpen) {
          const ok = await allowAction(redisClient, `rl:user:${userId}:job_create`, 10, 60);
          if (!ok) return ack?.({ ok: false, error: "rate_limited" });
        }

        let jobDoc = null;
        if (Job) {
          jobDoc = await Job.create({
            clientUserId: userId,
            location: { type: "Point", coordinates },
            specialty,
            jobData: jobData || {},
            status: "open",
          });
        }

        return ack?.({ ok: true, jobId: jobDoc ? jobDoc._id : null });
      } catch (err) {
        console.error("job:create error", err);
        return ack?.({ ok: false, error: "internal error" });
      }
    });

    socket.on("job:apply", async (payload, ack) => {
      try {
        if (((user?.UserType) || (user?.role)) !== "worker") return ack?.({ ok: false, error: "only workers can apply" });
        const { jobId, proposal } = payload || {};
        if (!jobId) return ack?.({ ok: false, error: "jobId required" });
        if (!Job) return ack?.({ ok: false, error: "job model not configured" });

        const job = await Job.findById(jobId);
        if (!job) return ack?.({ ok: false, error: "job not found" });
        if (job.status !== "open") return ack?.({ ok: false, error: "job not open" });

        const already = job.applicants?.some(a => String(a.workerUserId) === String(userId));
        if (already) return ack?.({ ok: false, error: "already applied" });

        const applicant = { workerUserId: userId, proposal: proposal || {}, createdAt: new Date() };
        job.applicants = job.applicants || [];
        job.applicants.push(applicant);
        await job.save();

        const clientId = String(job.clientUserId);
        io.to(`user:${clientId}`).emit("job:applied", {
          jobId: job._id,
          applicant: {
            id: userId,
            name: user?.FName ? `${user.FName} ${user.LName}` : undefined,
            proposal: applicant.proposal,
            appliedAt: applicant.createdAt,
          },
        });

        return ack?.({ ok: true });
      } catch (err) {
        console.error("job:apply error", err);
        return ack?.({ ok: false, error: "internal error" });
      }
    });

    socket.on("message:send", async (payload, ack) => {
      try {
        const { toUserId, text, jobId } = payload || {};
        if (!toUserId || !text) return ack?.({ ok: false, error: "toUserId and text required" });

        // rate limit
        if (redisClient && redisClient.isOpen) {
          const ok = await allowAction(redisClient, `rl:user:${userId}:message_send`, 60, 60);
          if (!ok) return ack?.({ ok: false, error: "rate_limited" });
        }

        const message = {
          _id: new mongoose.Types.ObjectId(),
          from: { id: userId, name: user?.FName ? `${user.FName} ${user.LName}` : undefined },
          to: toUserId,
          text,
          jobId: jobId || null,
          createdAt: new Date(),
        };

        if (Message) {
          try { await Message.create({ fromUserId: userId, toUserId, text, jobId }); } catch (e) { console.warn("Message save error:", e.message); }
        }

        io.to(`user:${toUserId}`).to(`user:${userId}`).emit("message:new", message);

        if (redisClient && redisClient.isOpen) {
          const online = await isUserOnline(redisClient, toUserId);
          if (!online) {
            await redisClient.lPush(`offline_msgs:${toUserId}`, JSON.stringify(message));
            await redisClient.expire(`offline_msgs:${toUserId}`, 60 * 60 * 24 * 7);
          }
        }

        return ack?.({ ok: true, message });
      } catch (err) {
        console.error("message:send error", err);
        return ack?.({ ok: false, error: "internal error" });
      }
    });

    socket.on("typing", (payload) => {
      const { toUserId, typing, jobId } = payload || {};
      if (!toUserId) return;
      io.to(`user:${toUserId}`).emit("typing", { fromUserId: userId, typing: !!typing, jobId: jobId || null });
    });

    socket.on("job:accept", async (payload, ack) => {
      try {
        if (((user?.UserType) || (user?.role)) !== "worker") return ack?.({ ok: false, error: "only workers" });
        const { jobId, clientUserId } = payload || {};
        if (!jobId || !clientUserId) return ack?.({ ok: false, error: "jobId and clientUserId required" });
        if (!Job) return ack?.({ ok: false, error: "job model not configured" });

        const job = await Job.findById(jobId);
        if (!job) return ack?.({ ok: false, error: "job not found" });
        if (job.status !== "open") return ack?.({ ok: false, error: "job not open" });

        job.status = "assigned";
        job.assignedWorker = userId;
        job.assignedAt = new Date();
        await job.save();

        io.to(`user:${clientUserId}`).emit("job:accepted", {
          jobId,
          worker: { id: userId, name: user?.FName ? `${user.FName} ${user.LName}` : undefined },
          acceptedAt: new Date(),
        });

        return ack?.({ ok: true });
      } catch (err) {
        console.error("job:accept err", err);
        return ack?.({ ok: false, error: "internal error" });
      }
    });

    socket.on("disconnect", async (reason) => {
      console.log(`socket disconnected: ${socketId} reason:${reason}`);
      try {
        if (redisClient && redisClient.isOpen) {
          await removeOnlineSocket(redisClient, userId, socketId);
        }
      } catch (e) {
        console.error("presence clear error", e);
      }
      io.to(`user:${userId}`).emit("presence:disconnected", { userId, socketId });
    });

  });

  return io;
}

module.exports = initSockets;