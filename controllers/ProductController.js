const Product = require("../models/Product.js");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !sku ||
      !Array.isArray(sizes) ||
      sizes.length === 0 ||
      !Array.isArray(colors) ||
      colors.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Required fields are missing or invalid." });
    }

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Invalid product data", error: err.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.discountPrice = req.body.discountPrice || product.discountPrice;
    product.countInStock = req.body.countInStock || product.countInStock;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.sizes = req.body.sizes || product.sizes;
    product.colors = req.body.colors || product.colors;
    product.collections = req.body.collections || product.collections;
    product.material = req.body.material || product.material;
    product.gender = req.body.gender || product.gender;
    product.images = req.body.images || product.images;
    product.isFeatured =
      req.body.isFeatured !== undefined
        ? req.body.isFeatured
        : product.isFeatured;
    product.isPublished =
      req.body.isPublished !== undefined
        ? req.body.isPublished
        : product.isPublished;
    product.tags = req.body.tags || product.tags;
    product.dimensions = req.body.dimensions || product.dimensions;
    product.weight = req.body.weight || product.weight;
    product.sku = req.body.sku || product.sku;

    // Mark specific fields as modified (if necessary)
    product.markModified("dimensions");
    product.markModified("images");

    const updatedProduct = await product.save();
    res.status(200).json({ message: "Product updated", updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get all products with optional query filters
// @access Public
// @route GET /api/products/query
exports.getProductsQuery = async (req, res) => {

  try {
    const {
      collection,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    // Search in name or description (case-insensitive)
    // if (search) {
    //   query.$or = [
    //     { name: { $regex: search, $options: "i" } },
    //     { description: { $regex: search, $options: "i" } },
    //   ];
    // }

    // Filters
    
    if (collection && collection.toLowerCase() !== "all")
      query.collections = collection;

    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }
      

    if (material) {
      query.material = { $in: material.split(",") };
    }
    if (brand) {
      query.brand = { $in: brand.split(",") };
    }
    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query.colors = { $in: [color] };
    }

    if (gender) {
      query.gender = gender;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$and = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit) || 0);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route Get /api/products/similar/:id
// @desc Retrive similar products based on the current product's gender and category
// @access Public
exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const similarProducts = await Product.find({
      _id: { $ne: product._id }, // Exclude the current product
      gender: product.gender,
      category: product.category,
    }).limit(4); // Limit to 4 similar products
    res.status(200).json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "similar product error" });
  }
};

// @route Get /api/products/best-seller
// @desc Retrive the product with highest rating
// @access Public
exports.getBestSeller = async (req, res) => {
  try {
    const bestSeller = await Product.findOne({}).sort({ rating: -1 });
    if (!bestSeller) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(bestSeller);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route Get /api/products/new-arrivals
// @desc Retrive latest 8 products - Creation date
// @access Public
exports.getNewArrivals = async (req, res) => {
  try {
    const newArrivals = await Product.find({}).sort({ createdAt: -1 }).limit(8);
    if (!newArrivals)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
