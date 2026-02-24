import express from "express";
import {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  updateCartItemQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
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

router.patch("/applyCoupon", applyCoupon);
router.delete("/removeCoupon", removeCoupon);

router
  .route("/:itemId")
  .patch(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

export default router;
