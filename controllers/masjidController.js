const Masjid = require('../models/Masjid');

// @desc    Get all masjids
// @route   GET /api/masjids
// @access  Public
exports.getAllMasjids = async (req, res) => {
  try {
    const masjids = await Masjid.find().populate('addedBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: masjids.length,
      data: masjids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get nearby masjids
// @route   GET /api/masjids/nearby
// @access  Public
exports.getNearbyMasjids = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude'
      });
    }

    const masjids = await Masjid.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('addedBy', 'name email');

    res.status(200).json({
      success: true,
      count: masjids.length,
      data: masjids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single masjid
// @route   GET /api/masjids/:id
// @access  Public
exports.getMasjid = async (req, res) => {
  try {
    const masjid = await Masjid.findById(req.params.id).populate('addedBy', 'name email');

    if (!masjid) {
      return res.status(404).json({
        success: false,
        message: 'Masjid not found'
      });
    }

    res.status(200).json({
      success: true,
      data: masjid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new masjid
// @route   POST /api/masjids
// @access  Private/Admin (Main Admin only can directly add)
exports.createMasjid = async (req, res) => {
  try {
    const { name, address, latitude, longitude, prayerTimes, description, phoneNumber } = req.body;

    if (!name || !address || !latitude || !longitude || !prayerTimes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Only main_admin can directly create, others need approval
    if (req.user.role !== 'main_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can directly add masjids. Please submit a request.'
      });
    }

    const masjid = await Masjid.create({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      prayerTimes,
      description,
      phoneNumber,
      addedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: masjid,
      message: 'Masjid created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update masjid
// @route   PUT /api/masjids/:id
// @access  Private/Main Admin only
exports.updateMasjid = async (req, res) => {
  try {
    const { name, address, latitude, longitude, prayerTimes, description, phoneNumber } = req.body;

    let masjid = await Masjid.findById(req.params.id);

    if (!masjid) {
      return res.status(404).json({
        success: false,
        message: 'Masjid not found'
      });
    }

    // Only main_admin can directly update
    if (req.user.role !== 'main_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can directly update masjids. Please submit a request.'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (prayerTimes) updateData.prayerTimes = prayerTimes;
    
    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    masjid = await Masjid.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: masjid,
      message: 'Masjid updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete masjid
// @route   DELETE /api/masjids/:id
// @access  Private/Main Admin only
exports.deleteMasjid = async (req, res) => {
  try {
    const masjid = await Masjid.findById(req.params.id);

    if (!masjid) {
      return res.status(404).json({
        success: false,
        message: 'Masjid not found'
      });
    }

    // Only main_admin can delete
    if (req.user.role !== 'main_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can delete masjids'
      });
    }

    await masjid.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Masjid deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};