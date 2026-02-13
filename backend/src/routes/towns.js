const express = require('express');
const router = express.Router();
const Town = require('../models/Town');

// Get all towns
router.get('/', async (req, res) => {
  try {
    const towns = await Town.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: towns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get town by ID
router.get('/:id', async (req, res) => {
  try {
    const town = await Town.findById(req.params.id);
    if (!town) {
      return res.status(404).json({
        success: false,
        message: 'Town not found',
      });
    }
    res.status(200).json({
      success: true,
      data: town,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create town (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, latitude, longitude, deliveryFee } = req.body;

    const town = new Town({
      name,
      description,
      latitude,
      longitude,
      deliveryFee: deliveryFee || 5,
    });

    await town.save();
    res.status(201).json({
      success: true,
      data: town,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update town (admin only)
router.put('/:id', async (req, res) => {
  try {
    const town = await Town.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!town) {
      return res.status(404).json({
        success: false,
        message: 'Town not found',
      });
    }

    res.status(200).json({
      success: true,
      data: town,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete town (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const town = await Town.findByIdAndDelete(req.params.id);

    if (!town) {
      return res.status(404).json({
        success: false,
        message: 'Town not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Town deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
