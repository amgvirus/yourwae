const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    pickupLocation: {
      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
      },
      latitude: Number,
      longitude: Number,
      address: String,
    },
    deliveryLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    distance: {
      type: Number,
      description: 'km',
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'assigned',
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    pickupTime: Date,
    deliveryTime: Date,
    otp: String,
    otpVerified: {
      type: Boolean,
      default: false,
    },
    trackingUpdates: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        location: {
          latitude: Number,
          longitude: Number,
        },
        note: String,
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
