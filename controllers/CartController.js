const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");

// Helper to get cart based on userId or guestId
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

// @desc Add a product to the cart for a guest or logged-in user
// @route POST /api/cart
// @access Public
const addToCart = async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  if (
    !productId ||
    !size ||
    !color ||
    !quantity ||
    isNaN(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message:
        "Invalid product data. Please check productId, size, color, and quantity.",
    });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await getCart(userId, guestId);

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId.toString() &&
          p.size === size &&
          p.color === color
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        });
      }

      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      await cart.save();

      return res.status(200).json(cart);
    } else {
      const newCart = new Cart({
        user: userId || null,
        guestId: guestId || `guest_${Date.now()}`,
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });

      await newCart.save();
      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error("Cart error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc Update product quantity in the cart for a guest or logged-in user
// @route PUT /api/cart
// @access Public
const updateQuantity = async (req, res) => {
  const { productId, size, color, quantity, guestId, userId } = req.body;

  if (!productId || !size || !color || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({
      message:
        "Invalid product data. Please check productId, size, color, and quantity.",
    });
  }

  try {
    const cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId.toString() &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      // update quantity
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1); // remove product if quantity is 0
      }

      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Update quantity error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/cart
// @desc Delete a product from the cart
// @access Public

const deleteFromCart = async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body;

  if (!productId || !size || !color) {
    return res.status(400).json({
      message: "Invalid product data. Please check productId, size, and color.",
    });
  }

  try {
    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId.toString() &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1); // remove product from cart

      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Delete from cart error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @route GET /api/cart
// @desc Get cart for a guest or logged-in user
// @access Public

const getCartData = async (req, res) => {
  const { guestId, userId } = req.query;

  // console.log("userId", userId);
  // console.log("getCartData", req.query);

  try {
    const cartData = await getCart(userId, guestId);
    // console.log("cartData", cartData);
    if (!cartData) {
      return res.status(404).json({ message: "Cart not found" });
    }
    return res.status(200).json(cartData);
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @route POST /api/cart/merge
// @desc Merge guest cart with user cart
// @access Public

const mergeCarts = async (req, res) => {
  const { guestId } = req.body;

  try {
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    // If there's no guest cart or it's empty
    if (!guestCart || guestCart.products.length === 0) {
      if (userCart) {
        return res.status(200).json(userCart); // Just return the user cart
      }
      return res.status(404).json({ message: "Guest cart not found or is empty" });
    }

    if (userCart) {
      // Merge guest cart items into the user cart
      guestCart.products.forEach((guestItem) => {
        const existingProductIndex = userCart.products.findIndex(
          (item) =>
            item.productId.toString() === guestItem.productId.toString() &&
            item.size === guestItem.size &&
            item.color === guestItem.color
        );

        if (existingProductIndex > -1) {
          // Update quantity if same product exists
          userCart.products[existingProductIndex].quantity += guestItem.quantity;
        } else {
          // Add new product
          userCart.products.push(guestItem);
        }
      });

      userCart.totalPrice = userCart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await userCart.save();
      await Cart.findOneAndDelete({ guestId }); // Remove guest cart
      return res.status(200).json(userCart);
    } else {
      // No user cart exists, assign guest cart to user
      guestCart.user = req.user._id;
      guestCart.guestId = undefined;
      await guestCart.save();
      return res.status(200).json(guestCart);
    }
  } catch (error) {
    console.error("Merge carts error:", error);
    return res.status(500).json({ message: error.message });
  }
};




module.exports = {
  addToCart,
  updateQuantity,
  deleteFromCart,
  getCartData,
  mergeCarts
};
