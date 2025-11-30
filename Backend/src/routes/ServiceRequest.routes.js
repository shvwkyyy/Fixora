const express = require('express');
const router = express.Router();
const {
  PostService,
  acceptService,
  getAllServiceRequests,
  getCompletedServicesForWorker,
} = require('../controllers/ServiceRequest.controller');
const jwtMiddleware = require('../middleware/jwtMiddleware');
router.post('/', jwtMiddleware, PostService);
router.put('/:id/accept', jwtMiddleware, acceptService);
router.get('/', jwtMiddleware, getAllServiceRequests);
router.get('/worker/:workerId/completed', jwtMiddleware, getCompletedServicesForWorker);
module.exports = router;
