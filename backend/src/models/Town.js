const mongoose = require('mongoose');

const townSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a town name'],
      unique: true,
      trim: true,
      enum: ['Hohoe', 'Dzodze', 'Anloga'],
    },
    description: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Town', townSchema);
