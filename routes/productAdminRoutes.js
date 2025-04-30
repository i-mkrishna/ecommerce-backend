const express = require('express');
const Product = require('../models/Product');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// @route GET /api/admin/products
// @desc Get all products (Admin only)
// @access Private/Admin

router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;