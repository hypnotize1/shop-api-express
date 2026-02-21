import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { auth, restrictTo } from "../middlewares/authMiddleware.js";
import { uploadProductImage } from "../utils/upload.js";
import { resizeProductImages } from "../middlewares/productMiddleware.js";

const router = express.Router();

// Routes for '/'
router
  .route("/")
  .get(getAllProducts) // Public: Get all products
  .post(
    auth,
    restrictTo("admin"),
    uploadProductImage,
    resizeProductImages,
    createProduct,
  ); // Admin: Create product

// Route for '/:id'
router
  .route("/:id")
  .get(getProduct) // Public: Get product by ID
  .patch(auth, restrictTo("admin"), updateProduct) // Admin: Update product by ID
  .delete(auth, restrictTo("admin"), deleteProduct); // Admin: Delete product by ID

export default router;
