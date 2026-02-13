import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount,
  logout,
  logoutAll,
} from "../controllers/userController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Routes (Login required)
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);
router.delete("/profile", auth, deleteAccount);

// Logout Routes
router.post("/logout", auth, logout); // for usual exit
router.post("/logoutAll", auth, logoutAll); // for necessary exit

export default router;
