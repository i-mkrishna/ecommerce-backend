const express = require("express");
const Checkout = require("../models/Checkout");
const { protect } = require("../middlewares/authMiddleware");

const {
  createCheckout,
  updatePaymentStatus,
  finalizeCheckout,
} = require("../controllers/checkoutController");

const router = express.Router();

// create a new checkout
router.post("/", protect, createCheckout);

// Update the payement status
router.put("/:id/pay", protect, updatePaymentStatus);

// finaliize the checkout to order
router.post("/:id/finalize", protect, finalizeCheckout);

module.exports = router;
