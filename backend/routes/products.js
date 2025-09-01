import express from "express";
import { body, validationResult } from "express-validator";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
          $text: {
            $search: req.query.keyword,
            $caseSensitive: false,
            $diacriticSensitive: false,
          },
        }
      : {};
    const category = req.query.category ? { category: req.query.category } : {};
    const minPrice = req.query.minPrice
      ? { price: { $gte: Number(req.query.minPrice) } }
      : {};
    const maxPrice = req.query.maxPrice
      ? { price: { $lte: Number(req.query.maxPrice) } }
      : {};
    const isActive = { isActive: true };

    const count = await Product.countDocuments({
      ...keyword,
      ...category,
      ...minPrice,
      ...maxPrice,
      ...isActive,
    });

    const products = await Product.find({
      ...keyword,
      ...category,
      ...minPrice,
      ...maxPrice,
      ...isActive,
    })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  [
    body("name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Product name is required"),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Product description is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category")
      .isIn([
        "Electronics",
        "Clothing",
        "Books",
        "Home & Garden",
        "Sports",
        "Beauty",
        "Toys",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    body("images")
      .isArray({ min: 1 })
      .withMessage("At least one image is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const product = new Product(req.body);
      const createdProduct = await product.save();

      res.status(201).json({
        success: true,
        data: createdProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product removed",
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post(
  "/:id/reviews",
  protect,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Comment is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      // Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ success: false, message: "Product already reviewed" });
      }

      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();

      res.status(201).json({
        success: true,
        message: "Review added",
      });
    } catch (error) {
      console.error(error);
      if (error.kind === "ObjectId") {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;
