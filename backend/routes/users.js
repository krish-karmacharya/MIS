import express from "express";
import User from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User removed",
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isActive =
      req.body.isActive !== undefined ? req.body.isActive : user.isActive;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
