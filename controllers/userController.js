const User = require("../models/User");
const generateToken = require("../utils/generateToken.js");
const generateOTP = require("../utils/generateOtp.js");
const sendEmail = require("../utils/sendEmail");

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        // If the user is already verified
        return res.status(400).json({
          message: "User already exists and is verified. Please login.",
        });
      } else {
        // If the user is unverified resend OTP and update the OTP & expiry
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // sending the OTP email again
        const emailSent = await sendEmail(
          email,
          "Verify your email",
          `Your OTP is: ${otp}`
        );
        if (!emailSent) {
          return res
            .status(500)
            .json({ message: "Failed to send OTP email. Please try again." });
        }

        // Update the existing user OTP and expiry fields
        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();

        return res.status(200).json({
          message: "OTP re-sent to email. Please verify your account.",
        });
      }
    }

    // If the user doesn't exist, create a new user
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Try sending the OTP email first
    const emailSent = await sendEmail(
      email,
      "Verify your email",
      `Your OTP is: ${otp}`
    );
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP email. Please try again." });
    }

    // Create a new user and save it to the database
    const user = new User({ name, email, password, otp, otpExpiry });
    await user.save();

    res
      .status(201)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  // console.log("Login attempt:", email, password);

  try {
    const user = await User.findOne({ email });
    // console.log("User found:", user);

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
