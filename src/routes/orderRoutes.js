import express from "express";
import { createOrder } from "../controllers/orderController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, createOrder);

export default router;
