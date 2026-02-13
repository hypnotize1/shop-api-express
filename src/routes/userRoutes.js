import express from "express";
import { register } from "../controllers/userController.js";

const router = express.Router();

// Addresses
// POST /users/register
router.post("/register", register);

export default router;
