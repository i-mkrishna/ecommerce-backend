const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product.js");
const User = require("./models/User.js");
const products = require("./data/products.js");
const Cart = require("./models/Cart.js");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "123456", // Note: Should be hashed in a real app
      role: "admin",
    });

    const userID = createdUser._id;

    const sampleProducts = products.map((p) => ({ ...p, user: userID }));

    await Product.insertMany(sampleProducts);

    console.log("Data seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error.message);
    process.exit(1);
  }
};

connectDB().then(seedData);
