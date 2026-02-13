const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    town: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Town',
      required: [true, 'Please select a town'],
    },
    storeName: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
    },
    storeDescription: {
      type: String,
      default: '',
    },
    storeImage: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['grocery', 'electronics', 'pharmacy', 'fashion', 'beauty', 'home', 'food', 'other'],
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    deliveryRadius: {
      type: Number,
      default: 5,
      description: 'km',
    },
    baseDeliveryFee: {
      type: Number,
      default: 5,
    },
    deliveryFeePerKm: {
      type: Number,
      default: 2,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
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

// Index for geospatial queries
storeSchema.index({ 'address.latitude': 1, 'address.longitude': 1 });

module.exports = mongoose.model('Store', storeSchema);
