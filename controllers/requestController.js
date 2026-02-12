const Request = require('../models/Request');
const Masjid = require('../models/Masjid');
const User = require('../models/User');

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { type, masjidId, masjidData, reason } = req.body;

    // Validate request type
    if (!['admin_access', 'add_masjid', 'edit_masjid', 'delete_masjid'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request type'
      });
    }

    // Check if user already has pending admin access request
    if (type === 'admin_access') {
      const existingRequest = await Request.findOne({
        requestedBy: req.user.id,
        type: 'admin_access',
        status: 'pending'
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending admin access request'
        });
      }
    }

    const request = await Request.create({
      type,
      requestedBy: req.user.id,
      masjidId,
      masjidData,
      reason
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('requestedBy', 'name email')
      .populate('masjidId', 'name address');

    res.status(201).json({
      success: true,
      data: populatedRequest,
      message: 'Request submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private/Main Admin
exports.getAllRequests = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const requests = await Request.find(filter)
      .populate('requestedBy', 'name email role')
      .populate('masjidId', 'name address')
      .populate('processedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's own requests
// @route   GET /api/requests/my-requests
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requestedBy: req.user.id })
      .populate('masjidId', 'name address')
      .populate('processedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Process request (approve/reject)
// @route   PUT /api/requests/:id/process
// @access  Private/Main Admin
exports.processRequest = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    request.status = status;
    request.adminResponse = adminResponse;
    request.processedBy = req.user.id;

    // If approved, execute the action
    if (status === 'approved') {
      switch (request.type) {
        case 'admin_access':
          await User.findByIdAndUpdate(request.requestedBy, { role: 'admin' });
          break;

        case 'add_masjid':
          await Masjid.create({
            ...request.masjidData,
            location: {
              type: 'Point',
              coordinates: [request.masjidData.longitude, request.masjidData.latitude]
            },
            addedBy: request.requestedBy
          });
          break;

        case 'edit_masjid':
          await Masjid.findByIdAndUpdate(request.masjidId, {
            ...request.masjidData,
            location: request.masjidData.latitude && request.masjidData.longitude ? {
              type: 'Point',
              coordinates: [request.masjidData.longitude, request.masjidData.latitude]
            } : undefined
          });
          break;

        case 'delete_masjid':
          await Masjid.findByIdAndDelete(request.masjidId);
          break;
      }
    }

    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('requestedBy', 'name email role')
      .populate('masjidId', 'name address')
      .populate('processedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedRequest,
      message: `Request ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private (own requests only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only allow user to delete their own pending requests
    if (request.requestedBy.toString() !== req.user.id && req.user.role !== 'main_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete processed requests'
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};