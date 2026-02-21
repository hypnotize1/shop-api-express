import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { auth, restrictTo } from "../middlewares/authMiddleware.js";
import { uploadCategoryImage } from "../utils/upload.js";
import { resizeCategoryImage } from "../middlewares/categoryMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(
    auth,
    restrictTo("admin"),
    uploadCategoryImage,
    resizeCategoryImage,
    createCategory,
  );

// --- Router for '/:id' ---
router
  .route("/:id")
  .patch(
    auth,
    restrictTo("admin"),
    uploadCategoryImage,
    resizeCategoryImage,
    updateCategory,
  )
  .delete(auth, restrictTo("admin"), deleteCategory);

export default router;
