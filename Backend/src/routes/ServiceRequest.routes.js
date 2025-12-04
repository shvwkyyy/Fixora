const express = require('express');
const router = express.Router();
const {
  PostService,
  acceptService,
  getAllServiceRequests,
  getCompletedServicesForWorker,
  getServiceRequestById,
} = require('../controllers/ServiceRequest.controller');
const jwtMiddleware = require('../middleware/jwtMiddleware');
router.post('/', jwtMiddleware, PostService);
router.put('/:id/accept', jwtMiddleware, acceptService);
router.get('/', jwtMiddleware, getAllServiceRequests);
router.get('/:id', jwtMiddleware, getServiceRequestById);
router.get('/worker/:workerId/completed', jwtMiddleware, getCompletedServicesForWorker);
module.exports = router;
