import express from "express";
import {
  createProduct,
  getAllProducts,
} from "../controllers/productController.js";
import { auth, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(auth, restrictTo("admin"), createProduct);

export default router;
