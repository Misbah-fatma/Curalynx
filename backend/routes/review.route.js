import express from "express";
import {
  addReview,
  getReviews,
  getAllReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, getAllReviews);
router.delete("/:id", auth, deleteReview);
router.post("/:productId", addReview);
router.get("/:productId", getReviews);

export default router;
