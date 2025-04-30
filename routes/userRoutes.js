const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyOTP,
  getUserProfile
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware.js");

// Email/Password Auth
router.post("/register", registerUser);
router.post("/verify", verifyOTP);
router.post("/login", loginUser);
// router.get("/profile", getUserProfile);


// Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/profile", protect, async (req, res) => {
  console.log(req.user);
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// need working(understanding)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Generate a token after successful login
    const userToken = require("../utils/generateToken.js")(req.user._id);
    console.log("Generated token :  ", userToken);
    // Option 1: Redirect with token
    res.redirect(`http://localhost:5173/google/success?token=${userToken}`);
    // Option 2 (if using client fetch): res.json({ token });
  }
);

module.exports = router;
