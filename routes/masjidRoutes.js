const express = require('express');
const {
  getAllMasjids,
  getNearbyMasjids,
  getMasjid,
  createMasjid,
  updateMasjid,
  deleteMasjid
} = require('../controllers/masjidController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllMasjids);
router.get('/nearby', getNearbyMasjids);
router.get('/:id', getMasjid);

// Protected routes (admin only)
router.post('/', protect, authorize('admin', 'main_admin'), createMasjid);
router.put('/:id', protect, authorize('admin', 'main_admin'), updateMasjid);
router.delete('/:id', protect, authorize('admin', 'main_admin'), deleteMasjid);

module.exports = router;