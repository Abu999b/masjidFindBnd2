const mongoose = require('mongoose');

const prayerTimeSchema = new mongoose.Schema({
  fajr: { type: String, required: true },
  dhuhr: { type: String, required: true },
  asr: { type: String, required: true },
  maghrib: { type: String, required: true },
  isha: { type: String, required: true },
  jummah: { type: String, default: '' }
}, { _id: false });

const masjidSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Masjid name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  prayerTimes: {
    type: prayerTimeSchema,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Create geospatial index for location-based queries
masjidSchema.index({ location: '2dsphere' });

// Update the updatedAt timestamp before saving
masjidSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Masjid', masjidSchema);