import express from "express";
import {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCoupon,
  getCoupon,
} from "../controllers/couponController.js";
import { auth, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(auth);
router.use(restrictTo("admin"));
router.route("/").post(createCoupon).get(getAllCoupons);

router.route("/:id").delete(deleteCoupon).patch(updateCoupon).get(getCoupon);

export default router;
