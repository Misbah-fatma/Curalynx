import express from "express";
import auth from "../middlewares/auth.middleware.js";
import Product from "../models/Product.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import {
  ALLOWED_MEDICINE_TYPES,
  REMOVED_MEDICINE_TYPES,
  isAllowedMedicineType,
} from "../constants/medicineTypes.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const activeProductsFilter = {
  medicineType: { $nin: REMOVED_MEDICINE_TYPES, $in: ALLOWED_MEDICINE_TYPES },
};

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      quantity,
      description,
      medicineType,
      sections,
    } = req.body;

    if (!name || !category || price == null || quantity == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!medicineType || !isAllowedMedicineType(medicineType)) {
      return res.status(400).json({
        message:
          "Invalid medicine type. Diabetes Care and Allergy Relief are no longer available.",
      });
    }

    let parsedSections = [];

    if (sections) {
      try {
        parsedSections = JSON.parse(sections);
      } catch (err) {
        return res.status(400).json({ message: "Invalid sections format" });
      }
    }

    let imageUrl = null;

    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      name,
      category,
      price,
      quantity,
      description,
      image: imageUrl,
      medicineType,
      sections: parsedSections,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PRODUCT_SORT_OPTIONS = {
  default: { createdAt: -1 },
  "price-low": { price: 1 },
  "price-high": { price: -1 },
  name: { name: 1 },
};

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 12)
    );
    const sortKey = PRODUCT_SORT_OPTIONS[req.query.sort]
      ? req.query.sort
      : "default";
    const sort = PRODUCT_SORT_OPTIONS[sortKey];
    const medicineType = req.query.medicineType || req.query.type;
    const wantsPagination =
      req.query.page != null || req.query.limit != null;

    const filter = { ...activeProductsFilter };

    if (medicineType) {
      if (!isAllowedMedicineType(medicineType)) {
        if (wantsPagination) {
          return res.json({
            products: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          });
        }
        return res.json([]);
      }
      filter.medicineType = medicineType;
    }

    if (wantsPagination) {
      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      return res.json({
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      });
    }

    const products = await Product.find(filter).sort(sort);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/count", auth, async (req, res) => {
  try {
    const count = await Product.countDocuments(activeProductsFilter);
    const lowStock = await Product.countDocuments({
      ...activeProductsFilter,
      quantity: { $lte: 10 },
    });
    res.json({ count, lowStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      ...activeProductsFilter,
    });
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update/:id", auth, async (req, res) => {
  try {
    if (
      req.body.medicineType != null &&
      !isAllowedMedicineType(req.body.medicineType)
    ) {
      return res.status(400).json({
        message:
          "Invalid medicine type. Diabetes Care and Allergy Relief are no longer available.",
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
