const Checkout = require("../models/Checkout");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// @desc Create a new checkout session
// @route POST /api/checkout
// @access Private
const createCheckout = async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }

  if (!shippingAddress || !paymentMethod) {
    return res
      .status(400)
      .json({ message: "Shipping address and payment method are required" });
  }

  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newCheckout = new Checkout({
      user: req.user,
      checkoutItems: checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });

    const savedCheckout = await newCheckout.save();

    res.status(201).json(savedCheckout);
  } catch (error) {
    console.error("Error creating checkout:", error);
    res.status(500).json({ message: error.message });
  }
};

// desc Update checkout to mark  as paid after successful payment
// @route PUT /api/checkout/:id/pay
// @access Private

const updatePaymentStatus = async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  console.log(req.body);
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    if (paymentStatus === "Paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();

      await checkout.save();
      res
        .status(200)
        .json({ message: "Checkout updated successfully", checkout });
    } else {
      return res.status(400).json({ message: "Invalid payment status" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating checkout" });
  }
};

// @desc Finalize checkout and convert to an order after payment confirmation
// @route POST /api/checkout/:id/finalize
// @access Private

const finalizeCheckout = async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (checkout.isPaid && !checkout.isFinalized) {
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: checkout.paymentStatus,
        paymentDetails: checkout.paymentDetails,
      });

      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();

      await Cart.deleteOne({ user: checkout.user });

      res.status(200).json({ message: "Finalized final order", finalOrder });
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error finalizing checkout" });
  }
};


module.exports = {
  createCheckout,
  updatePaymentStatus,
  finalizeCheckout,
};
