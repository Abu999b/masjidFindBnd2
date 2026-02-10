const express = require('express');
const {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserRole
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('main_admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('main_admin'), updateUserRole);

module.exports = router;