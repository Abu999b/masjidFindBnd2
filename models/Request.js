const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['admin_access', 'add_masjid', 'edit_masjid', 'delete_masjid'],
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  masjidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Masjid'
  },
  masjidData: {
    name: String,
    address: String,
    latitude: Number,
    longitude: Number,
    prayerTimes: {
      fajr: String,
      dhuhr: String,
      asr: String,
      maghrib: String,
      isha: String,
      jummah: String
    },
    description: String,
    phoneNumber: String
  },
  reason: {
    type: String,
    trim: true
  },
  adminResponse: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', requestSchema);