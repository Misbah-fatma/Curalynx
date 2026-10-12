import Review from "../models/review.js";
import Product from "../models/Product.js";

const recalcProductRating = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return;

  const reviews = await Review.find({ product: productId });
  product.numReviews = reviews.length;
  product.rating =
    reviews.length === 0
      ? 0
      : reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

  await product.save();
};

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const name = String(req.body.name || "").trim();
    const comment = String(req.body.comment || "").trim();
    const rating = Number(req.body.rating);

    if (!name || !comment) {
      return res.status(400).json({ message: "Name and review comment are required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      product: productId,
      name,
      comment,
      rating,
    });

    await recalcProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId }).sort({
      createdAt: -1,
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const reviews = await Review.find({})
      .populate("product", "name image medicineType category price")
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const productId = review.product;
    await review.deleteOne();
    await recalcProductRating(productId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
