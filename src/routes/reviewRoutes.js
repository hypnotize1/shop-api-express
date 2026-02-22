import express from "express";
import {
  createReview,
  getAllReviews,
} from "../controllers/reviewController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// This route now handles BOTH:
// 1. GET		 /api/reviews
// 2. GET 	 /api/products/:productId/reviews
// 3. POST   /api/products/:productId/reviews
router.route("/").get(getAllReviews).post(auth, createReview);

export default router;
