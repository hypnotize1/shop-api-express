import express from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/categoryController.js";
import { auth, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(auth, restrictTo("admin"), createCategory);

export default router;
