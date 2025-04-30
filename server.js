const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const ProductRoutes = require("./routes/ProductRoutes");
const CartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscribeRoutes = require("./routes/subscriberRoute");
const productAdminRoutes = require("./routes/productAdminRoutes");
const orderAdminRoutes = require("./routes/orderAdminRoutes");

const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./config/passport");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config();

const PORT = process.env.PORT || 8000;

connectDB();

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to Rabbit kp!");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subscribeRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", orderAdminRoutes);

app.use(
  session({
    secret: "keyboard cat", // secure this in production
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Use the admin routes
app.use("/api/admin", adminRoutes); // checking something

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is  running on http://localhost:${PORT}`);
});
