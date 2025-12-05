const ServiceRequest = require("../models/ServiceRequest.model");
const { getIO } = require("../sockets/sockets");                  
const { createNotification } = require("./notification.controller");
const PostService = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ ok: false, error: "authentication required" });
    }

    const { problemDescription } = req.body;
    if (!problemDescription || !problemDescription.trim()) {
      return res.status(400).json({ ok: false, error: "problemDescription required" });
    }

    const reqDoc = await ServiceRequest.create({
      userId,
      problemDescription: problemDescription.trim(),
      status: "pending",
      assignedWorker: null,
    });
    res.status(201).json({ ok: true, request: reqDoc });
  } catch (err) {
    console.error("create request error", err);
    res.status(500).json({ ok: false, error: "internal error" });
  }
};
const acceptService = async (req, res) => {
  try {
    const workerId = req.user?.id || req.user?._id;
    if (!workerId) {
      return res.status(401).json({ ok: false, error: "authentication required" });
    }
    
    // Verify user is a worker by checking userType in database
    const User = require("../models/user.model");
    const user = await User.findById(workerId).select("userType").lean();
    if (!user || user.userType !== "worker") {
      return res.status(403).json({ ok: false, error: "only workers can accept requests" });
    }
    
    const requestId = req.params.id;
    if (!requestId) return res.status(400).json({ ok: false, error: "request id required" });
    const updated = await ServiceRequest.findOneAndUpdate(
      { _id: requestId, status: "pending", assignedWorker: null },
      { $set: { status: "accepted", assignedWorker: workerId, acceptedAt: new Date() } },
      { new: true }
    ).populate('userId', 'firstName lastName email phone');
    if (!updated) {
      return res.status(400).json({ ok: false, error: "request not available (maybe already accepted)" });
    }
    try {
      const io = getIO();
      const clientId = String(updated.userId);
      const payload = {
        requestId: updated._id,
        workerId: String(workerId),
        acceptedAt: updated.acceptedAt,
      };
      io.to(`user:${clientId}`).emit("request:accepted", payload);
      await createNotification({
        userId: clientId,
        senderId: workerId,
        content: "Your service request was accepted",
        type: "service_request_accepted",
      });
    } catch (e) {
      console.warn("notification dispatch failed:", e?.message || e);
    }
    return res.json({ ok: true, request: updated });
  } catch (err) {
    console.error("accept request error", err);
    return res.status(500).json({ ok: false, error: "internal error" });
  }
};
const getAllServiceRequests = async (req, res) => {
  try {
    const { status, userId, assignedWorker, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (assignedWorker) filter.assignedWorker = assignedWorker;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    // Execute query with pagination
    const [requests, total] = await Promise.all([
      ServiceRequest.find(filter)
        .populate('userId', 'firstName lastName email phone')
        .populate('assignedWorker', 'userId specialty hourPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ServiceRequest.countDocuments(filter)
    ]);
    
    res.json({
      ok: true,
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('get all service requests error', err);
    res.status(500).json({ ok: false, error: 'internal error' });
  }
};

const getCompletedServicesForWorker = async (req, res) => {
  try {
    const workerId = req.params.workerId || req.user?.id || req.user?._id;
    if (!workerId) {
      return res.status(400).json({ ok: false, error: 'workerId required' });
    }
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const [completedServices, total] = await Promise.all([
      ServiceRequest.find({
        assignedWorker: workerId,
        status: 'completed'
      })
        .populate('userId', 'firstName lastName email phone city area')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ServiceRequest.countDocuments({
        assignedWorker: workerId,
        status: 'completed'
      })
    ]);
    
    res.json({
      ok: true,
      completedServices,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('get completed services for worker error', err);
    res.status(500).json({ ok: false, error: 'internal error' });
  }
};

const getServiceRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!requestId) {
      return res.status(400).json({ ok: false, error: "request id required" });
    }

    const request = await ServiceRequest.findById(requestId)
      .populate('userId', 'firstName lastName email phone city area profilePhoto')
      .populate('assignedWorker', 'userId specialty hourPrice')
      .lean();

    if (!request) {
      return res.status(404).json({ ok: false, error: "service request not found" });
    }

    return res.json({ ok: true, request });
  } catch (err) {
    console.error('get service request by id error', err);
    return res.status(500).json({ ok: false, error: 'internal error' });
  }
};

module.exports = {
  PostService,
  acceptService,
  getAllServiceRequests,
  getCompletedServicesForWorker,
  getServiceRequestById,
};
