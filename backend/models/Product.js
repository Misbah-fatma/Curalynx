import mongoose from "mongoose";
import { ALLOWED_MEDICINE_TYPES } from "../constants/medicineTypes.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String },
    medicineType: {
      type: String,
      required: true,
      enum: ALLOWED_MEDICINE_TYPES,
    },
    sections: [
      {
        type: {
          type: String,
          enum: ["description", "additional_info", "table", "review"],
          required: true,
        },
        content: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
