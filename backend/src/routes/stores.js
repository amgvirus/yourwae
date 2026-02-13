const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const { town, category } = req.query;
    let filter = { isActive: true };

    if (town) {
      filter.town = town;
    }

    if (category) {
      filter.category = category;
    }

    const stores = await Store.find(filter)
      .populate('owner', 'firstName lastName email phone')
      .populate('town', 'name');

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .populate('town', 'name');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get stores by town
router.get('/town/:townId', async (req, res) => {
  try {
    const stores = await Store.find({
      town: req.params.townId,
      isActive: true,
    })
      .populate('owner', 'firstName lastName email phone')
      .populate('town', 'name');

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create store
router.post('/', async (req, res) => {
  try {
    const {
      owner,
      town,
      storeName,
      storeDescription,
      category,
      address,
      phone,
      email,
      operatingHours,
      baseDeliveryFee,
      deliveryFeePerKm,
      minimumOrderValue,
    } = req.body;

    const store = new Store({
      owner,
      town,
      storeName,
      storeDescription,
      category,
      address,
      phone,
      email,
      operatingHours,
      baseDeliveryFee: baseDeliveryFee || 5,
      deliveryFeePerKm: deliveryFeePerKm || 2,
      minimumOrderValue: minimumOrderValue || 0,
    });

    await store.save();
    await store.populate('owner', 'firstName lastName email phone');
    await store.populate('town', 'name');

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update store
router.put('/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('owner', 'firstName lastName email phone')
      .populate('town', 'name');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete store
router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
