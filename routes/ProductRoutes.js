const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsQuery,
  getSimilarProducts,
  getBestSeller,
  getNewArrivals
} = require("../controllers/ProductController.js");

const { protect, isAdmin } = require("../middlewares/authMiddleware.js");

// Public routes
router.get("/query", getProductsQuery);             
router.get("/queries", getProductsQuery);      
router.get("/bestseller", getBestSeller);  
router.get("/new-arrivals", getNewArrivals);          
router.get("/similar/:id", getSimilarProducts);     
router.get("/:id", getProductById);                 
router.get("/", getAllProducts);  
            



// Admin-only routes
router.post("/", protect, isAdmin, createProduct);
router.put("/update/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);
router.put("/test", (req, res) => {
  res.send("PUT /test is working");
});


module.exports = router;
