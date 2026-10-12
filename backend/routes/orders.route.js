// routes/order.routes.js
import express from "express";
import Orders from "../models/Payment.js";
import {
  sendOrderEmail,
  sendOrderStatusEmail,
} from "../config/sendEmails.js";
import auth from "../middlewares/auth.middleware.js";
import User from "../models/User.js";
import {
  isValidOrderStatus,
  ORDER_STATUS_META,
} from "../constants/orderStatuses.js";

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/**
 * CREATE ORDER
 */
router.post("/checkout", auth, async (req, res) => {
  try {
    const {
      items,
      amount,
      paymentMethod,
      paymentId,
      addressId,
      recipient,
      shippingAddress,
    } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!paymentId)
      return res.status(400).json({ message: "Payment ID is required" });

    if (!paymentMethod)
      return res.status(400).json({ message: "Payment method is required" });

    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    let baseAddress = null;
    if (addressId) {
      baseAddress = user.addresses.id(addressId);
    } else if (user.addresses?.length) {
      baseAddress = user.addresses[0];
    }

    if (!baseAddress && !shippingAddress)
      return res
        .status(400)
        .json({
          message: "Address not found. Please add an address in your profile.",
        });

    const recipientName = (
      recipient?.name ||
      baseAddress?.fullName ||
      user.name ||
      ""
    ).trim();
    const recipientPhone = (
      recipient?.phone ||
      baseAddress?.phone ||
      user.phone ||
      ""
    ).trim();
    const recipientEmail = (
      recipient?.email ||
      baseAddress?.email ||
      user.email ||
      ""
    ).trim();

    if (!recipientName || !recipientPhone || !recipientEmail) {
      return res.status(400).json({
        message: "Recipient name, phone, and email are required",
      });
    }

    const selectedAddress = {
      fullName: recipientName,
      phone: recipientPhone,
      email: recipientEmail,
      addressLine1:
        shippingAddress?.addressLine1 || baseAddress?.addressLine1 || "",
      addressLine2:
        shippingAddress?.addressLine2 || baseAddress?.addressLine2 || "",
      city: shippingAddress?.city || baseAddress?.city || "",
      state: shippingAddress?.state || baseAddress?.state || "",
      country: shippingAddress?.country || baseAddress?.country || "",
      zipCode: shippingAddress?.zipCode || baseAddress?.zipCode || "",
    };

    if (!selectedAddress.addressLine1 || !selectedAddress.city) {
      return res
        .status(400)
        .json({ message: "A complete shipping address is required" });
    }

    const order = await Orders.create({
      userId: user._id,
      items,
      amount,
      paymentMethod,
      paymentId,
      address: selectedAddress,
      status: "PENDING_VERIFICATION",
      statusHistory: [
        {
          status: "PENDING_VERIFICATION",
          note: "Order placed — awaiting payment verification",
          at: new Date(),
        },
      ],
    });

    let emailSent = false;
    try {
      await sendOrderEmail({
        user: {
          name: recipientName,
          email: recipientEmail,
        },
        items,
        amount,
        paymentMethod,
        paymentId,
        address: selectedAddress,
        orderId: order._id,
        status: order.status,
      });
      emailSent = true;
    } catch (emailErr) {
      console.error(
        "Order email failed (order still saved):",
        emailErr.message || emailErr
      );
    }

    res.status(201).json({
      message: emailSent
        ? "Order created & email sent"
        : "Order created (email could not be sent)",
      order,
      emailSent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Checkout failed", error: err.message });
  }
});

/**
 * CONFIRM PAYMENT (manual)
 */
router.post("/confirm/:orderId", auth, async (req, res) => {
  try {
    const { transactionRef } = req.body;

    const order = await Orders.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });

    order.transactionRef = transactionRef;
    order.paymentStatus = "pending";
    await order.save();

    res.json({ message: "Payment submitted for verification" });
  } catch {
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});

router.get("/allOrders", auth, requireAdmin, async (req, res) => {
  try {
    const orders = await Orders.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * UPDATE ORDER TRACKING STATUS (admin)
 * Sends a status email to the customer for each step.
 */
const updateOrderStatusHandler = async (req, res) => {
  try {
    const { status, note = "", paymentStatus } = req.body;

    if (!status || !isValidOrderStatus(status)) {
      return res.status(400).json({
        message: "Invalid order status",
        allowed: Object.keys(ORDER_STATUS_META),
      });
    }

    const order = await Orders.findById(req.params.orderId).populate(
      "userId",
      "name email"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    const previousStatus = order.status;
    order.status = status;

    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status,
      note: String(note || "").trim(),
      at: new Date(),
    });

    if (
      paymentStatus &&
      ["pending", "paid", "rejected"].includes(paymentStatus)
    ) {
      order.paymentStatus = paymentStatus;
    } else if (
      status === "PAYMENT_VERIFIED" ||
      status === "ORDER_IN_PROCESS" ||
      status === "PACKED" ||
      status === "SHIPPED" ||
      status === "OUT_FOR_DELIVERY" ||
      status === "DELIVERED" ||
      status === "COMPLETED"
    ) {
      order.paymentStatus = "paid";
    } else if (status === "CANCELLED") {
      if (order.paymentStatus === "pending") order.paymentStatus = "rejected";
    }

    await order.save();

    const customerEmail = order.address?.email || order.userId?.email || "";
    const customerName =
      order.address?.fullName || order.userId?.name || "Customer";

    let emailSent = false;
    if (customerEmail) {
      try {
        await sendOrderStatusEmail({
          user: { name: customerName, email: customerEmail },
          order,
          previousStatus,
          status,
          note: String(note || "").trim(),
        });
        emailSent = true;
      } catch (emailErr) {
        console.error(
          "Order status email failed (status still updated):",
          emailErr.message || emailErr
        );
      }
    }

    res.json({
      message: emailSent
        ? "Order status updated and customer notified"
        : "Order status updated (email could not be sent)",
      order,
      emailSent,
    });
  } catch (err) {
    console.error("Order status update failed:", err);
    res.status(500).json({
      message: "Failed to update order status",
      error: err.message,
    });
  }
};

router.patch("/:orderId/status", auth, requireAdmin, updateOrderStatusHandler);
router.put("/:orderId/status", auth, requireAdmin, updateOrderStatusHandler);

router.get("/stats", auth, async (req, res) => {
  try {
    const orders = await Orders.find({});
    const count = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0
    );
    const pendingOrders = orders.filter(
      (order) =>
        order.status === "PENDING_VERIFICATION" ||
        order.paymentStatus === "pending"
    ).length;

    res.json({ count, totalRevenue, pendingOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order stats" });
  }
});

router.get("/recent", auth, async (req, res) => {
  try {
    const orders = await Orders.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
});

export default router;
