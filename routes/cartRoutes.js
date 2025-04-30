const express = require("express");
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const { protect } = require("../middlewares/authMiddleware.js");

const { addToCart, updateQuantity, deleteFromCart, getCartData, mergeCarts} = require("../controllers/CartController.js");

const router = express.Router();

// @route POST /api/cart
router.post("/", addToCart);
router.put("/", updateQuantity);
router.delete("/", deleteFromCart);
router.get("/", getCartData);
router.post("/merge", mergeCarts);

module.exports = router;
