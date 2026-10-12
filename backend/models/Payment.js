// models/Order.js
import mongoose from "mongoose";
import { ORDER_STATUSES } from "../constants/orderStatuses.js";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    amount: Number,
    address: mongoose.Schema.Types.Mixed,

    paymentMethod: {
      type: String,
      enum: ["zelle", "venmo", "cashapp", "crypto"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING_VERIFICATION",
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    paymentId: {
      type: String,
      required: true,
    },
    transactionRef: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
