import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from './routes/product.route.js';
import ordersRoute from './routes/orders.route.js';
import reviewRoutes from "./routes/review.route.js";
import contactRoutes from "./routes/contact.route.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors()
);

/* ===== Middleware ===== */
app.use(express.json());

/* ===== Routes ===== */
app.use("/api/auth", authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', ordersRoute);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);

/* ===== Server ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
