const express = require('express');
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  processRequest,
  deleteRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post('/', protect, createRequest);
router.get('/my-requests', protect, getMyRequests);
router.delete('/:id', protect, deleteRequest);

// Main admin routes
router.get('/', protect, authorize('main_admin'), getAllRequests);
router.put('/:id/process', protect, authorize('main_admin'), processRequest);

module.exports = router;