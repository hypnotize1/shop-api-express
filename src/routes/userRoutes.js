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
  refreshAuthToken,
} from "../controllers/userController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- Public Routes (No Login/Token) ---
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAuthToken);

// --- Protected Routes (Login/Token required) ---
router
  .route("/profile")
  .get(auth, getProfile)
  .patch(auth, updateProfile)
  .delete(auth, deleteAccount);
router.post("/logout", auth, logout); // for usual exit
router.post("/logoutAll", auth, logoutAll); // for necessary exit

// Reset-password Routes
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

export default router;
