import express from "express";
import {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
} from "../controllers/reviewController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Routes for '/'
router.route("/").get(getAllReviews).post(auth, createReview);

// Routes for '/:id'
router.route("/:id").patch(auth, updateReview).delete(auth, deleteReview);
export default router;
