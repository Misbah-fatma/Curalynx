import express from "express";
import {
  sendContactEmail,
  sendNewsletterEmail,
} from "../config/sendEmails.js";
import ContactMessage from "../models/ContactMessage.js";
import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.post("/", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim();
    const subject = (req.body.subject || "").trim();
    const message = (req.body.message || "").trim();

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    const saved = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      source: "contact",
    });

    try {
      await sendContactEmail({ name, email, subject, message });
    } catch (emailErr) {
      console.error("Contact form email failed (message still saved):", emailErr.message || emailErr);
    }

    res.json({ message: "Message sent successfully", id: saved._id });
  } catch (err) {
    console.error("Contact form failed:", err.message || err);
    res.status(500).json({ message: "Failed to send message. Please try again." });
  }
});

router.post("/newsletter", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    let subscriber = await NewsletterSubscriber.findOne({ email });
    let isNew = false;

    if (!subscriber) {
      subscriber = await NewsletterSubscriber.create({
        email,
        source: "newsletter",
        status: "active",
      });
      isNew = true;
    } else if (subscriber.status !== "active") {
      subscriber.status = "active";
      await subscriber.save();
      isNew = true;
    }

    if (isNew) {
      try {
        await sendNewsletterEmail({ email });
      } catch (emailErr) {
        console.error(
          "Newsletter email failed (subscription still saved):",
          emailErr.message || emailErr
        );
      }
    }

    res.json({
      message: isNew ? "Subscribed successfully" : "You are already subscribed",
    });
  } catch (err) {
    console.error("Newsletter subscribe failed:", err.message || err);
    res.status(500).json({ message: "Failed to subscribe. Please try again." });
  }
});

router.get("/messages", auth, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json({ messages, source: "contact" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load contact messages" });
  }
});

router.patch("/messages/:id/read", auth, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update message" });
  }
});

router.delete("/messages/:id", auth, requireAdmin, async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Contact message deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

router.get("/newsletter/subscribers", auth, requireAdmin, async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json({ subscribers, source: "newsletter" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load newsletter subscribers" });
  }
});

router.delete("/newsletter/subscribers/:id", auth, requireAdmin, async (req, res) => {
  try {
    const deleted = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Subscriber not found" });
    res.json({ message: "Subscriber removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove subscriber" });
  }
});

export default router;
