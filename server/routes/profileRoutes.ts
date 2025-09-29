import { Router } from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profileControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Public: view profile by username
router.get("/:username", verifyToken, getProfile);

// Private: update own profile
router.put("/", verifyToken, updateProfile);

export default router;
