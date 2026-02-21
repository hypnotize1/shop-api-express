import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./db/mongoose.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";
import path from "path";

// Import routers
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import productRouter from "./routes/productRoutes.js";

// Connect to MongoDB
connectDB();
const app = express();

// Middleware
app.use(cors());
app.set("query parser", "extended");
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(path.resolve(), "public")));

// Routes
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);

// Base Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to shop API",
    status: "OK",
  });
});

// Handle undefined Routes
app.all(/.*/, (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Error handler
app.use(globalErrorHandler);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
