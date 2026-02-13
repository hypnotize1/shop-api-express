import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./db/mongoose.js";
import userRouter from "./routes/userRoutes.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", userRouter);

// Routes
app.use("api/users", userRouter);

// Base Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to shop API",
    status: "OK",
  });
});

// Handle undefined Routes
app.all("/.*/", (res, req, next) => {
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
