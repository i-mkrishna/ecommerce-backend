const express = require("express");
const User = require("../models/User.js");
const { protect, isAdmin } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/data", protect, isAdmin, async (req, res) => {
  res.json({ message: "Only admin can see this" });
});

// @route GET /api/admin/users
// @desc Get all users(Admin only)
// @access Private/Admin

router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/admin
// @desc Add a new user (Admin only)
// @access Private/Admin

router.post("/", protect, isAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      // console.log(user);
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ name, email, password, role: role || "customer" });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route PUT /api/admin/users/:id
// @desc Update user info (Admin only) -NAme, email and role
// @access Private/Admin

router.put("/users/:id", protect, isAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  // console.log(userId);

  // Validate input
  if (!role || !userId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user._id.toString() === userId && role && role !== user.role) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    // Update user info
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/admin/users/:id
// @desc Delete a user (Admin only)
// @access Private/Admin

router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  const userId = req.params.id;

  console.log(userId);

  try {
    // Optional: prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
