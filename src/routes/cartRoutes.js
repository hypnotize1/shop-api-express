import express from "express";
import {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  updateCartItemQuantity,
  clearCart,
} from "../controllers/cartController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All cart routes should be protected
router.use(auth);

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router
  .route("/:itemId")
  .patch(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

export default router;
