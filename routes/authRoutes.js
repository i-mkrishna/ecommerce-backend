const express = require("express");
const passport = require("passport");
const router = express.Router();

// Redirect to Google for login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback from Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Token logic here
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.redirect(`http://localhost:3000?token=${token}`);
  }
);

module.exports = router;
