import express from "express";
import multer from "multer";
import {
  register,
  login,
  updateProfile,
  getProfile,
  uploadAvatar,
} from "../controllers/auth.controller.js";
import User from "../models/User.js";
import Orders from "../models/Payment.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/register", register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.post("/profile/avatar", auth, upload.single("avatar"), uploadAvatar);
router.get("/profile", auth, getProfile);

router.get("/count",auth, async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const Orders = (await import("../models/Payment.js")).default;
    const orderCounts = await Orders.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 }, totalSpent: { $sum: "$amount" } } },
    ]);

    const countMap = Object.fromEntries(
      orderCounts.map((row) => [
        String(row._id),
        { count: row.count, totalSpent: row.totalSpent || 0 },
      ])
    );

    const enriched = users.map((user) => ({
      ...user,
      orderCount: countMap[String(user._id)]?.count || 0,
      totalSpent: countMap[String(user._id)]?.totalSpent || 0,
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const Orders = (await import("../models/Payment.js")).default;
    const orders = await Orders.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({ user, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { name, email, phone, role, addresses } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (email !== undefined) {
      const nextEmail = String(email).trim().toLowerCase();
      if (!nextEmail) {
        return res.status(400).json({ message: "Email is required" });
      }
      const existing = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = nextEmail;
    }
    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }
    if (Array.isArray(addresses)) {
      user.addresses = addresses;
    }

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res.json({ message: "User updated successfully", user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin account" });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});


export default router;
