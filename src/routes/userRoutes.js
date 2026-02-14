import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- Public Routes (No Login/Token) ---
router.post("/register", register);
router.post("/login", login);

// --- Protected Routes (Login/Token required) ---
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);
router.delete("/profile", auth, deleteAccount);
router.post("/logout", auth, logout); // for usual exit
router.post("/logoutAll", auth, logoutAll); // for necessary exit

// Reset-password Routes
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

export default router;
