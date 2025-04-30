const express = require("express");
const Order = require("../models/Order");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// @route GET /api/admin/orders
// @desc Get all orders (Admin only)
// @access Private/Admin
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route PUT /api/admin/orders/:id
// @desc Update order status (Admin only)
// @access Private/Admin

router.put("/:id", protect, isAdmin, async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  // Validate input
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const order = await Order.findById(orderId).populate("user", "name");
    if (order) {
      order.status = req.body.status || order.status;
      order.isDelivered =
        req.body.status === "Delivered" ? true : order.isDelivered;
      order.deliveredAt =
        req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/admin/orders/:id
// @desc Delete an order (Admin only)
// @access Private/Admin

router.delete("/:id", protect, isAdmin, async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (order) {
      await order.deleteOne();
      res.status(200).json({ message: "Order removed" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
